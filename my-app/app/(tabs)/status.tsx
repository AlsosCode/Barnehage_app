import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import api, { Stats, Child } from "@/services/api";

export default function StatusScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Laster oversikt...</Text>
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
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Barnehageoversikt</Text>

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
    marginBottom: 20,
    marginTop: 20,
    marginHorizontal: 20,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalCard: {
    backgroundColor: '#007AFF',
  },
  inCard: {
    backgroundColor: '#34C759',
  },
  outCard: {
    backgroundColor: '#FF9500',
  },
  homeCard: {
    backgroundColor: '#8E8E93',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
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
  groupCard: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  groupCount: {
    fontSize: 16,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  childGroup: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  childTime: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
