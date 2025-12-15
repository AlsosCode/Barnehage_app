import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import api, { Parent } from "@/services/api";
import { Palette } from '@/constants/theme';

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
    const target = !(parent.verified ?? false);
    try {
      setSavingId(parent.id);
      // Optimistisk oppdatering
      setParents(prev => prev.map(p => p.id === parent.id ? { ...p, verified: target } as Parent : p));
      const updated = await api.parents.verify(parent.id, target);
      setParents(prev => prev.map(p => p.id === updated.id ? { ...p, verified: updated.verified ?? target } : p));
      Alert.alert("Suksess", `${parent.name} er ${target ? 'nå verifisert' : 'ikke lenger verifisert'}.`);
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke oppdatere identitet.");
      console.error(error);
      // Rollback dersom noe feilet
      setParents(prev => prev.map(p => p.id === parent.id ? { ...p, verified: parent.verified ?? false } as Parent : p));
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
      <Text style={styles.subtitle}>Trykk på en bruker for å bekrefte eller angre.</Text>

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
              style={[
                styles.button,
                (item.verified ?? false) && styles.buttonDone
              ]}
              onPress={() => handleVerify(item)}
              disabled={savingId === item.id}
            >
              {savingId === item.id ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {(item.verified ?? false) ? "Angre" : "Bekreft"}
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
  container: { padding: 20, flex: 1, backgroundColor: '#F5F7FB' },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: '#003366' },
  subtitle: { fontSize: 16, marginBottom: 20, color: "#4B5563" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: "600", color: '#111827' },
  email: { color: "#6B7280", marginTop: 3 },
  button: {
    backgroundColor: Palette.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  buttonDone: {
    backgroundColor: Palette.success,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
