import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

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
  const { logout } = useAuth();
  const router = useRouter();

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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Feed</Text>
          <Text style={styles.subtitle}>
            Oppdateringer fra ansatte til foreldre
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
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Skriv en oppdatering…"
            multiline
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            style={styles.publishButton}
            onPress={publishPost}
            disabled={publishing || !text.trim()}
          >
            <Text style={styles.publishButtonText}>
              {publishing ? "Publiserer…" : "Publiser"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.light.secondary} />
            <Text style={styles.loadingText}>Laster feed…</Text>
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
    </View>
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
    padding: Spacing.lg,
  },
  inputCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  input: {
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.inputBackground,
    fontSize: Typography.fontSize.md,
  },
  publishButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
  },
  publishButtonText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  author: {
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  date: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  text: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.light.errorLight,
    borderRadius: BorderRadius.md,
  },
});
