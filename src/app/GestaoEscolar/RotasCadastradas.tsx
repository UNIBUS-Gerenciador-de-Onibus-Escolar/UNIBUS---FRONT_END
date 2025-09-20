import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

type StatusType = "ativo" | "inativo" | "pendente";

interface Rota {
  id: string;
  name: string;
  driver: string;
  vehicle: string;
  shift: string;
  capacity: number;
  studentCount: number;
  status: StatusType;
  departureTime: string;
  arrivalTime: string;
  returnTime: string;
  returnArrival: string;
  route: string;
  stops: number;
}

export default function RotasCadastradas() {
  const router = useRouter();
  const [filter, setFilter] = useState<"todas" | "ativo" | "inativo" | "pendente">("todas");

  const rotas: Rota[] = [
    {
      id: "1",
      name: "Rota Xique-xique",
      driver: "Pedro Lima",
      vehicle: "Ônibus Escolar",
      shift: "Manhã",
      capacity: 40,
      studentCount: 38,
      status: "ativo",
      departureTime: "06:20",
      arrivalTime: "07:10",
      returnTime: "17:30",
      returnArrival: "18:15",
      route: "Sítio Xique-xique, Residencial Xique-xique, Xique-Xique",
      stops: 4,
    },
    {
      id: "2",
      name: "Rota Residencial Sul",
      driver: "Maria Souza",
      vehicle: "Van Escolar",
      shift: "Tarde",
      capacity: 20,
      studentCount: 20,
      status: "pendente",
      departureTime: "12:30",
      arrivalTime: "13:00",
      returnTime: "18:00",
      returnArrival: "18:40",
      route: "Residencial Sul, Av. Brasil, Praça Central",
      stops: 3,
    },
    {
      id: "3",
      name: "Rota Lagoa do Algodão",
      driver: "Carlos Silva",
      vehicle: "Ônibus Escolar",
      shift: "Manhã",
      capacity: 45,
      studentCount: 42,
      status: "ativo",
      departureTime: "05:50",
      arrivalTime: "06:40",
      returnTime: "17:10",
      returnArrival: "18:00",
      route: "Lagoa do Algodão, Bairro Novo, Escola",
      stops: 5,
    },
    {
      id: "4",
      name: "Rota Centro",
      driver: "Ana Pereira",
      vehicle: "Micro-ônibus",
      shift: "Noite",
      capacity: 25,
      studentCount: 18,
      status: "inativo",
      departureTime: "18:20",
      arrivalTime: "18:50",
      returnTime: "22:30",
      returnArrival: "23:00",
      route: "Praça Central, Av. Principal, Escola",
      stops: 2,
    },
    {
      id: "5",
      name: "Rota Alto do Moura",
      driver: "João Batista",
      vehicle: "Ônibus Escolar",
      shift: "Tarde",
      capacity: 50,
      studentCount: 47,
      status: "ativo",
      departureTime: "12:10",
      arrivalTime: "13:00",
      returnTime: "18:15",
      returnArrival: "19:00",
      route: "Alto do Moura, Rendeiras, Escola",
      stops: 6,
    },
  ];

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "ativo":
        return "#4CAF50";
      case "pendente":
        return "#FFC107";
      case "inativo":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const filteredRotas =
    filter === "todas" ? rotas : rotas.filter((r) => r.status === filter);

  return (
    <View style={styles.container}>
      {/* HEADER COMPLETO (fundo preto + resumo) */}
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            >
            <Ionicons name="arrow-forward" size={22} color="#FFF" />
    </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="people" size={28} color="#FFD43B" />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.headerTitle}>Listagem de Alunos</Text>
            <Text style={styles.headerSubtitle}>ETE Ministro Fernando Lyra</Text>
          </View>
        </View>

        {/* Resumo dentro do header */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>5</Text>
            <Text style={styles.summaryLabel}>Rotas Totais</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>3</Text>
            <Text style={styles.summaryLabel}>Ativas</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "#2196F3" }]}>165</Text>
            <Text style={styles.summaryLabel}>Alunos</Text>
          </View>
        </View>
      </View>

      {/* Busca */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="Buscar por rota, motorista..."
          style={styles.searchInput}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        {["todas", "ativo", "pendente", "inativo"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterButton,
              filter === item && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(item as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de rotas */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredRotas.map((rota) => (
          <View key={rota.id} style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons
                  name="transit-connection-variant"
                  size={20}
                  color="#000"
                />
              </View>
              <Text style={styles.cardTitle}>{rota.name}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(rota.status) },
                ]}
              >
                <Text style={styles.statusText}>{rota.status}</Text>
              </View>
            </View>

            {/* Motorista, alunos e turno */}
            <View style={styles.infoRow}>
              <FontAwesome5 name="user-tie" size={14} color="#555" />
              <Text style={styles.infoText}>{rota.driver}</Text>
              <Ionicons
                name="people"
                size={16}
                color="#555"
                style={{ marginLeft: 10 }}
              />
              <Text style={styles.infoText}>{rota.studentCount} alunos</Text>
              <Ionicons
                name="time"
                size={16}
                color="#555"
                style={{ marginLeft: 10 }}
              />
              <Text style={styles.infoText}>{rota.shift}</Text>
            </View>

            {/* Ida e Volta */}
            <View style={styles.tripRow}>
              <View style={styles.tripCard}>
                <Ionicons name="home" size={16} color="#000" />
                <Text style={styles.tripTitle}>Ida</Text>
                <Text style={styles.tripText}>
                  Saída: {rota.departureTime}{"\n"}Chegada: {rota.arrivalTime}
                </Text>
              </View>
              <View style={styles.tripCard}>
                <Ionicons name="return-down-back" size={16} color="#000" />
                <Text style={styles.tripTitle}>Volta</Text>
                <Text style={styles.tripText}>
                  Saída: {rota.returnTime}{"\n"}Chegada: {rota.returnArrival}
                </Text>
              </View>
            </View>

            {/* Trajeto */}
            <Text style={styles.routeText}>Trajeto: {rota.route}</Text>
            <Text style={styles.routeText}>
              Veículo: {rota.vehicle} • Pontos: {rota.stops} paradas
            </Text>

            {/* Botão detalhes */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                router.push({
                  pathname: "/GestaoEscolar/ListagemAlunos",
                  params: { id: rota.id },
                })
              }
            >
              <Ionicons name="eye" size={18} color="#000" />
              <Text style={styles.detailsButtonText}>
                Ver Detalhes e Lista de Alunos
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    backgroundColor: "#1C1C1E",
    padding: 16,
    paddingBottom: 24,
    paddingTop: 70,
   
  },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerTitle: { color: "#FFD43B", fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { color: "#DDD", fontSize: 12 },
  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  backButton: {
  position: "absolute",
  top: 70,
  right: 16,
  zIndex: 20,
  padding: 6,
 
},

  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 18, fontWeight: "bold", color: "#FFF" },
  summaryLabel: { fontSize: 12, color: "#BBB" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginBottom: 8,
    marginTop: 8,
    zIndex: 10,
  },
  filterButton: {
    backgroundColor: "#EEE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: { backgroundColor: "#FFD43B" },
  filterText: { fontSize: 12, color: "#333" },
  filterTextActive: { color: "#000", fontWeight: "bold" },
  scrollContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#FFD43B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", flex: 1, color: "#000" },
  statusBadge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  statusText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { fontSize: 13, color: "#555", marginLeft: 4 },
  tripRow: { flexDirection: "row", justifyContent: "space-between" },
  tripCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 4,
  },
  tripTitle: { fontWeight: "bold", marginTop: 4, marginBottom: 2 },
  tripText: { fontSize: 12, color: "#333" },
  routeText: { fontSize: 13, color: "#444", marginTop: 6 },
  detailsButton: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFD43B",
    borderRadius: 12,
    padding: 12,
  },
  detailsButtonText: { fontWeight: "bold", color: "#000", marginHorizontal: 6 },
});
