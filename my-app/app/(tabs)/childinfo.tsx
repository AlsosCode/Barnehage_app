import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api, { Child } from "@/services/api";

export default function ChildInfoScreen() {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const router = useRouter();
  const childId = params.childId ? parseInt(params.childId as string) : null;

  useEffect(() => {
    if (childId) {
      fetchChildInfo(childId);
    } else {
      setError('Ingen barn valgt');
      setLoading(false);
    }
  }, [childId]);

  const fetchChildInfo = async (id: number) => {
    try {
      setLoading(true);
      const fetchedChild = await api.children.getById(id);
      setChild(fetchedChild);
      setError(null);
    } catch (err) {
      setError('Kunne ikke hente barnets informasjon. Sjekk at serveren kjører.');
      console.error('Error fetching child:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Laster informasjon...</Text>
      </View>
    );
  }

  if (error || !child) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Ingen barneinformasjon tilgjengelig'}</Text>
        {childId && (
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchChildInfo(childId)}>
            <Text style={styles.retryText}>Prøv igjen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Tilbake</Text>
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{child.name}</Text>
        <Text style={styles.group}>{child.group}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasjon</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Alder:</Text>
          <Text style={styles.value}>{child.age} år</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fødselsdato:</Text>
          <Text style={styles.value}>{formatDate(child.birthDate)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Avdeling:</Text>
          <Text style={styles.value}>{child.group}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <View style={[styles.statusBadge,
            child.status === 'checked_in' && styles.statusIn,
            child.status === 'checked_out' && styles.statusOut,
            child.status === 'home' && styles.statusHome
          ]}>
            <Text style={styles.statusText}>
              {child.status === 'checked_in' && '✓ Inne'}
              {child.status === 'checked_out' && '✓ Ute'}
              {child.status === 'home' && 'Hjemme'}
            </Text>
          </View>
        </View>
      </View>

      {child.allergies && child.allergies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergier</Text>
          {child.allergies.map((allergy, index) => (
            <View key={index} style={styles.allergyItem}>
              <Text style={styles.allergyText}>⚠️ {allergy}</Text>
            </View>
          ))}
        </View>
      )}

      {child.checkedInAt && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tidspunkter</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sjekket inn:</Text>
            <Text style={styles.value}>
              {new Date(child.checkedInAt).toLocaleTimeString('nb-NO', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          {child.checkedOutAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Sjekket ut:</Text>
              <Text style={styles.value}>
                {new Date(child.checkedOutAt).toLocaleTimeString('nb-NO', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          )}
        </View>
      )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  profileSection: {
    backgroundColor: '#007AFF',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  group: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIn: {
    backgroundColor: '#d4edda',
  },
  statusOut: {
    backgroundColor: '#fff3cd',
  },
  statusHome: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  allergyItem: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  allergyText: {
    fontSize: 16,
    color: '#856404',
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
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
