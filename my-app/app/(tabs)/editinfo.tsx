import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState } from "react";

export default function EditInfoScreen() {
  const [name, setName] = useState("Kari Nordmann");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redigere kontaktinfo</Text>

      <TextInput 
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Button title="Lagre" onPress={() => alert("Lagret!")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20
  }
});
