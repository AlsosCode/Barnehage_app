import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api, { Child, Activity } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { parentId, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Hent alle barn
      const childrenData = await api.children.getAll();

      // Filtrer barn basert på parentId hvis brukeren er en forelder
      const filteredChildren = parentId
        ? childrenData.filter((child: Child) => child.parentId === parentId)
        : childrenData;

      setChildren(filteredChildren);

      // Hent aktiviteter
      const activitiesData = await api.activities.getAll();
      setActivities(activitiesData.slice(0, 3)); // Vis bare de 3 siste
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (child: Child) => {
    if (child.status === 'checked_in') {
      Alert.alert('Info', `${child.name} er allerede sjekket inn.`);
      return;
    }

    try {
      setActionLoading(child.id);
      await api.children.checkIn(child.id);
      Alert.alert('Suksess', `${child.name} er sjekket inn!`);
      await fetchData();
    } catch (err) {
      Alert.alert('Feil', 'Kunne ikke sjekke inn. Prøv igjen.');
      console.error('Check in error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (child: Child) => {
    if (child.status === 'checked_out') {
      Alert.alert('Info', `${child.name} er allerede sjekket ut.`);
      return;
    }

    if (child.status === 'home') {
      Alert.alert('Info', `${child.name} er ikke sjekket inn ennå.`);
      return;
    }

    try {
      setActionLoading(child.id);
      await api.children.checkOut(child.id);
      Alert.alert('Suksess', `${child.name} er sjekket ut!`);
      await fetchData();
    } catch (err) {
      Alert.alert('Feil', 'Kunne ikke sjekke ut. Prøv igjen.');
      console.error('Check out error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return 'I dag';
    }

    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleChildPress = (childId: number) => {
    router.push(`/(tabs)/childinfo?childId=${childId}` as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Laster...</Text>
      </View>
    );
  }

  if (children.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Ingen barn registrert</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hjem</Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.childrenSection}>
          <Text style={styles.sectionTitle}>Stempling</Text>
          {children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <TouchableOpacity onPress={() => handleChildPress(child.id)} activeOpacity={0.7}>
                <View style={styles.childHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childGroup}>{child.age} år • {child.group}</Text>
                  </View>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.checkInButton,
                    (actionLoading === child.id || child.status === 'checked_in') && styles.buttonDisabled
                  ]}
                  onPress={() => handleCheckIn(child)}
                  disabled={actionLoading === child.id || child.status === 'checked_in'}
                >
                  {actionLoading === child.id && child.status !== 'checked_in' ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.buttonIcon}>✓</Text>
                      <Text style={styles.buttonText}>Stemple inn</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.checkOutButton,
                    (actionLoading === child.id || child.status !== 'checked_in') && styles.buttonDisabled
                  ]}
                  onPress={() => handleCheckOut(child)}
                  disabled={actionLoading === child.id || child.status !== 'checked_in'}
                >
                  {actionLoading === child.id && child.status === 'checked_in' ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text style={styles.buttonIcon}>✗</Text>
                      <Text style={styles.buttonText}>Stemple ut</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {child.status === 'checked_in' && (
                <View style={styles.statusMessage}>
                  <Text style={styles.statusMessageText}>✓ {child.name.split(' ')[0]} er for tiden i barnehagen</Text>
                </View>
              )}
              {child.status === 'checked_out' && (
                <View style={styles.statusMessageOut}>
                  <Text style={styles.statusMessageTextOut}>✓ {child.name.split(' ')[0]} er sjekket ut</Text>
                </View>
              )}
              {child.status === 'home' && (
                <View style={styles.statusMessageHome}>
                  <Text style={styles.statusMessageTextHome}>{child.name.split(' ')[0]} er hjemme</Text>
                </View>
              )}
            </View>
          ))}
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
    flex: 1,
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
  greeting: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  childrenSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
  childCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f0f5',
    padding: 15,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  childGroup: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  arrowIcon: {
    fontSize: 32,
    color: '#000',
    fontWeight: '300',
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: '#003366',
  },
  checkOutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  statusMessage: {
    backgroundColor: '#d4f4dd',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  statusMessageText: {
    fontSize: 16,
    color: '#2d7a3e',
    fontWeight: '500',
  },
  statusMessageOut: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  statusMessageTextOut: {
    fontSize: 16,
    color: '#856404',
    fontWeight: '500',
  },
  statusMessageHome: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  statusMessageTextHome: {
    fontSize: 16,
    color: '#721c24',
    fontWeight: '500',
  },
  loadingText: {
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
