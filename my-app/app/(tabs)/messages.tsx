import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";


const API_BASE_URL = "http://10.0.0.61:3002";

type Message = {
  _id?: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt?: string;
};

const CURRENT_USER = "parent1";
const OTHER_USER = "staff1";

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/${CURRENT_USER}/${OTHER_USER}`
      );
      if (!res.ok) {
        throw new Error(`Status: ${res.status}`);
      }
      const data = (await res.json()) as Message[];
      setMessages(data);
    } catch (err) {
      console.log("Feil ved henting av meldinger:", err);
      setError(
        "Klarte ikke å hente meldinger fra serveren. Prøv igjen senere."
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const newMessage: Message = {
      senderId: CURRENT_USER,
      receiverId: OTHER_USER,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) {
        throw new Error(`Status: ${res.status}`);
      }

      const body = await res.json();
      const saved = (body && body.message) || newMessage;

      setMessages((prev) => [...prev, saved]);
      setText("");
    } catch (err) {
      console.log("Feil ved sending av melding:", err);
      // her velger vi å vise den lokalt uansett, for å gi flyt i brukeropplevelsen
      setError("Klarte ikke å sende til serveren. Meldingen vises bare lokalt.");
      setMessages((prev) => [...prev, newMessage]);
      setText("");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === CURRENT_USER;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageMeta}>{isMe ? "Deg" : "Barnehagen"}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Meldinger</Text>
        <Text style={styles.subtitle}>
          Dialog mellom forelder ({CURRENT_USER}) og barnehage ({OTHER_USER})
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>Laster meldinger…</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) => item._id ?? index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Skriv melding…"
          value={text}
          onChangeText={setText}
        />
        <Button
          title={sending ? "Sender…" : "Send"}
          onPress={sendMessage}
          disabled={sending}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: "#1D4ED8",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#e5e7eb",
    alignSelf: "flex-start",
  },
  messageText: { color: "#111827" },
  messageMeta: { fontSize: 10, marginTop: 4, color: "#6b7280" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
});
