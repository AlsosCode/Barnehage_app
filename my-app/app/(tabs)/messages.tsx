import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';


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
  const { logout } = useAuth();
  const router = useRouter();

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
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
        <Text style={[styles.messageMeta, isMe && styles.myMessageMeta]}>{isMe ? "Deg" : "Barnehagen"}</Text>
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
        <View>
          <Text style={styles.title}>Meldinger</Text>
          <Text style={styles.subtitle}>
            Dialog mellom forelder og barnehage
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.light.secondary} />
            <Text style={styles.loadingText}>Laster meldinger…</Text>
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
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Skriv melding…"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={sending || !text.trim()}
        >
          <Text style={styles.sendButtonText}>
            {sending ? "Sender…" : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    backgroundColor: Colors.light.buttonDanger,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: 5,
  },
  logoutText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textWhite,
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  myMessage: {
    backgroundColor: Colors.light.primary,
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: Colors.light.card,
    alignSelf: "flex-start",
    ...Shadows.small,
  },
  messageText: {
    color: Colors.light.text,
    fontSize: Typography.fontSize.base,
  },
  myMessageText: {
    color: Colors.light.textWhite,
  },
  messageMeta: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    color: Colors.light.textSecondary,
  },
  myMessageMeta: {
    color: Colors.light.textWhite,
    opacity: 0.8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.inputBackground,
    fontSize: Typography.fontSize.md,
  },
  sendButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sendButtonText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    flex: 1,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: Typography.fontSize.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
    padding: Spacing.md,
    backgroundColor: Colors.light.errorLight,
    borderRadius: BorderRadius.md,
    margin: Spacing.lg,
  },
});
