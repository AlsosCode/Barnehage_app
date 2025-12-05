import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "@/services/api";

export default function CreateActivityScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateActivity = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Mangler informasjon", "Skriv inn både tittel og beskrivelse.");
      return;
    }

    try {
      setLoading(true);

      await api.activities.create({
        title: title.trim(),
        description: description.trim(),
        group: group.trim() || undefined,
      });

      Alert.alert("Lagret", "Aktiviteten er lagt til i feeden.");
      setTitle("");
      setDescription("");
      setGroup("");
    } catch (error) {
      console.error("Error creating activity", error);
      Alert.alert(
        "Feil",
        "Kunne ikke lagre aktiviteten. Sjekk at backend kjører og prøv igjen."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nytt innlegg</Text>
      <Text style={styles.subtitle}>Del dagens aktiviteter med foreldrene.</Text>

      <TextInput
        style={styles.input}
        placeholder="Tittel på aktivitet (f.eks. Tur til skogen)"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="Beskriv hva dere gjorde i dag..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        placeholder="Gruppe (valgfritt, f.eks. Blå gruppe)"
        value={group}
        onChangeText={setGroup}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateActivity}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Publiser aktivitet</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 120,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
