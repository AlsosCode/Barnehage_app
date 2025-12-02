import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import api, { Child, Activity } from '@/services/api';

export default function HomeScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Hent alle barn
      const childrenData = await api.children.getAll();
      setChildren(childrenData);

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Stempling</Text>
        <Text style={styles.date}>{getCurrentDate()}</Text>
      </View>

      <View style={styles.childrenSection}>
        <Text style={styles.sectionTitle}>Alle barn</Text>
        {children.map((child) => (
          <View key={child.id} style={styles.childCard}>
            <View style={styles.childHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
              </View>
              <View style={styles.childDetails}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childGroup}>{child.group}</Text>
                {child.checkedInAt && (
                  <Text style={styles.timeText}>
                    Inn: {formatTime(child.checkedInAt)}
                  </Text>
                )}
              </View>
              <View style={[
                styles.statusBadge,
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
                    <Text style={styles.buttonText}>Inn</Text>
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
                    <Text style={styles.buttonText}>Ut</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {activities.length > 0 && (
        <View style={styles.activitiesCard}>
          <Text style={styles.sectionTitle}>Siste aktiviteter</Text>
          {activities.map(activity => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{formatDate(activity.createdAt)}</Text>
              </View>
              <Text style={styles.activityDescription} numberOfLines={2}>
                {activity.description}
              </Text>
            </View>
          ))}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  childrenSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  childCard: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  childGroup: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
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
    fontSize: 11,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  checkInButton: {
    backgroundColor: '#34C759',
  },
  checkOutButton: {
    backgroundColor: '#FF9500',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesCard: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 5,
    marginBottom: 20,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  activityItem: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
