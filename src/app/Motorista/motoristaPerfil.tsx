import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://via.placeholder.com/120" }}
        style={styles.avatar}
      />
      <Text style={styles.name}>João Motorista</Text>
      <Text style={styles.info}>Email: joao@unibus.com</Text>
      <Text style={styles.info}>Placa do veículo: ABC-1234</Text>
      <Text style={styles.info}>Telefone: (99) 99999-9999</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 40, backgroundColor: "#fff" },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 6, color: "#444" },
});
