import React, { useState, useMemo, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Platform
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

/* -------------------------
   Tipo Notification
------------------------- */
type Notification = {
  id: string;
  title: string;
  description: string;
  priority: keyof typeof priorityColors;
  recipient: string;
  sender: string;
  type: string;
  date: string;
  read: boolean;
};

/* -------------------------
   Dados iniciais
------------------------- */
const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Período de Provas - Horários Especiais",
    description:
      "Atenção alunos: durante o período de provas os horários serão alterados conforme calendário escolar.",
    priority: "Alta",
    recipient: "Estudantes",
    sender: "Gestão Escolar",
    type: "Evento",
    date: "2025-06-01 08:30",
    read: false,
  },
  {
    id: "2",
    title: "Atraso devido ao trânsito",
    description:
      "O motorista da Rota de Peladas encontra-se com atraso estimado em 15 minutos devido ao trânsito.",
    priority: "Média",
    recipient: "Estudantes",
    sender: "Motorista Rota Peladas",
    type: "Aviso",
    date: "2025-06-02 07:15",
    read: false,
  },
  {
    id: "3",
    title: "Reunião de Pais",
    description:
      "Reunião de pais será na próxima quarta-feira, o ônibus do Xicuru chegará às 13:30",
    priority: "Alta",
    recipient: "Estudantes",
    sender: "Gestão Escolar",
    type: "Evento",
    date: "2025-05-28 19:00",
    read: true,
  },
  {
    id: "4",
    title: "Troca de Veículo - Rota 301",
    description: "O veículo da Rota 301 será substituído por manutenção.",
    priority: "Alta",
    recipient: "Estudantes",
    sender: "Gestão de Transporte",
    type: "Aviso",
    date: "2025-06-03 06:50",
    read: false,
  },
];

/* -------------------------
   Mapeamento de cores
------------------------- */
const priorityColors = {
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
  const filters = ["Todos", "Alta", "Eventos", "Motoristas", "Estudantes"];
  return (
    <View style={styles.filtersContainer}>
      {filters.map((f) => {
        const active = selectedFilter === f;
        return (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, active && styles.filterPillActive]}
            onPress={() => setSelectedFilter(f)}
          >
            <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/* -------------------------
   Componente: NotificationCard
------------------------- */
const NotificationCard: React.FC<{ item: Notification; onConfirm: (id: string) => void }> = ({
  item,
  onConfirm,
}) => {
  const isRead = !!item.read;
  const priorityColor = priorityColors[item.priority] || "#999";

  return (
    <View
      style={[
        styles.cardContainer,
        isRead && styles.cardRead,
        { borderLeftColor: priorityColor },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {isRead && <Text style={styles.readBadge}>✔ Lido</Text>}
      </View>

      <Text style={styles.cardMeta}>
        Prioridade: <Text style={{ color: priorityColor }}>{item.priority}</Text> • Destinatário: {item.recipient} • Enviado por: {item.sender} • {item.date}
      </Text>

      <Text style={styles.cardDescription}>{item.description}</Text>

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
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState("Todos");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleConfirmRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "Todos") return notifications;
    if (filter === "Alta") return notifications.filter((n) => n.priority === "Alta");
    if (filter === "Eventos") return notifications.filter((n) => n.type === "Evento");
    if (filter === "Motoristas") return notifications.filter((n) => n.recipient === "Motoristas");
    if (filter === "Estudantes") return notifications.filter((n) => n.recipient === "Estudantes");
    return notifications;
  }, [filter, notifications]);

  /* -------------------------
     Ativa modo imersivo Android com Expo
  ------------------------- */
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationCard item={item} onConfirm={handleConfirmRead} />}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 0 }} // sem padding no rodapé
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

  section: { paddingTop: 20, paddingBottom: 15,},

  filtersContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center", // centraliza os filtros
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
