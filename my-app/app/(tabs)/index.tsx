import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api, { Child, Activity } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

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
        <ActivityIndicator size="large" color={Colors.light.secondary} />
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
    backgroundColor: Colors.light.backgroundSecondary,
  },
  centered: {
    flex: 1,
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
  greeting: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  date: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textWhite,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
  },
  childrenSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
    color: Colors.light.text,
    textAlign: 'center',
  },
  childCard: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.light.backgroundCard,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  avatarText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  childGroup: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  arrowIcon: {
    fontSize: 32,
    color: Colors.light.text,
    fontWeight: '300',
  },
  buttonRow: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  checkInButton: {
    backgroundColor: Colors.light.primary,
  },
  checkOutButton: {
    backgroundColor: Colors.light.buttonDanger,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabled,
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textWhite,
    fontWeight: Typography.fontWeight.bold,
  },
  buttonText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusMessage: {
    backgroundColor: Colors.light.successLight,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.base,
    alignItems: 'center',
  },
  statusMessageText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.successText,
    fontWeight: Typography.fontWeight.medium,
  },
  statusMessageOut: {
    backgroundColor: Colors.light.warningLight,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.base,
    alignItems: 'center',
  },
  statusMessageTextOut: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.warningText,
    fontWeight: Typography.fontWeight.medium,
  },
  statusMessageHome: {
    backgroundColor: Colors.light.errorLight,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.base,
    alignItems: 'center',
  },
  statusMessageTextHome: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.errorText,
    fontWeight: Typography.fontWeight.medium,
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
    backgroundColor: Colors.light.secondary,
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
