import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function CreateParent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  async function submit() {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Feil', 'Vennligst fyll ut alle feltene');
      return;
    }

    console.log("👉 Submit pressed");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3002/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          childrenIds: []
        })
      });

      const data = await res.json();
      console.log("📩 Server response:", data);

      if (res.ok) {
        console.log("✅ Forelder ble opprettet!");
        Alert.alert('Suksess', 'Forelder ble opprettet!');
        setName("");
        setEmail("");
        setPhone("");
      } else {
        console.log("❌ Feil ved opprettelse:", data);
        Alert.alert('Feil', 'Kunne ikke opprette forelder. Prøv igjen.');
      }

    } catch (err) {
      console.log("🚨 Serverfeil:", err);
      Alert.alert('Feil', 'Kunne ikke koble til server. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Opprett forelder</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formSection}>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Navn</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="F.eks. Kari Hansen"
                placeholderTextColor={Colors.light.inputPlaceholder}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-post</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="epost@example.com"
                placeholderTextColor={Colors.light.inputPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="12345678"
                placeholderTextColor={Colors.light.inputPlaceholder}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              onPress={submit}
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.light.textWhite} />
              ) : (
                <Text style={styles.submitButtonText}>
                  Opprett forelder
                </Text>
              )}
            </TouchableOpacity>
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
  formSection: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
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
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  submitButtonText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabled,
    opacity: 0.5,
  },
});
