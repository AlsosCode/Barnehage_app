import { View, Text, StyleSheet } from "react-native";
import { getRandomChild } from "../data/randomChild";

export default function ChildInfoScreen() {
  const child = getRandomChild();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Barnets informasjon</Text>
      <Text style={styles.text}>Navn: {child.name}</Text>
      <Text style={styles.text}>Alder: {child.age} år</Text>
      <Text style={styles.text}>Avdeling: {child.group}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 10 }
});
