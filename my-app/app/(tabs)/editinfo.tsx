import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from "react-native";
import api, { Parent } from "@/services/api";

export default function EditInfoScreen() {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Redigere kontaktinfo</Text>
      <Text style={styles.subtitle}>Oppdater din kontaktinformasjon</Text>

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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
    marginHorizontal: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
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
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
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
