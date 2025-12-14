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
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api from "@/services/api";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function CreateActivityScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nytt innlegg</Text>
          <Text style={styles.subtitle}>Del dagens aktiviteter med foreldrene</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tittel</Text>
            <TextInput
              style={styles.input}
              placeholder="F.eks. Tur til skogen"
              placeholderTextColor={Colors.light.inputPlaceholder}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beskrivelse</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Beskriv hva dere gjorde i dag..."
              placeholderTextColor={Colors.light.inputPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gruppe (valgfritt)</Text>
            <TextInput
              style={styles.input}
              placeholder="F.eks. Blå gruppe"
              placeholderTextColor={Colors.light.inputPlaceholder}
              value={group}
              onChangeText={setGroup}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateActivity}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.light.textWhite} />
            ) : (
              <Text style={styles.buttonText}>Publiser aktivitet</Text>
            )}
          </TouchableOpacity>
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
  },
  formCard: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.base,
    fontSize: Typography.fontSize.md,
    backgroundColor: Colors.light.inputBackground,
    color: Colors.light.text,
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 120,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
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
});
