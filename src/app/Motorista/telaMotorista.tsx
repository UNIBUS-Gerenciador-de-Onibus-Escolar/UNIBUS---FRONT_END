import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,

} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { API_URL } from "../../BackEnd/IPconfig";
import { useRouter } from 'expo-router';

// IMPORTANDO A NOVA TELA
import MotoristaAvisosScreen from "./motoristaAviso"; // ajuste o caminho conforme a pasta

type IoniconsName = keyof typeof Ionicons.glyphMap;

function MinhasRotasScreen() {
  const rotas = [
    {
      id: 1,
      nome: "Rota Vassoura",
      estudantes: 25,
      status: "Ativa",
      pontos: [
        { nome: "SÍTIO XIQUE - XIQUE", hora: "06:20" },
        { nome: "VILA XIQUE - XIQUE (CASA MODELO)", hora: "06:40" },
        { nome: "COLÉGIO MARGARIDA MIRANDA", hora: "07:05" },
        { nome: "SESI", hora: "07:10" },
      ],
    },
    {
      id: 2,
      nome: "Rota Centro",
      estudantes: 18,
      status: "Ativa",
      pontos: [
        { nome: "Praça Central", hora: "06:15" },
        { nome: "Mercado Público", hora: "06:35" },
        { nome: "ETE Ministro Fernando Lyra", hora: "07:00" },
      ],
    },
    {
      id: 3,
      nome: "Rota Rural",
      estudantes: 12,
      status: "Ativa",
      pontos: [
        { nome: "Sítio Lagoa", hora: "06:10" },
        { nome: "Assentamento Nova Esperança", hora: "06:40" },
        { nome: "ETE Ministro Fernando Lyra", hora: "07:20" },
      ],
    },
  ];

  const iniciarRota = async (rotaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/rotas/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao iniciar rota");
      Alert.alert("Rota Iniciada", `Você iniciou a rota ${rotaId} com sucesso!`);
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  const enviarAviso = async (rotaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/avisos/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rotaId,
          mensagem: `O motorista iniciou a rota ${rotaId}.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao enviar aviso");
      Alert.alert("Aviso Enviado", "O aviso foi enviado para os estudantes.");
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={22} color="#000" />
        <Text style={styles.headerTitle}>Minhas Rotas</Text>
      </View>
      <Text style={styles.motorista}>Motorista: Hélio</Text>

      {/* ROTAS ATIVAS */}
      <View style={styles.section}>
        <Text style={styles.rotasAtivas}>Rotas Ativas</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{rotas.length} rotas ativas</Text>
        </View>
      </View>

      {/* LISTA DE ROTAS */}
      <ScrollView style={{ paddingHorizontal: 16 }}>
        {rotas.map((rota) => (
          <View key={rota.id} style={styles.card}>
            {/* Header do card */}
            <View style={styles.cardHeader}>
              <Ionicons
                name="bus"
                size={26}
                color="#FFD700"
                style={{ marginRight: 8 }}
              />
              <View>
                <Text style={styles.cardTitle}>{rota.nome}</Text>
                <Text style={styles.subtitle}>{rota.estudantes} estudantes</Text>
              </View>
              <View style={styles.status}>
                <Text style={styles.statusText}>{rota.status}</Text>
              </View>
            </View>

            {/* Pontos */}
            {rota.pontos.map((ponto, idx) => (
              <View style={styles.ponto} key={idx}>
                <Text style={styles.pontoText}>{ponto.nome}</Text>
                <View style={styles.horarioBox}>
                  <Text style={styles.horario}>{ponto.hora}</Text>
                </View>
              </View>
            ))}

            {/* Botões */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => iniciarRota(rota.id)}
              >
                <Text style={styles.startButtonText}>Iniciar Rota</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.noticeButton}
                onPress={() => enviarAviso(rota.id)}
              >
                <Ionicons name="notifications-outline" size={18} color="#000" />
                <Text style={styles.noticeButtonText}>Enviar Aviso</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* OUTRAS TELAS */
function PerfilScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Tela Perfil</Text>
    </View>
  );
}

function ConfigScreen() {
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
  return (
    <View style={styles.center}>
      <TouchableOpacity 
                style={[styles.option, { marginTop: 20 }]} 
                onPress={handleLogout}
              >
                <Ionicons name="exit-outline" size={22} color="#d00" />
                <Text style={[styles.optionText, { color: '#d00' }]}>Sair</Text>
              </TouchableOpacity>
      <Text style={styles.text}>Tela Configurações</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function TelaMotoristaTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: IoniconsName;
          switch (route.name) {
            case "Perfil":
              iconName = "person-outline";
              break;
            case "Minhas Rotas":
              iconName = "bus-outline";
              break;
            case "Avisos":
              iconName = "notifications-outline";
              break;
            case "Configurações":
              iconName = "settings-outline";
              break;
            case "Motorista Avisos":
              iconName = "megaphone-outline";
              break;
            default:
              iconName = "alert-circle";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#555",
        tabBarStyle: { backgroundColor: "#FFD700", height: 65 },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 5 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Minhas Rotas" component={MinhasRotasScreen} />
      <Tab.Screen name="Avisos" component={MotoristaAvisosScreen} />
      <Tab.Screen name="Configurações" component={ConfigScreen} />
    </Tab.Navigator>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  optionText: { fontSize: 16},
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  motorista: { marginLeft: 16, marginVertical: 8, color: "#333" },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  rotasAtivas: { fontWeight: "bold", fontSize: 16 },
  badge: {
    backgroundColor: "#d1f7d6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: { color: "#000", fontWeight: "500" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  subtitle: { color: "#444", fontSize: 12 },
  status: {
    backgroundColor: "#d1f7d6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: "auto",
  },
  statusText: { color: "#000", fontSize: 12, fontWeight: "500" },
  ponto: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff9d6",
    padding: 14,
    borderRadius: 8,
    marginVertical: 5,
  },
  option:{},
  pontoText: { fontSize: 14, fontWeight: "500", flexShrink: 1 },
  horarioBox: {
    backgroundColor: "#FFD700",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  horario: { fontWeight: "bold", fontSize: 13 },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  startButton: {
    flex: 1,
    backgroundColor: "#FFD700",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  startButtonText: { fontWeight: "bold", fontSize: 14 },
  noticeButton: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  noticeButtonText: { marginLeft: 6, fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
