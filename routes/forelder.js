import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

export default function OpprettForelder() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  async function handleSubmit() {
    if (!name || !email || !phone) {
      Alert.alert("Feil", "Navn, e-post og telefon må fylles ut.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          childrenIds: []  // tom liste til å begynne med
        }),
      });

      if (!response.ok) {
        throw new Error("Kunne ikke opprette forelder");
      }

      Alert.alert("Suksess", "Forelderprofil ble opprettet!");
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");

    } catch (error) {
      Alert.alert("Feil", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opprett foreldreprofil</Text>

      <TextInput
        style={styles.input}
        placeholder="Navn"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefon"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Adresse (valgfritt)"
        value={address}
        onChangeText={setAddress}
      />

      <Button title="Opprett forelder" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
});
