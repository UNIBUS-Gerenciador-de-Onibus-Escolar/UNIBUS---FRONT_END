import React, { useState, useMemo, useEffect } from "react"; 
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform,
  Alert
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../BackEnd/IPconfig';

/* -------------------------
   Tipo Notification
------------------------- */
type Notification = {
  id: number;
  titulo: string;
  mensagem: string;
  prioridade: "Urgente" | "Alta" | "Média" | "Baixa";
  destinatario_tipo: string;
  remetente_tipo: string;
  tipo: string;
  created_at: string;
  lida: boolean;
};

/* -------------------------
   Mapeamento de cores
------------------------- */
const priorityColors = {
  Urgente: "#FF0000",
  Alta: "#FF5B5B",
  Média: "#FFB65B",
  Baixa: "#4CAF50",
};

/* -------------------------
   Componente: Header
------------------------- */
type HeaderProps = { unreadCount: number };
const Header: React.FC<HeaderProps> = ({ unreadCount }) => (
  <SafeAreaView edges={['top']} style={{ backgroundColor: "#FFD600" }}>
    <View
      style={[
        styles.headerContainer,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
      ]}
    >
      <Ionicons name="notifications-outline" size={30} color={"black"} />
      <View style={styles.headerTitleWrap}>
        <Text style={styles.headerTitle}>Notificações</Text>
        <Text style={styles.headerSubtitle}>
          {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
        </Text>
      </View>
      <View style={styles.headerRightPlaceholder} />
    </View>
  </SafeAreaView>
);

/* -------------------------
   Componente: Filters
------------------------- */
type FiltersProps = {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
};

const Filters: React.FC<FiltersProps> = ({ selectedFilter, setSelectedFilter }) => {
  const mainFilters = ["Todos", "Gestão", "Motoristas", "Prioridades"];
  const priorityFilters = ["Urgente", "Alta", "Média", "Baixa"];

  const [showPrioritySubfilters, setShowPrioritySubfilters] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const handleMainFilterPress = (filter: string) => {
    if (filter === "Prioridades") {
      setShowPrioritySubfilters(!showPrioritySubfilters);
    } else {
      setSelectedFilter(filter);
      setShowPrioritySubfilters(false);
      setSelectedPriority(null);
    }
  };

  const handlePriorityPress = (priority: string) => {
    setSelectedFilter(priority);
    setSelectedPriority(priority);
    setShowPrioritySubfilters(true); // mantém visível
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.filtersContainer}>
        {mainFilters.map((f) => {
          const active = selectedFilter === f && !priorityFilters.includes(f);
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterPill, active && styles.filterPillActive]}
              onPress={() => handleMainFilterPress(f)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showPrioritySubfilters && (
        <View style={[styles.filtersContainer, { marginTop: 8 }]}>
          {priorityFilters.map((p) => {
            const active = selectedPriority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => handlePriorityPress(p)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

/* -------------------------
   Componente: NotificationCard
------------------------- */
const NotificationCard: React.FC<{ item: Notification; onConfirm: (id: number) => void }> = ({
  item,
  onConfirm,
}) => {
  const isRead = !!item.lida;
  const priorityColor = priorityColors[item.prioridade] || "#999";

  return (
    <View
      style={[
        styles.cardContainer,
        isRead && styles.cardRead,
        { borderLeftColor: priorityColor },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        {isRead && <Text style={styles.readBadge}>✔ Lido</Text>}
      </View>

      <Text style={styles.cardMeta}>
        Prioridade: <Text style={{ color: priorityColor }}>{item.prioridade}</Text> • Destinatário: {item.destinatario_tipo || "Todos"} • Enviado por: {item.remetente_tipo || "Sistema"} • {new Date(item.created_at).toLocaleString()}
      </Text>

      <Text style={styles.cardDescription}>{item.mensagem}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={[styles.confirmButton, isRead && styles.confirmButtonDisabled]}
          onPress={() => !isRead && onConfirm(item.id)}
          disabled={isRead}
        >
          <Text style={styles.confirmButtonText}>{isRead ? "Confirmado" : "Confirmar Leitura"}</Text>
        </TouchableOpacity>

        <View style={{ width: 8 }} />
        <TouchableOpacity style={styles.smallAction} onPress={() => {}}>
          <Text style={styles.smallActionText}>⋯</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* -------------------------
   Tela principal
------------------------- */
export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("Todos");

  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const user = await AsyncStorage.getItem('estudante');
        if (!user) {
          console.warn("Nenhum usuário encontrado no AsyncStorage");
          return;
        }
        const parsed = JSON.parse(user);
        const id = parsed.profile_id || parsed.id;
        if (!id) return;
        setUsuarioId(id);
      } catch (error) {
        console.error("Erro ao carregar usuário logado", error);
      }
    };
    loadUserId();
  }, []);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const fetchNotifications = async () => {
    if (!usuarioId) return;
    try {
      const res = await fetch(`${API_URL}/api/notificacoes/listar/${usuarioId}`);
      const data = await res.json();

      // Mapeia para Notification, garantindo os campos corretos
      const mapped = data.map((n: any) => ({
        id: n.id,
        titulo: n.titulo,
        mensagem: n.mensagem,
        prioridade: n.prioridade,
        destinatario_tipo: n.destinatario_tipo,
        remetente_tipo: n.remetente_tipo,
        tipo: n.tipo,
        created_at: n.created_at,
        lida: n.lida,
      }));


      setNotifications(mapped);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar as notificações.");
    }
  };

  const handleConfirmRead = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/notificacoes/marcar_lida/${id}`, { method: "PUT" });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível marcar como lida.");
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "Todos") return notifications;

    if (["Urgente", "Alta", "Média", "Baixa"].includes(filter))
      return notifications.filter(n => n.prioridade === filter);

    if (filter === "Motoristas")
      return notifications.filter(n => n.remetente_tipo.toLowerCase() === "motoristas");

    if (filter === "Gestão")
      return notifications.filter(n => n.remetente_tipo.toLowerCase() === "gestão");

    return notifications;
  }, [filter, notifications]);

  useEffect(() => {
    if (!usuarioId) return;
    fetchNotifications();
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, [usuarioId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Header unreadCount={unreadCount} />

      <View style={{ flex: 1 }}>
        <View style={styles.section}>
          <Filters selectedFilter={filter} setSelectedFilter={setFilter} />
        </View>

        <FlatList
          data={filteredNotifications}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <NotificationCard item={item} onConfirm={handleConfirmRead} />}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 0 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

/* -------------------------
   Styles
------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E6E6",
    backgroundColor: "#FFD600",
  },
  headerTitleWrap: { flex: 1, paddingLeft: 15 },
  headerTitle: { fontSize: 25, fontWeight: "700", color: "#111" },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 2 },
  headerRightPlaceholder: { width: 36, alignItems: "center" },

  section: { paddingTop: 20, paddingBottom: 15 },

  filtersContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center",
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#EEE"
  },
  filterPillActive: { backgroundColor: "#FFD600", borderColor: "#E6B800" },
  filterText: { fontSize: 13, color: "#333" },
  filterTextActive: { fontWeight: "700", color: "#111" },

  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardRead: { opacity: 0.75, backgroundColor: "#FBFBFB" },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
  readBadge: { marginLeft: 8, color: "#3EA055", fontWeight: "700" },
  cardMeta: { marginTop: 6, fontSize: 12, color: "#666" },
  cardDescription: { marginTop: 10, fontSize: 14, color: "#333", lineHeight: 20 },
  cardFooter: { marginTop: 12, flexDirection: "row", alignItems: "center" },
  confirmButton: { backgroundColor: "#EFEFEF", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  confirmButtonDisabled: { backgroundColor: "#E6E6E6" },
  confirmButtonText: { fontSize: 14, fontWeight: "700", color: "#333" },
  smallAction: { padding: 8, borderRadius: 8 },
  smallActionText: { fontSize: 18, color: "#999" },
});
