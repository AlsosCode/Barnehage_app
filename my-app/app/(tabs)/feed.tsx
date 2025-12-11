import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

const API_BASE_URL = "http://10.0.0.61:3002";

type FeedPost = {
  _id?: string;
  authorId: string;
  text: string;
  createdAt?: string;
};

const AUTHOR_ID = "staff1";

export default function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/feed`);
      if (!res.ok) {
        throw new Error(`Status: ${res.status}`);
      }
      const data = (await res.json()) as FeedPost[];
      setPosts(data);
    } catch (err) {
      console.log("Feil ved henting av feed:", err);
      setError(
        "Klarte ikke å hente feed fra serveren. Viser bare lokale innlegg hvis du legger inn noe nå."
      );
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async () => {
    if (!text.trim()) return;

    const newPost: FeedPost = {
      authorId: AUTHOR_ID,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setPublishing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/feed/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!res.ok) {
        throw new Error(`Status: ${res.status}`);
      }
      const body = await res.json();
      const saved = (body && body.post) || newPost;

      setPosts((prev) => [saved, ...prev]);
      setText("");
    } catch (err) {
      console.log("Feil ved publisering:", err);
      setError(
        "Klarte ikke å lagre innlegget på serveren. Det vises bare lokalt."
      );
      setPosts((prev) => [newPost, ...prev]);
      setText("");
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const renderItem = ({ item }: { item: FeedPost }) => {
    const created = item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "";
    return (
      <View style={styles.card}>
        <Text style={styles.author}>{item.authorId}</Text>
        {created ? <Text style={styles.date}>{created}</Text> : null}
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barnehagefeed</Text>
      <Text style={styles.subtitle}>
        Oppdateringer fra ansatte til foreldre
      </Text>

      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="Skriv en oppdatering…"
          multiline
          value={text}
          onChangeText={setText}
        />
        <Button
          title={publishing ? "Publiserer…" : "Publiser"}
          onPress={publishPost}
        />
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text>Laster feed…</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={posts}
        keyExtractor={(item, index) => item._id ?? index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 16,
    marginTop: 4,
  },
  inputCard: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    gap: 8,
  },
  input: {
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  listContent: { paddingBottom: 24 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  author: { fontWeight: "600" },
  date: { fontSize: 10, color: "#6b7280", marginBottom: 6 },
  text: { fontSize: 14 },
  center: { alignItems: "center", justifyContent: "center", padding: 16 },
  errorText: { color: "#b91c1c", fontSize: 12, marginBottom: 8 },
});
