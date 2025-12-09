import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import api, { Parent } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

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
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Laster kontaktinfo...</Text>
      </View>
    );
  }

  if (error || !parent) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Kunne ikke laste kontaktinfo'}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchParentInfo}>
          <Text style={styles.buttonText}>Prøv igjen</Text>
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Lagre endringer</Text>
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
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#003366',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#003366',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
});
