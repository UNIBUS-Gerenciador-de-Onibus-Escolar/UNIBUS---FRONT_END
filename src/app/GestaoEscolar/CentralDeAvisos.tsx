import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import { API_URL } from "../../BackEnd/IPconfig";

type Tab = "send" | "history";
type Recipient = "Todos" | "Estudantes" | "Motoristas";
type Priority = "Urgente" | "Alta" | "Média" | "Baixa";

type EnviosItem = {
  id: number;
  titulo: string;
  mensagem: string;
  destinatario_tipo: Recipient;
  routes: string[] | null;
  drivers: string[] | null;
  prioridade: Priority;
  created_at: string;
  totalRecipients: number;
  readCount: number;
};

type RouteItem = { id: string; nome_rota: string };
type DriverItem = { id: string; nome_completo: string; rota?: string };

export default function AdminNoticesScreen() {
  const router = useRouter();

  // tabs
  const [activeTab, setActiveTab] = useState<Tab>("send");

  // form
  const [recipient, setRecipient] = useState<Recipient>("Estudantes");
  const [priority, setPriority] = useState<Priority>("Baixa");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);

  // fetched lists
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [enviosHistory, setEnviosHistory] = useState<EnviosItem[]>([]);

  // modals
  type ModalKind = "route" | "driver" | "priority" | "noticeType" | null;
  const [modalKind, setModalKind] = useState<ModalKind>(null);

  // loading states
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchRoutes();
    fetchDrivers();
    fetchHistory();
  }, []);

  // filtros
  type Filter = "Todos" | "Estudantes" | "Motoristas" | "priority";
  const [filter, setFilter] = useState<Filter>("Todos");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "Todas">(
    "Todas"
  );



  // fetch rotas
  async function fetchRoutes() {
    try {
      setLoadingRoutes(true);
      const res = await fetch(`${API_URL}/api/notificacoes/rotas`);
      const data = await res.json();
      setRoutes(data || []);
    } catch (err) {
      console.error("Erro rotas:", err);
    } finally {
      setLoadingRoutes(false);
    }
  }

  // fetch drivers
  async function fetchDrivers() {
    try {
      setLoadingDrivers(true);
      const res = await fetch(`${API_URL}/api/notificacoes/motoristas`);
      const data = await res.json();
      setDrivers(data || []);
    } catch (err) {
      console.error("Erro drivers:", err);
    } finally {
      setLoadingDrivers(false);
    }
  }

  // fetch history (envios)
  async function fetchHistory() {
    try {
      setLoadingHistory(true);
      const res = await fetch(`${API_URL}/api/notificacoes/historico`);
      const data = await res.json();
      setEnviosHistory(data || []);
    } catch (err) {
      console.error("Erro historico:", err);
    } finally {
      setLoadingHistory(false);
    }
  }

  // Função para deletar notificação
  const apagarNotificacao = async (envio_id: string) => {
    try {
      const resp = await fetch(
        `${API_URL}/api/notificacoes/apagar/${envio_id}`,
        {
          method: "DELETE",
        }
      );
      const data = await resp.json();

      if (data.success) {
        // Atualiza lista local removendo o envio apagado
        setEnviosHistory((prev) =>
          prev.filter((item: EnviosItem) => item.id !== Number(envio_id))
        );
        alert("Notificação apagada com sucesso!");
      } else {
        alert("Erro ao apagar notificação: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erro na conexão com o servidor.");
    }
  };

  // helper UI labels
  function recipientLabel() {
    if (recipient === "Todos") return "Todos";
    if (recipient === "Estudantes")
      return selectedRoutes.length
        ? `Estudantes • ${selectedRoutes.join(", ")}`
        : "Estudantes (selecione rotas)";
    return selectedDrivers.length
      ? `Motoristas • ${selectedDrivers.join(", ")}`
      : "Motoristas (selecione)";
  }

  // modal options
  const modalOptions = useMemo(() => {
    if (modalKind === "route")
      return routes.map((r) => ({ label: r.nome_rota, value: r.id }));
    if (modalKind === "driver")
      return drivers.map((d) => ({ label: d.nome_completo, value: d.id }));
    if (modalKind === "priority")
      return [
        { label: "Urgente", value: "Urgente" },
        { label: "Alta", value: "Alta" },
        { label: "Média", value: "Média" },
        { label: "Baixa", value: "Baixa" },
      ];
    return [];
  }, [modalKind, routes, drivers]);

  function toggleRouteSelection(routeId: string) {
    setSelectedRoutes((prev) =>
      prev.includes(routeId)
        ? prev.filter((r) => r !== routeId)
        : [...prev, routeId]
    );
  }

  function toggleDriverSelection(driverId: string) {
    setSelectedDrivers((prev) =>
      prev.includes(driverId)
        ? prev.filter((d) => d !== driverId)
        : [...prev, driverId]
    );
  }

  function validateSend() {
    if (!title.trim()) return "Informe um título.";
    if (!message.trim()) return "Informe uma mensagem.";
    if (recipient === "Estudantes" && selectedRoutes.length === 0)
      return "Selecione ao menos 1 rota para estudantes.";
    if (recipient === "Motoristas" && selectedDrivers.length === 0)
      return "Selecione ao menos 1 motorista.";
    return null;
  }

  // Envio: monta payload conforme seleção e chama /enviar
  async function handleSend() {
  const err = validateSend();
  if (err) {
    Alert.alert('Campos obrigatórios', err);
    return;
  }

  setSending(true);
  try {
    // Mapeia recipient para o formato correto do backend
    const destinatarioMap: Record<Recipient, string> = {
      Todos: 'Todos',
      Estudantes: 'Estudantes',
      Motoristas: 'Motoristas',
    };

    const body = {
      remetente_tipo: 'Gestão', // agora com G maiúsculo e acento
      remetente_id: null,
      destinatario_tipo: destinatarioMap[recipient], 
      routes: recipient === 'Estudantes' ? selectedRoutes : [],
      drivers: recipient === 'Motoristas' ? selectedDrivers : [],
      titulo: title.trim(),
      mensagem: message.trim(),
      prioridade: priority,
      tipo: 'aviso'
    };

    const res = await fetch(`${API_URL}/api/notificacoes/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data && data.success) {
      Alert.alert('Sucesso', `Notificação enviada para ${data.totalRecipients} destinatários.`);
      
      // limpa form
      setTitle('');
      setMessage('');
      setSelectedDrivers([]);
      setSelectedRoutes([]);
      setRecipient('Estudantes'); // ou 'Todos', conforme seu fluxo
      setPriority('Baixa');

      fetchHistory();
      setActiveTab('history');
    } else {
      Alert.alert('Erro', data.error || 'Falha ao enviar notificação.');
      console.error('send error', data);
    }
  } catch (err) {
    console.error('Erro enviar:', err);
    Alert.alert('Erro', 'Não foi possível enviar a notificação.');
  } finally {
    setSending(false);
  }
}


  // lista filtrada
  const filteredHistory = useMemo(() => {
  let list = [...enviosHistory];
  if (filter === 'Estudantes') list = list.filter(n => n.destinatario_tipo === 'Estudantes');
  if (filter === 'Motoristas') list = list.filter(n => n.destinatario_tipo === 'Motoristas');
  if (filter === 'priority' && priorityFilter !== 'Todas') {
    list = list.filter(n => n.prioridade === priorityFilter);
  }
  return list;
}, [enviosHistory, filter, priorityFilter]);

  // componente FilterChip
  function FilterChip({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) {
    return (
      <TouchableOpacity
        style={[styles.filterChip, active && { backgroundColor: "#FFCC00" }]}
        onPress={onPress}
      >
        <Text style={[styles.filterChipText, active && { fontWeight: "700" }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  // Render modal content for multi-select route/driver and priority
  function SelectModal({
    visible,
    title,
    options,
    onClose,
    kind,
  }: {
    visible: boolean;
    title: string;
    options: { label: string; value: string }[];
    onClose: () => void;
    kind: ModalKind;
  }) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <Pressable style={[styles.modalCard, { maxHeight: "70%" }]}>
              <Text style={styles.modalTitle}>{title}</Text>
              <FlatList
                data={options}
                keyExtractor={(o) => o.value}
                ItemSeparatorComponent={() => (
                  <View style={styles.modalSeparator} />
                )}
                renderItem={({ item }) => {
                  const checked =
                    kind === "route"
                      ? selectedRoutes.includes(item.value)
                      : kind === "driver"
                      ? selectedDrivers.includes(item.value)
                      : undefined;
                  return (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        if (kind === "route") toggleRouteSelection(item.value);
                        else if (kind === "driver")
                          toggleDriverSelection(item.value);
                        else if (kind === "priority")
                          setPriority(item.value as Priority);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalItemText,
                          checked ? { fontWeight: "700" } : {},
                        ]}
                      >
                        {item.label}
                      </Text>
                      {checked && (
                        <MaterialIcons name="check" size={18} color="#000" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  /* =====================
     RENDER
  ===================== */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <View style={styles.iconWrapper}>
              <Ionicons name="chatbubble-ellipses" size={22} color="black" />
            </View>
            <View>
              <Text style={styles.headerText}>Central de Avisos</Text>
              <Text style={styles.headerSubtitle}>
                Comunicação com estudantes e motoristas
              </Text>
            </View>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "send" && styles.tabActive]}
            onPress={() => setActiveTab("send")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "send" && styles.tabTextActive,
              ]}
            >
              Enviar Aviso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "history" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.tabTextActive,
              ]}
            >
              Histórico ({enviosHistory.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "send" ? (
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tipos informativos (mantive do design) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tipos de Aviso</Text>
              <Text style={{ color: "#666" }}>
                Use o tipo para destacar prioridade do aviso.
              </Text>
              <TouchableOpacity
                style={[styles.modalButton, { marginTop: 12 }]}
                onPress={() => setModalKind("noticeType")}
              >
                <Text style={styles.modalButtonText}>Ver tipos</Text>
              </TouchableOpacity>
            </View>

            {/* Destinatários */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Destinatários</Text>
              <View style={styles.recipientRow}>
                {(["Todos", "Estudantes", "Motoristas"] as Recipient[]).map((type) => {
                  const labels: Record<Recipient, string> = {
                    Todos: "Todos",
                    Estudantes: "Estudantes",
                    Motoristas: "Motoristas",
                  };
                  const icon =
                    type === "Estudantes"
                      ? "user-graduate"
                      : type === "Motoristas"
                      ? "user-tie"
                      : "users";
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.recipientButton,
                        recipient === type && styles.recipientSelected,
                      ]}
                      onPress={() => {
                        setRecipient(type);
                        setSelectedRoutes([]);
                        setSelectedDrivers([]);
                      }}
                    >
                      <FontAwesome5 name={icon} size={18} color="black" />
                      <Text style={styles.recipientLabel}>{labels[type]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Seletores dependentes */}
              {recipient === "Estudantes" && (
                <>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setModalKind("route")}
                  >
                    <Text style={styles.modalButtonText}>
                      {selectedRoutes.length
                        ? `${selectedRoutes.length} rota(s) selecionada(s)`
                        : "Selecione uma ou mais rotas"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ color: "#666", marginTop: 6 }}>
                    {selectedRoutes.length
                      ? `Rotas escolhidas: ${selectedRoutes
                          .map(
                            (id) => routes.find((r) => r.id === id)?.nome_rota
                          )
                          .filter(Boolean)
                          .join(", ")}`
                      : ""}
                  </Text>
                </>
              )}

              {recipient === "Motoristas" && (
                <>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setModalKind("driver")}
                  >
                    <Text style={styles.modalButtonText}>
                      {selectedDrivers.length
                        ? `${selectedDrivers.length} motorista(s)`
                        : "Selecione motoristas"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {recipient === "Todos" && (
                <Text style={{ color: "#666", marginTop: 8 }}>
                  Enviará para todos (estudantes e motoristas de todas as
                  rotas).
                </Text>
              )}
            </View>

            {/* Conteúdo */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Conteúdo</Text>
              <TextInput
                placeholder="Título"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                placeholderTextColor="#999"
              />
              <TextInput
                placeholder="Mensagem"
                value={message}
                onChangeText={setMessage}
                style={[
                  styles.input,
                  { height: 120, textAlignVertical: "top" },
                ]}
                multiline
              />
            </View>

            {/* Prioridade */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Prioridade</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalKind("priority")}
              >
                <View style={styles.priorityRow}>
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: priorityColor(priority) },
                    ]}
                  />
                  <Text style={styles.modalButtonText}>{priority}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.sendButton, { marginBottom: 130 }]}
              onPress={handleSend}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator />
              ) : (
                <MaterialIcons name="send" size={20} color="black" />
              )}
              <Text style={styles.sendButtonText}>
                {sending ? "Enviando..." : "Enviar Aviso"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <View style={styles.filtersRow}>
              <Text style={{ fontWeight: "700" }}>Filtrar histórico</Text>
              <TouchableOpacity
                onPress={fetchHistory}
                style={{ paddingHorizontal: 8 }}
              >
                <MaterialIcons name="refresh" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Filtros */}
            <View style={styles.filtersRow}>
              <FilterChip
                label="Todos"
                active={filter === "Todos"}
                onPress={() => setFilter("Todos")}
              />
              <FilterChip
                label="Estudantes"
                active={filter === "Estudantes"}
                onPress={() => setFilter("Estudantes")}
              />
              <FilterChip
                label="Motoristas"
                active={filter === "Motoristas"}
                onPress={() => setFilter("Motoristas")}
              />
              <FilterChip
                label="Prioridades"
                active={filter === "priority"}
                onPress={() => setFilter("priority")}
              />
              <TouchableOpacity
                onPress={fetchHistory}
                style={{ paddingHorizontal: 8 }}
              >
                <MaterialIcons name="refresh" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Filtro secundário de prioridade */}
            {filter === "priority" && (
              <View style={styles.priorityFiltersRow}>
                {(
                  ["Todas", "Urgente", "Alta", "Média", "Baixa"] as (
                    | Priority
                    | "Todas"
                  )[]
                ).map((p) => (
                  <FilterChip
                    key={p}
                    label={p}
                    active={priorityFilter === p}
                    onPress={() => setPriorityFilter(p)}
                  />
                ))}
              </View>
            )}

            {loadingHistory ? (
              <View style={{ padding: 20 }}>
                <ActivityIndicator />
              </View>
            ) : (
              <FlatList
                data={filteredHistory}
                keyExtractor={(i) => i.id.toString()}
                contentContainerStyle={{ paddingBottom: 24 }}
                renderItem={({ item }) => (
                  <View style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTitle}>{item.titulo}</Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor: priorityColor(
                              item.prioridade as Priority
                            ),
                          },
                        ]}
                      >
                        <MaterialIcons
                          name="priority-high"
                          size={14}
                          color="#fff"
                        />
                        <Text style={styles.priorityText}>
                          {item.prioridade}
                        </Text>
                        <TouchableOpacity
                          style={styles.lixeiraBtn}
                          onPress={() => apagarNotificacao(Number(item.id).toString())}
                        >
                          <Ionicons name="trash" size={24} color="red" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.historyMessage}>{item.mensagem}</Text>

                    <View style={styles.historyMetaRow}>
                      <MaterialIcons name="groups" size={16} color="#555" />
                    <Text style={styles.historyMeta}>
                     Destinatários:{" "}
                     {item.destinatario_tipo === "Todos"
                       ? "Todos"
                       : item.destinatario_tipo === "Estudantes"
                       ? `Estudantes (${item.routes?.length || 0} rota${item.routes?.length === 1 ? "" : "s"})`
                       : `Motoristas (${item.drivers?.length || 0} motorista${item.drivers?.length === 1 ? "" : "s"})`}
                      </Text>


                    </View>

                    <View style={styles.historyMetaRow}>
                      <MaterialIcons name="schedule" size={16} color="#555" />
                      <Text style={styles.historyMeta}>
                        Enviado: {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.historyMetaRow}>
                      <MaterialIcons name="done-all" size={16} color="#555" />
                      <Text style={styles.historyMeta}>
                        {item.readCount}/{item.totalRecipients} leram
                      </Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ paddingVertical: 32, alignItems: "center" }}>
                    <Text style={{ color: "#777" }}>
                      Nenhum aviso enviado ainda.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}

        {/* SelectModal */}
        <SelectModal
          visible={!!modalKind && modalKind !== "noticeType"}
          title={
            modalKind === "route"
              ? "Selecione uma ou mais rotas"
              : modalKind === "driver"
              ? "Selecione motoristas"
              : "Selecione a prioridade"
          }
          options={modalOptions}
          onClose={() => setModalKind(null)}
          kind={modalKind}
        />

        {/* noticeType modal (informativo) */}
        <Modal
          visible={modalKind === "noticeType"}
          transparent
          animationType="fade"
        >
          <TouchableWithoutFeedback onPress={() => setModalKind(null)}>
            <View style={styles.modalOverlay}>
              <Pressable style={[styles.modalCard, { maxHeight: "70%" }]}>
                <Text style={styles.modalTitle}>Tipos de Aviso</Text>
                <Text style={{ color: "#666", marginBottom: 8 }}>
                  Período de Provas, Mudança de Rota, Manutenção, Emergência,
                  Eventos
                </Text>
                <TouchableOpacity
                  onPress={() => setModalKind(null)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>Fechar</Text>
                </TouchableOpacity>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------- helpers ---------- */
function priorityColor(priority: Priority) {
  switch (priority) {
    case "Urgente":
      return "#ff5252";
    case "Alta":
      return "#ff9800";
    case "Média":
      return "#2196f3";
    default:
      return "#4caf50";
  }
}

/* ---------- styles (mantive o design da simulação) ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  priorityFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
    alignItems: "center",
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterChipText: {
    color: "#000",
    fontWeight: "500",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 70,
    backgroundColor: "black",
  },
  backButton: { marginRight: 12 },
  headerTitle: { flexDirection: "row", alignItems: "center" },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerText: { fontSize: 22, fontWeight: "bold", color: "white" },
  headerSubtitle: { fontSize: 12, color: "#ccc" },

  tabs: { flexDirection: "row", marginVertical: 12, paddingHorizontal: 16 },
  tabButton: {
    flex: 1,
    padding: 12,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "white",
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tabActive: { backgroundColor: "#FFCC00", borderColor: "black" },
  tabText: { color: "black", fontWeight: "600" },
  tabTextActive: { color: "black" },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "black",
  },

  recipientRow: { flexDirection: "row", justifyContent: "space-between" },
  recipientButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "white",
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 4,
  },
  recipientSelected: { backgroundColor: "#FFF9C4", borderColor: "#FFCC00" },
  recipientLabel: { fontWeight: "bold", marginTop: 4, color: "black" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    color: "black",
  },

  modalButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
    marginTop: 8,
  },
  modalButtonText: { color: "#000" },

  priorityRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },

  sendButton: {
    flexDirection: "row",
    marginBottom: 0,
    backgroundColor: "#FFCC00",
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
    color: "black",
  },

  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 8,
  },

  historyCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
    flex: 1,
    paddingRight: 8,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  historyMessage: { fontSize: 14, color: "#333", marginVertical: 8 },
  historyMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  historyMeta: { fontSize: 12, color: "#666", marginLeft: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "60%",
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    color: "#000",
  },
  modalSeparator: { height: 1, backgroundColor: "#eee" },
  modalItem: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalItemText: { color: "#000" },
  modalCloseBtn: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  modalCloseText: { color: "#333", fontWeight: "600" },
  lixeiraBtn: {
    position: "absolute",
    top: 100,
    right: 10,
    padding: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
  },
});
