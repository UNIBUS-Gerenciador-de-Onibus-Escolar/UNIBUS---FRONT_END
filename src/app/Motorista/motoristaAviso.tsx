import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Aviso = {
  id: number;
  titulo: string;
  prioridade: "Alta" | "Media" | "Baixa";
  destinatario: string;
  enviadoPor: string;
  data: string;
  mensagem: string;
  lido?: boolean;
};

const avisos: Aviso[] = [
  {
    id: 1,
    titulo: "Atraso devido ao trânsito",
    prioridade: "Alta",
    destinatario: "Estudantes",
    enviadoPor: "Motorista Rota Vassoura",
    data: "2025-06-02 07:15",
    mensagem:
      "O motorista da Rota Vassoura encontra-se com atraso estimado em 15 minutos devido ao trânsito.",
    lido: false,
  },
  {
    id: 2,
    titulo: "Mudança de horário temporária",
    prioridade: "Alta",
    destinatario: "Estudantes",
    enviadoPor: "Motorista Rota Vassoura",
    data: "2025-06-01 18:30",
    mensagem:
      "Devido às obras na Rua Principal, o ponto de embarque será transferido para a Praça Central até segunda-feira.",
    lido: true,
  },
  {
    id: 3,
    titulo: "Veículo em manutenção",
    prioridade: "Media",
    destinatario: "Estudantes",
    enviadoPor: "Motorista Rota Vassoura",
    data: "2025-05-30 14:20",
    mensagem:
      "Ônibus da Rota Vassoura passará por manutenção preventiva no sábado. Não haverá transporte escolar.",
    lido: true,
  },
];

export default function AvisosScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text style={styles.headerTitle}>Avisos</Text>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>3 não lidos</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabTextActive}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Alunos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Gestão</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Avisos */}
      <ScrollView style={{ flex: 1 }}>
        {avisos.map((aviso) => (
          <View
            key={aviso.id}
            style={[
              styles.card,
              aviso.prioridade === "Alta" && { borderLeftColor: "#ff9500" },
              aviso.prioridade === "Media" && { borderLeftColor: "#007bff" },
              aviso.prioridade === "Baixa" && { borderLeftColor: "#28a745" },
            ]}
          >
            {/* Título e ícone */}
            <View style={styles.cardHeader}>
              <Ionicons
                name={
                  aviso.prioridade === "Alta"
                    ? "warning-outline"
                    : aviso.prioridade === "Media"
                    ? "megaphone-outline"
                    : "information-circle-outline"
                }
                size={20}
                color="#000"
              />
              <Text style={styles.cardTitle}>{aviso.titulo}</Text>
              {aviso.lido && (
                <Text style={styles.readTag}>
                  <Ionicons name="checkmark-done" size={16} color="green" /> Lido
                </Text>
              )}
            </View>

            {/* Prioridade */}
            <Text
              style={[
                styles.priority,
                aviso.prioridade === "Alta" && { color: "red" },
                aviso.prioridade === "Media" && { color: "#007bff" },
                aviso.prioridade === "Baixa" && { color: "#28a745" },
              ]}
            >
              Prioridade: {aviso.prioridade}
            </Text>

            {/* Info */}
            <Text style={styles.meta}>
              Destinatário: <Text style={styles.bold}>{aviso.destinatario}</Text>
            </Text>
            <Text style={styles.meta}>
              Enviado por: <Text style={styles.bold}>{aviso.enviadoPor}</Text>
            </Text>
            <Text style={styles.meta}>{aviso.data}</Text>

            {/* Mensagem */}
            <Text style={styles.mensagem}>{aviso.mensagem}</Text>

            {/* Ações */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="send-outline" size={18} color="#000" />
                <Text style={styles.actionText}>Enviar Mensagem</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="create-outline" size={18} color="#000" />
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Botão Novo Aviso */}
      <TouchableOpacity style={styles.newButton}>
        <Text style={styles.newButtonText}>+ Criar Novo Aviso</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  unreadBadge: {
    marginLeft: "auto",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  unreadText: { fontSize: 12, fontWeight: "600" },
  tabs: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "flex-start",
  },
  tab: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  tabActive: { backgroundColor: "#FFD700" },
  tabText: { fontSize: 14, color: "#333" },
  tabTextActive: { fontSize: 14, fontWeight: "bold", color: "#000" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 6, flex: 1 },
  readTag: { fontSize: 12, color: "green", fontWeight: "600" },
  priority: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  meta: { fontSize: 12, color: "#555" },
  bold: { fontWeight: "600" },
  mensagem: { fontSize: 14, marginVertical: 10, color: "#333" },
  actions: { flexDirection: "row", marginTop: 8 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    flex: 1,
    justifyContent: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  actionText: { marginLeft: 6, fontSize: 13, fontWeight: "500" },
  newButton: {
    backgroundColor: "#FFD700",
    padding: 14,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  newButtonText: { fontWeight: "bold", fontSize: 15 },
});