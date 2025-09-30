import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function ConfiguracoesScreen() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <View style={styles.option}>
        <Text>Modo Escuro</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
      <View style={styles.option}>
        <Text>Notificações Push</Text>
        <Switch value={true} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});