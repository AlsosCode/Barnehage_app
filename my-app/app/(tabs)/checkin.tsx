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

export default function CheckInScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
        <ActivityIndicator size="large" color="#0000ff" />
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
              item.status === "checked_in" && styles.checkedIn,
              item.status === "home" && styles.home,
            ]}
            onPress={() => handleCheckin(item)}
          >
            <View style={styles.childInfo}>
              <Text style={styles.childText}>{item.name}</Text>
              <Text style={styles.groupText}>{item.group}</Text>
            </View>

            <View style={styles.statusBadge}>
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
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  childButton: {
    padding: 15,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  childInfo: {
    flex: 1,
  },
  childText: {
    fontSize: 18,
    fontWeight: "600",
  },
  groupText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  checkedIn: {
    backgroundColor: "#b7f7c3",
  },
  home: {
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
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
