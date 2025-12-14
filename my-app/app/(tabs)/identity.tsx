import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api, { Parent } from "@/services/api";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function IdentityScreen() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const data = await api.parents.getAll();
      setParents(data);
    } catch (error) {
      console.error("Feil ved henting av foreldre:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (parent: Parent) => {
    if ((parent as any).verified === true) {
      Alert.alert("Info", `${parent.name} er allerede verifisert.`);
      return;
    }

    try {
      setSavingId(parent.id);
      await api.parents.update(parent.id, { verified: true });

      Alert.alert("Suksess", `${parent.name} er nå verifisert.`);

      // Oppdater listen
      fetchParents();
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke verifisere identitet.");
      console.error(error);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.secondary} />
        <Text style={styles.loadingText}>Laster foreldre...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bekrefte identitet</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.parentsSection}>
          <Text style={styles.subtitle}>Trykk på en bruker for å bekrefte identiteten.</Text>

          <FlatList
            data={parents}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.parentInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.parentDetails}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  disabled={savingId === item.id || (item as any).verified}
                  style={[
                    styles.button,
                    (item as any).verified && styles.buttonDone,
                    (savingId === item.id || (item as any).verified) && styles.buttonDisabled
                  ]}
                  onPress={() => handleVerify(item)}
                  activeOpacity={0.7}
                >
                  {savingId === item.id ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {(item as any).verified ? "Bekreftet" : "Bekreft"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
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
  greeting: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  content: {
    flex: 1,
  },
  parentsSection: {
    padding: Spacing.lg,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.lg,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  parentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.base,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  avatarText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  parentDetails: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  email: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDone: {
    backgroundColor: Colors.light.success,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabled,
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
});
