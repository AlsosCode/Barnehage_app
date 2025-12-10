import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

export default function CreateParent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  async function submit() {
    console.log("👉 Submit pressed");

    try {
      const res = await fetch("http://localhost:3002/api/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          childrenIds: []
        })
      });

      const data = await res.json();
      console.log("📩 Server response:", data);

      if (res.ok) {
        console.log("✅ Forelder ble opprettet!");
        setName("");
        setEmail("");
        setPhone("");
      } else {
        console.log("❌ Feil ved opprettelse:", data);
      }

    } catch (err) {
      console.log("🚨 Serverfeil:", err);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Opprett forelder</Text>

      <Text>Navn</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={name}
        onChangeText={setName}
        placeholder="F.eks. Kari Hansen"
      />

      <Text>E-post</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={email}
        onChangeText={setEmail}
        placeholder="epost@example.com"
      />

      <Text>Telefon</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        value={phone}
        onChangeText={setPhone}
        placeholder="12345678"
      />

      <TouchableOpacity
        onPress={submit}
        style={{
          backgroundColor: "dodgerblue",
          padding: 15,
          borderRadius: 6,
          marginTop: 20
        }}
      >
        <Text style={{ color: "white", fontSize: 18, textAlign: "center" }}>
          Opprett forelder
        </Text>
      </TouchableOpacity>
    </View>
  );
}
