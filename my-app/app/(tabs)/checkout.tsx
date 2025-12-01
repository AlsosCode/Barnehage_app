import { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { children } from "../data/children"; //  viktig endring!

export default function CheckOutScreen() {
  const [checkedOut, setCheckedOut] = useState({});

  const handleCheckout = (child) => {
    setCheckedOut({ ...checkedOut, [child.id]: true });  // marker barnet som sjekket ut
    alert(`${child.name} er sjekket ut!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrere Check-out</Text>
      <Text style={styles.text}>Trykk på barnet for å registrere check-out.</Text>

      <FlatList
        data={children}   // dynamisk liste basert på data/children.ts
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.childButton,
              checkedOut[item.id] && styles.checkedOut,
            ]}
            onPress={() => handleCheckout(item)}
            disabled={checkedOut[item.id]}
          >
            <Text style={styles.childText}>
              {item.name} {checkedOut[item.id] && "✓"}
            </Text>
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
  },
  checkedOut: {
    backgroundColor: "#b7f7c3", // grønn når sjekket ut
  },
  childText: {
    fontSize: 18,
  },
});

