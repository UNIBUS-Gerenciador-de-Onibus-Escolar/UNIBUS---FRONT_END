import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import XLSX from "xlsx";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ListagemAlunos() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState("all");

  // Dados simulados
  const motorista = {
    nome: "Pedro Lima",
    telefone: "(87) 99999-1234",
  };

  const pontosRota = [
    { id: 1, nome: "Sítio Xique-xique", horario: "06:20" },
    { id: 2, nome: "Vila Xique-xique (casa modelo)", horario: "06:40" },
    { id: 3, nome: "Colégio Margarida Miranda", horario: "07:05" },
    { id: 4, nome: "Sesi", horario: "07:10" },
  ];

  const alunos = [
    { id: 1, nome: "Ana Maria Silva", matricula: "2024001", turma: "1º A", responsavel: "Maria Silva", telefone: "(87) 99999-0001", ponto: pontosRota[0].nome },
    { id: 2, nome: "João Pedro Santos", matricula: "2024002", turma: "1º A", responsavel: "Pedro Santos", telefone: "(87) 99999-0002", ponto: pontosRota[1].nome },
    { id: 3, nome: "Maria Eduarda Lima", matricula: "2024003", turma: "1º B", responsavel: "Eduardo Lima", telefone: "(87) 99999-0003", ponto: pontosRota[0].nome },
    { id: 4, nome: "Carlos Eduardo", matricula: "2024004", turma: "2º A", responsavel: "Carlos Oliveira", telefone: "(87) 99999-0004", ponto: pontosRota[2].nome },
    { id: 5, nome: "Beatriz Ferreira", matricula: "2024005", turma: "2º A", responsavel: "Ferreira Costa", telefone: "(87) 99999-0005", ponto: pontosRota[1].nome },
    { id: 6, nome: "Lucas Gabriel", matricula: "2024006", turma: "3º A", responsavel: "Gabriel Ferreira", telefone: "(87) 99999-0006", ponto: pontosRota[3].nome },
  ];

  const turmas = ["1º A", "1º B", "2º A", "3º A"];

  // Filtrar alunos
  const alunosFiltrados = alunos.filter((aluno) => {
    const matchSearch =
      aluno.nome.toLowerCase().includes(search.toLowerCase()) ||
      aluno.matricula.includes(search);

    const matchTurma =
      turmaSelecionada === "all" || aluno.turma === turmaSelecionada;

    return matchSearch && matchTurma;
  });

  // Exportar Excel
  const exportarExcel = async () => {
    try {
      const dadosExportar = alunosFiltrados.map(({ ponto, ...rest }) => rest);

      const ws = XLSX.utils.json_to_sheet(dadosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Alunos");
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const path = FileSystem.cacheDirectory + "alunos.xlsx";

      await FileSystem.writeAsStringAsync(path, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(path);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível exportar.");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="school" size={28} color="#FFD43B" />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={styles.headerTitle}>Listagem de Alunos</Text>
            <Text style={styles.headerSubtitle}>ETE Ministro Fernando Lyra</Text>
          </View>
          {/* Botão Voltar com seta para direita */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-forward" size={24} color="#FFD43B" />
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{alunos.length}</Text>
            <Text style={styles.summaryLabel}>Alunos</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
              {turmas.length}
            </Text>
            <Text style={styles.summaryLabel}>Turmas</Text>
          </View>
        </View>
      </View>

      {/* BUSCA */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="Buscar aluno ou matrícula..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#888"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Informações do Motorista */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Motorista</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#FFD43B" />
            <Text style={styles.infoText}>{motorista.nome}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#FFD43B" />
            <Text style={styles.infoText}>{motorista.telefone}</Text>
          </View>
        </View>

        {/* Pontos da Rota */}
        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Pontos da Rota</Text>
          {pontosRota.map((ponto, index) => (
            <View key={ponto.id} style={styles.pontoRow}>
              <View style={styles.pontoIndex}>
                <Text style={styles.pontoIndexText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pontoNome}>{ponto.nome}</Text>
              </View>
              <View style={styles.pontoHorario}>
                <Ionicons name="time" size={16} color="#FFD43B" />
                <Text style={styles.pontoHorarioText}>{ponto.horario}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FILTROS - movidos para dentro da seção de estudantes */}
        <View style={[styles.filterContainer, { zIndex: 10 }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 12 }}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                turmaSelecionada === "all" && styles.filterButtonActive,
              ]}
              onPress={() => setTurmaSelecionada("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  turmaSelecionada === "all" && styles.filterTextActive,
                ]}
              >
                Todas ({alunos.length})
              </Text>
            </TouchableOpacity>

            {turmas.map((turma) => {
              const count = alunos.filter((a) => a.turma === turma).length;
              return (
                <TouchableOpacity
                  key={turma}
                  style={[
                    styles.filterButton,
                    turmaSelecionada === turma && styles.filterButtonActive,
                  ]}
                  onPress={() => setTurmaSelecionada(turma)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      turmaSelecionada === turma && styles.filterTextActive,
                    ]}
                  >
                    {turma} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* LISTA DE ALUNOS */}
        {alunosFiltrados.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="alert-circle" size={40} color="gray" />
            <Text style={styles.emptyText}>Nenhum aluno encontrado</Text>
          </View>
        ) : (
          alunosFiltrados.map((aluno) => (
            <View key={aluno.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                    {aluno.nome.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardTitle}>{aluno.nome}</Text>
                  <Text style={styles.cardSubtitle}>
                    Responsável: {aluno.responsavel}
                  </Text>
                </View>
              </View>

              <View style={styles.cardInfoRow}>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Matrícula</Text>
                  <Text style={styles.infoValue}>{aluno.matricula}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Turma</Text>
                  <Text style={styles.infoValue}>{aluno.turma}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>{aluno.telefone}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.infoLabel}>Ponto</Text>
                  <Text style={styles.infoValue}>{aluno.ponto}</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Espaço antes do botão exportar */}
        <View style={{ height: 24 }} />

        {/* BOTÃO EXPORTAR */}
        <TouchableOpacity style={styles.exportButton} onPress={exportarExcel}>
          <Ionicons name="download" size={22} color="#000" />
          <Text style={styles.exportButtonText}>Exportar Lista de Alunos</Text>
        </TouchableOpacity>

        {/* Espaço final para scroll */}
        <View style={{ height: 40 }} />
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
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  headerTitle: { color: "#FFD43B", fontSize: 18, fontWeight: "bold" },
  headerSubtitle: { color: "#DDD", fontSize: 12 },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },

  summary: { flexDirection: "row", justifyContent: "space-around" },
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
    marginHorizontal: 12,
    marginTop: 12,
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

  infoSection: {
    backgroundColor: "#FFF",
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD43B",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#000",
  },

  pontoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  pontoIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFD43B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pontoIndexText: {
    fontWeight: "bold",
    color: "#000",
  },
  pontoNome: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  pontoHorario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pontoHorarioText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#FFD43B",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD43B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#000" },
  cardSubtitle: { fontSize: 12, color: "#555" },

  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  infoBlock: {
    minWidth: "23%",
    marginBottom: 8,
  },
  infoLabel: { fontSize: 12, color: "#666" },
  infoValue: { fontWeight: "bold", fontSize: 14 },

  emptyBox: { alignItems: "center", paddingVertical: 50 },
  emptyText: { marginTop: 8, color: "gray" },

  exportButton: {
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD43B",
    borderRadius: 12,
    padding: 14,
  },
  exportButtonText: { marginLeft: 8, fontWeight: "bold", color: "#000" },
});
