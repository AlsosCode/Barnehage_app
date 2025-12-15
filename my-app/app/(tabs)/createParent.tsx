import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Modal, ScrollView, Pressable } from 'react-native';
import { Palette } from '@/constants/theme';
import { API_BASE_URL } from '@/services/api';

const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, '');

export default function CreateParent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptAccuracy, setAcceptAccuracy] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(false);

  const acceptedAll = acceptPrivacy && acceptAccuracy && acceptNotifications;

  async function submit() {
    console.log('👉 Submit pressed');

    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Feil', 'Navn, e-post og telefon må fylles ut.');
      return;
    }

    if (!acceptedAll) {
      setShowGuidelines(true);
      Alert.alert('Retningslinjer', 'Du må godta retningslinjene før du kan opprette brukeren.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${normalizedBaseUrl}/parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          childrenIds: [],
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Ignorer hvis body er tom
      }

      console.log('📩 Server response:', data);

      if (res.ok) {
        console.log('✅ Forelder ble opprettet!');
        Alert.alert('Suksess', 'Forelder ble opprettet.');
        setName('');
        setEmail('');
        setPhone('');
      } else {
        const message =
          (data && typeof data.error === 'string' && data.error) ||
          'Feil ved opprettelse av forelder.';
        console.log('❌ Feil ved opprettelse:', data);
        Alert.alert('Feil', message);
      }
    } catch (err) {
      console.log('🚨 Serverfeil:', err);
      Alert.alert('Feil', 'Kunne ikke kontakte serveren.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opprett forelder</Text>

      <Text style={styles.label}>Navn</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="F.eks. Kari Hansen"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>E-post</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="epost@example.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Telefon</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="12345678"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        onPress={submit}
        style={[styles.button, (loading || !acceptedAll) && styles.buttonDisabled]}
        disabled={loading || !acceptedAll}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Opprett forelder</Text>
        )}
      </TouchableOpacity>

      {/* Retningslinjer modal */}
      <Modal
        visible={showGuidelines}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGuidelines(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Retningslinjer</Text>
              <Text style={styles.modalSubtitle}>Vennligst les og godkjenn for å fortsette.</Text>

              <Pressable style={styles.checkboxRow} onPress={() => setAcceptPrivacy(v => !v)}>
                <View style={[styles.checkbox, acceptPrivacy && styles.checkboxChecked]}>
                  {acceptPrivacy && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Jeg samtykker til behandling av personopplysninger i tråd med personvernreglene.</Text>
              </Pressable>

              <Pressable style={styles.checkboxRow} onPress={() => setAcceptAccuracy(v => !v)}>
                <View style={[styles.checkbox, acceptAccuracy && styles.checkboxChecked]}>
                  {acceptAccuracy && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Jeg bekrefter at informasjonen jeg legger inn er korrekt.</Text>
              </Pressable>

              <Pressable style={styles.checkboxRow} onPress={() => setAcceptNotifications(v => !v)}>
                <View style={[styles.checkbox, acceptNotifications && styles.checkboxChecked]}>
                  {acceptNotifications && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Jeg samtykker til å motta viktige varsler relatert til tjenesten.</Text>
              </Pressable>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, !acceptedAll && styles.modalButtonDisabled]}
                  disabled={!acceptedAll}
                  onPress={() => setShowGuidelines(false)}
                >
                  <Text style={styles.modalButtonText}>Godta og fortsett</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButtonSecondary]}
                  onPress={() => setShowGuidelines(false)}
                >
                  <Text style={styles.modalButtonSecondaryText}>Lukk</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: Palette.background,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '700',
    color: Palette.header,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d4dd',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Palette.card,
    fontSize: 14,
    color: Palette.text,
  },
  button: {
    backgroundColor: Palette.primary,
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.header,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: Palette.card,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    color: Palette.text,
    fontSize: 14,
  },
  modalButtons: {
    marginTop: 8,
    gap: 10,
  },
  modalButton: {
    backgroundColor: Palette.success,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  modalButtonSecondary: {
    backgroundColor: Palette.card,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modalButtonSecondaryText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
});
