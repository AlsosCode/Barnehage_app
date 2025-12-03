import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import api, { Parent } from "@/services/api";

export default function IdentityScreen() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

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
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Laster foreldre...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bekrefte identitet</Text>
      <Text style={styles.subtitle}>Trykk på en bruker for å bekrefte identiteten.</Text>

      <FlatList
        data={parents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>

            <TouchableOpacity
              disabled={savingId === item.id}
              style={[
                styles.button,
                (item as any).verified && styles.buttonDone
              ]}
              onPress={() => handleVerify(item)}
            >
              {savingId === item.id ? (
                <ActivityIndicator color="white" />
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
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20, color: "#555" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  name: { fontSize: 18, fontWeight: "600" },
  email: { color: "#666", marginTop: 3 },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonDone: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});