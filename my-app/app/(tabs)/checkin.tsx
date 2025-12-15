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
import { useFocusEffect } from "expo-router";
import { Palette } from '@/constants/theme';
import { ChildStatus } from '@/constants/statuses';
import { useLogger } from '@/hooks/useLogger';

export default function CheckInScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { log, error: logError } = useLogger('CheckInScreen');

  const fetchChildren = useCallback(async () => {
    try {
      setLoading(true);
      log('Fetching children for check-in');
      const data = await api.children.getAll();
      setChildren(data);
      setError(null);
    } catch (error) {
      const errorMsg = "Kunne ikke hente barn. Sjekk at serveren kjører.";
      setError(errorMsg);
      logError(errorMsg, { error });
    } finally {
      setLoading(false);
    }
  }, [log, logError]);

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [fetchChildren])
  );

  const handleCheckin = async (child: Child) => {
    try {
      if (processingId === child.id) return;
      if (child.status === ChildStatus.CHECKED_IN) {
        Alert.alert("Info", `${child.name} er allerede sjekket inn.`);
        return;
      }

      log(`Checking in ${child.name}`);
      setProcessingId(child.id);
      await api.children.checkIn(child.id);

      Alert.alert("Suksess", `${child.name} er sjekket inn!`);
      await fetchChildren();
    } catch (error) {
      logError("Error checking in child", { error });
      Alert.alert("Feil", "Kunne ikke sjekke inn barnet. Prøv igjen.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.text}>Laster barn...</Text>
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
      <Text style={styles.title}>Registrere Check-In</Text>
      <Text style={styles.text}>Trykk på barnet for å check-in.</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Søk etter barn..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredChildren}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.childButton,
              item.status === "checked_in" && styles.childButtonIn,
              item.status === "home" && styles.childButtonHome,
            ]}
            disabled={processingId === item.id}
            onPress={() => handleCheckin(item)}
          >
            <View style={styles.childInfo}>
              <Text style={styles.childText}>{item.name}</Text>
              <Text style={styles.groupText}>{item.group}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                item.status === 'checked_in' && styles.statusIn,
                item.status === 'checked_out' && styles.statusOut,
                item.status === 'home' && styles.statusHome,
              ]}
            >
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
  );
}

// Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FB',
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#003366',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    color: '#4B5563',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#d0d4dd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  childButton: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  childButtonIn: {
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  childButtonHome: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childInfo: {
    flex: 1,
  },
  childText: {
    fontSize: 18,
    fontWeight: "600",
    color: '#111827',
  },
  groupText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: '#111827',
  },
  statusIn: { backgroundColor: '#DCFCE7' },
  statusOut: { backgroundColor: '#FEE2E2' },
  statusHome: { backgroundColor: '#E5E7EB' },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
