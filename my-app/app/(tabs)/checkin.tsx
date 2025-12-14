import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import api, { Child } from "@/services/api";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function CheckInScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { logout } = useAuth();
  const router = useRouter();

  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.children.getAll();
      setChildren(data);
      setError(null);
    } catch (error) {
      setError("Kunne ikke hente barn. Sjekk at serveren kjører.");
      console.error("Error fetching children", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [fetchChildren])
  );

  const handleCheckin = async (child: Child) => {
    try {
      if (child.status === "checked_in") {
        Alert.alert("Info", `${child.name} er allerede sjekket inn.`);
        return;
      }

      // Sjekker inn barnet via API
      await api.children.checkIn(child.id);

      Alert.alert("Suksess", `${child.name} er sjekket inn!`);

      // Oppdaterer listen
      await fetchChildren();
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke sjekke inn barnet. Prøv igjen.");
      console.error("Error checking in child", error);
    }
  };

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.secondary} />
        <Text style={styles.loadingText}>Laster barn...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChildren}>
          <Text style={styles.retryText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Check-In</Text>
          <Text style={styles.subtitle}>Trykk på barnet for å sjekke inn</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Søk etter barn..."
          placeholderTextColor={Colors.light.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          data={filteredChildren}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.childCard,
                item.status === "checked_in" && styles.checkedIn,
                item.status === "home" && styles.home,
              ]}
              onPress={() => handleCheckin(item)}
            >
              <View style={styles.childInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.childDetails}>
                  <Text style={styles.childText}>{item.name}</Text>
                  <Text style={styles.groupText}>{item.group}</Text>
                </View>
              </View>

              <View style={[
                styles.statusBadge,
                item.status === "checked_in" && styles.statusIn,
                item.status === "checked_out" && styles.statusOut,
                item.status === "home" && styles.statusHome,
              ]}>
                <Text style={styles.statusText}>
                  {item.status === "checked_in" && "✓ Inne"}
                  {item.status === "checked_out" && "✓ Ute"}
                  {item.status === "home" && "Hjemme"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
  centered: {
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
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.light.card,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
    ...Shadows.small,
  },
  childCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.medium,
  },
  childInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  childDetails: {
    flex: 1,
  },
  childText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  groupText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  statusIn: {
    backgroundColor: Colors.light.successLight,
  },
  statusOut: {
    backgroundColor: Colors.light.warningLight,
  },
  statusHome: {
    backgroundColor: Colors.light.errorLight,
  },
  checkedIn: {
    backgroundColor: Colors.light.successLight,
    borderWidth: 2,
    borderColor: Colors.light.success,
  },
  home: {
    opacity: 0.7,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
