import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import api, { Child } from "@/services/api";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";


export default function CheckOutScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hent barn fra backend
  useFocusEffect(
          useCallback(() =>{
              fetchChildren();
          }, [])
      );

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const data = await api.children.getAll();
      setChildren(data);
      setError(null);
    } catch (err) {
      setError('Kunne ikke hente barn. Sjekk at serveren kjører.');
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (child: Child) => {
    try {
      if (child.status === 'checked_out') {
        Alert.alert('Info', `${child.name} er allerede sjekket ut.`);
        return;
      }

      if (child.status === 'home') {
        Alert.alert('Info', `${child.name} er ikke sjekket inn ennå.`);
        return;
      }

      // Sjekk ut barnet via API
      await api.children.checkOut(child.id);

      Alert.alert('Suksess', `${child.name} er sjekket ut!`);

      // Oppdater listen
      await fetchChildren();
    } catch (err) {
      Alert.alert('Feil', 'Kunne ikke sjekke ut barnet. Prøv igjen.');
      console.error('Error checking out child:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Laster barn...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChildren}>
          <Text style={styles.retryText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrere Check-out</Text>
      <Text style={styles.text}>Trykk på barnet for å registrere check-out.</Text>

      <FlatList
        data={children}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.childButton,
              item.status === 'checked_out' && styles.checkedOut,
              item.status === 'home' && styles.home,
            ]}
            onPress={() => handleCheckout(item)}
          >
            <View style={styles.childInfo}>
              <Text style={styles.childText}>{item.name}</Text>
              <Text style={styles.groupText}>{item.group}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {item.status === 'checked_in' && '✓ Inne'}
                {item.status === 'checked_out' && '✓ Ute'}
                {item.status === 'home' && 'Hjemme'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  childButton: {
    padding: 15,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childText: {
    fontSize: 18,
    fontWeight: '600',
  },
  groupText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkedOut: {
    backgroundColor: "#b7f7c3",
  },
  home: {
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
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

