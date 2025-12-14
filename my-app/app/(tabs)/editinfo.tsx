import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import api, { Parent } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function EditInfoScreen() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const router = useRouter();

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // For demo: henter første forelder
  // I ekte app: bruk innlogget forelder
  useEffect(() => {
    fetchParentInfo();
  }, []);

  const fetchParentInfo = async () => {
    try {
      setLoading(true);
      const parents = await api.parents.getAll();

      if (parents.length > 0) {
        const parentData = parents[0];
        setParent(parentData);
        setName(parentData.name);
        setEmail(parentData.email);
        setPhone(parentData.phone);
        setAddress(parentData.address);
      } else {
        setError('Ingen foreldreinfo funnet');
      }
      setError(null);
    } catch (err) {
      setError('Kunne ikke hente kontaktinfo. Sjekk at serveren kjører.');
      console.error('Error fetching parent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parent) return;

    // Validering
    if (!name.trim()) {
      Alert.alert('Feil', 'Navn kan ikke være tomt');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Feil', 'E-post kan ikke være tom');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Feil', 'Telefon kan ikke være tomt');
      return;
    }

    try {
      setSaving(true);
      await api.parents.update(parent.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      Alert.alert('Suksess', 'Kontaktinfo oppdatert!');
      await fetchParentInfo();
    } catch (err) {
      Alert.alert('Feil', 'Kunne ikke lagre endringer. Prøv igjen.');
      console.error('Error saving parent info:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.secondary} />
        <Text style={styles.loadingText}>Laster kontaktinfo...</Text>
      </View>
    );
  }

  if (error || !parent) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Kunne ikke laste kontaktinfo'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchParentInfo}>
          <Text style={styles.retryText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kontaktinfo</Text>
          <Text style={styles.subtitle}>Oppdater din kontaktinformasjon</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Navn</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Ditt navn"
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-post</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="din@epost.no"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="12345678"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              style={[styles.input, styles.textArea]}
              placeholder="Din adresse"
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.light.inputPlaceholder}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.light.textWhite} />
            ) : (
              <Text style={styles.saveButtonText}>Lagre endringer</Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Denne informasjonen brukes av barnehagen for å kontakte deg.
            </Text>
          </View>
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
  },
  form: {
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
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize.md,
    backgroundColor: Colors.light.inputBackground,
    color: Colors.light.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabled,
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoBox: {
    backgroundColor: Colors.light.successLight,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    lineHeight: 20,
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
