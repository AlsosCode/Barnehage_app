import { View, Text, StyleSheet } from "react-native";

export default function StatusScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barnehageoversikt</Text>
      <Text style={styles.text}>Antall barn: 10</Text>
      <Text style={styles.text}>Sjekket inn: 6</Text>
      <Text style={styles.text}>Sjekket ut: 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 10 }
});
