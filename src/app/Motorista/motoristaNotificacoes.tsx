import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function NotificacoesScreen() {
  const notificacoes = [
    "Rota Vassoura atualizada para amanhã",
    "Aluno Pedro Henrique atrasou 5 minutos",
    "Nova mensagem da gestão escolar",
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      {notificacoes.map((n, i) => (
        <View key={i} style={styles.card}>
          <Text>{n}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
});
