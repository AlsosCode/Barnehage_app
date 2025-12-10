import { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,} from "react-native";
import api from "@/services/api";
export default function CreateParentScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      Alert.alert("Feil", "Vennligst fyll ut alle påkrevde felt.");
      return;
    }

    try {
      await api.parents.create(form);
      Alert.alert("Suksess!", "Foreldreprofil er opprettet.");

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      Alert.alert("Feil", "Kunne ikke opprette forelder.");
      console.error(err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Opprett foreldreprofil</Text>
        <Text style={styles.subtitle}>Fyll ut informasjonen nedenfor.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Navn *</Text>
        <TextInput
          style={styles.input}
          placeholder="F.eks. Kari Nordmann"
          value={form.name}
          onChangeText={(v) => handleChange("name", v)}
        />

        <Text style={styles.label}>E-post *</Text>
        <TextInput
          style={styles.input}
          placeholder="kari@epost.no"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => handleChange("email", v)}
        />

        <Text style={styles.label}>Telefon *</Text>
        <TextInput
          style={styles.input}
          placeholder="12345678"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => handleChange("phone", v)}
        />

        <Text style={styles.label}>Adresse</Text>
        <TextInput
          style={styles.input}
          placeholder="Gateadresse"
          value={form.address}
          onChangeText={(v) => handleChange("address", v)}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Opprett forelder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 6 },

  formCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});