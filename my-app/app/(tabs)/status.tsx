import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import api, { Stats, Child } from "@/services/api";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function StatusScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, childrenData] = await Promise.all([
        api.stats.getStats(),
        api.children.getAll()
      ]);
      setStats(statsData);
      setChildren(childrenData);
      setError(null);
    } catch (err) {
      setError('Kunne ikke hente oversikt. Sjekk at serveren kjører.');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.secondary} />
        <Text style={styles.loadingText}>Laster oversikt...</Text>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Kunne ikke laste data'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const checkedInChildren = children.filter(c => c.status === 'checked_in');
  const checkedOutChildren = children.filter(c => c.status === 'checked_out');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Oversikt</Text>
          <Text style={styles.subtitle}>Barnehageoversikt og statistikk</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => {
          logout();
          router.replace('/login' as any);
        }}>
          <Text style={styles.logoutText}>Logg ut</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.totalCard]}>
            <Text style={styles.statNumber}>{stats.totalChildren}</Text>
            <Text style={styles.statLabel}>Totalt barn</Text>
          </View>

          <View style={[styles.statCard, styles.inCard]}>
            <Text style={styles.statNumber}>{stats.checkedIn}</Text>
            <Text style={styles.statLabel}>Sjekket inn</Text>
          </View>

          <View style={[styles.statCard, styles.outCard]}>
            <Text style={styles.statNumber}>{stats.checkedOut}</Text>
            <Text style={styles.statLabel}>Sjekket ut</Text>
          </View>

          <View style={[styles.statCard, styles.homeCard]}>
            <Text style={styles.statNumber}>{stats.home}</Text>
            <Text style={styles.statLabel}>Hjemme</Text>
          </View>
        </View>

        {stats.groups && stats.groups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grupper</Text>
            {stats.groups.map(group => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupCount}>
                    {group.currentCount} / {group.totalCapacity}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(group.currentCount / group.totalCapacity) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barn inne nå ({checkedInChildren.length})</Text>
          {checkedInChildren.length > 0 ? (
            checkedInChildren.map(child => (
              <View key={child.id} style={styles.childCard}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>{child.name.charAt(0)}</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childGroup}>{child.group}</Text>
                </View>
                <Text style={styles.childTime}>
                  {child.checkedInAt && new Date(child.checkedInAt).toLocaleTimeString('nb-NO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Ingen barn inne for øyeblikket</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sjekket ut ({checkedOutChildren.length})</Text>
          {checkedOutChildren.length > 0 ? (
            checkedOutChildren.map(child => (
              <View key={child.id} style={styles.childCard}>
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>{child.name.charAt(0)}</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childGroup}>{child.group}</Text>
                </View>
                <Text style={styles.childTime}>
                  {child.checkedOutAt && new Date(child.checkedOutAt).toLocaleTimeString('nb-NO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Ingen barn sjekket ut ennå</Text>
          )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.base,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.medium,
  },
  totalCard: {
    backgroundColor: Colors.light.primary,
  },
  inCard: {
    backgroundColor: Colors.light.success,
  },
  outCard: {
    backgroundColor: Colors.light.warning,
  },
  homeCard: {
    backgroundColor: Colors.light.textSecondary,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textWhite,
    marginTop: Spacing.xs,
  },
  section: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.light.text,
  },
  groupCard: {
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  groupName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  groupCount: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.success,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  childAvatarText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  childGroup: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  childTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.buttonDanger,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
