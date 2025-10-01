import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, BackHandler, TouchableOpacity, Alert  } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';

export default function ConfiguracoesScreen() {
  const router = useRouter(); // Adiciona o hook useRouter
    // Função de logout
  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            router.replace("/"); // volta para tela de login (index.tsx)
          }
        }
      ]
    );
  };
  const [darkMode, setDarkMode] = useState(false);
  return (
    <View style={styles.container}>
       <TouchableOpacity 
          style={[styles.option, { marginTop: 20 }]} 
          onPress={handleLogout}
        >
          <Ionicons name="exit-outline" size={22} color="#d00" />
          <Text style={[styles.optionText, { color: '#d00' }]}>Sair</Text>
        </TouchableOpacity>
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
  optionText: { fontSize: 16},
});
