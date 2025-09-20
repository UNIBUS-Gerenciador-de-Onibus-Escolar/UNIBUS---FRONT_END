// AdminNoticesScreen.tsx
// Tela única com duas seções bem separadas: "Enviar Aviso" e "Histórico"
// - Sem bibliotecas externas de UI: só React Native/Expo
// - DropDowns implementados com Modal + FlatList
// - Comentários detalhando toda a lógica para facilitar manutenção

import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

/* -----------------------------------------------------------
 * Tipos e estruturas auxiliares
 * --------------------------------------------------------- */
type Tab = 'send' | 'history';
type Recipient = 'students' | 'drivers' | 'both';
type Priority = 'Urgente' | 'Alta' | 'Média' | 'Baixa';

type Notice = {
  id: number;
  title: string;
  message: string;
  recipient: Recipient;
  // Para estudantes: rotas; para motoristas: rota única + driver
  routes: string[];
  driver: string | null;
  priority: Priority;
  sentAt: string; // ISO string para data/hora
  readCount: number;
  totalRecipients: number;
};

type ModalKind = 'route' | 'driver' | 'priority' | 'noticeType' | null;

/* -----------------------------------------------------------
 * Dados simulados
 * --------------------------------------------------------- */

// Rotas disponíveis
const ROUTES = ['Rota 501', 'Rota 502', 'Rota 503', 'Rota 504'];

// Motoristas por rota
const DRIVERS_BY_ROUTE: Record<string, string[]> = {
  'Rota 501': ['João Silva', 'Pedro Souza'],
  'Rota 502': ['Maria Oliveira'],
  'Rota 503': ['Carlos Pereira', 'Ana Santos'],
  'Rota 504': ['Fernanda Lima'],
};

// Tipos de aviso exibidos no card da aba "Enviar Aviso"
const NOTICE_TYPES = [
  { title: 'Período de Provas', desc: 'Para comunicar horários especiais durante exames' },
  { title: 'Mudança de Rota', desc: 'Alterações em trajetos e horários' },
  { title: 'Manutenção', desc: 'Problemas técnicos e reparos' },
  { title: 'Emergência', desc: 'Situações urgentes e críticas' },
  { title: 'Eventos', desc: 'Feriados e eventos especiais' },
] as const;

// Histórico inicial simulado
const INITIAL_HISTORY: Notice[] = [
  {
    id: 1,
    title: 'Período de Provas - Horários Especiais',
    message:
      'Durante a semana de provas (15-19/01), todos os ônibus sairão 1 hora mais cedo. Motoristas devem confirmar os novos horários.',
    recipient: 'drivers',
    routes: ['Rota 501'],
    driver: 'João Silva',
    priority: 'Alta',
    sentAt: '2025-01-12T08:30:00',
    readCount: 8,
    totalRecipients: 12,
  },
  {
    id: 2,
    title: 'Nova Rota 504 - Bairro Jardins',
    message: 'Aprovada nova rota para o bairro Jardins. Estudantes da área devem atualizar seus cartões.',
    recipient: 'students',
    routes: ['Rota 504'],
    driver: null,
    priority: 'Média',
    sentAt: '2025-01-10T10:15:00',
    readCount: 67,
    totalRecipients: 120,
  },
  {
    id: 3,
    title: 'Aviso Geral',
    message: 'A escola estará fechada amanhã devido a manutenção elétrica.',
    recipient: 'both',
    routes: [],
    driver: null,
    priority: 'Urgente',
    sentAt: '2025-01-09T18:45:00',
    readCount: 220,
    totalRecipients: 240,
  },
];

/* -----------------------------------------------------------
 * Funções utilitárias
 * --------------------------------------------------------- */

// Formata ISO/string/Date para dd/mm/aa - hh:mm (pt-BR)
function formatTimestamp(ts: string | Date) {
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Retorna legenda amigável para destinatário
function getRecipientLabel(recipient: Recipient, routes: string[], driver: string | null) {
  if (recipient === 'both') return 'Todos';
  if (recipient === 'students') {
    return routes.length ? `Estudantes • ${routes.join(', ')}` : 'Estudantes';
  }
  // drivers
  if (driver && routes.length) return `Motorista • ${driver} (${routes[0]})`;
  if (routes.length) return `Motoristas • ${routes[0]}`;
  return 'Motoristas';
}

// Cores de prioridade (badge)
function priorityColor(priority: Priority) {
  switch (priority) {
    case 'Urgente':
      return '#ff5252';
    case 'Alta':
      return '#ff9800';
    case 'Média':
      return '#2196f3';
    default:
      return '#4caf50';
  }
}

/* -----------------------------------------------------------
 * Componente de Modal genérico para seleção (route/driver/priority)
 * --------------------------------------------------------- */

type Option = { label: string; value: string };

function SelectModal({
  visible,
  title,
  options,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: Option[];
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>{title}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item.value)}>
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

/* -----------------------------------------------------------
 * Componente principal da tela
 * --------------------------------------------------------- */

export default function AdminNoticesScreen() {
  const router = useRouter();

  // --------------------- Estado geral da tela ---------------------
  const [activeTab, setActiveTab] = useState<Tab>('history'); // pode iniciar na aba que preferir
  const [history, setHistory] = useState<Notice[]>(INITIAL_HISTORY);

  // --------------------- Estado (Enviar Aviso) ---------------------
  const [recipient, setRecipient] = useState<Recipient>('students');
  const [priority, setPriority] = useState<Priority>('Baixa');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  // Para estudantes: 1 rota (requisito); para motoristas: 1 rota + 1 motorista
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  // Modal de seleção
  const [modalKind, setModalKind] = useState<ModalKind>(null);

  // Opções do modal conforme tipo
  const modalOptions: Option[] = useMemo(() => {
    if (modalKind === 'route') {
      return ROUTES.map((r) => ({ label: r, value: r }));
    }
    if (modalKind === 'driver') {
      const list = selectedRoute ? DRIVERS_BY_ROUTE[selectedRoute] || [] : [];
      return list.map((d) => ({ label: d, value: d }));
    }
    if (modalKind === 'priority') {
      return [
        { label: 'Urgente', value: 'Urgente' },
        { label: 'Alta', value: 'Alta' },
        { label: 'Média', value: 'Média' },
        { label: 'Baixa', value: 'Baixa' },
      ];
    }
    if (modalKind === 'noticeType') {
      // Exibimos os NOTICE_TYPES como texto (não altera estado; é só informativo)
      return NOTICE_TYPES.map((n, idx) => ({ label: `${n.title} — ${n.desc}`, value: String(idx) }));
    }
    return [];
  }, [modalKind, selectedRoute]);

  // Ação ao selecionar no modal
  function handleSelect(value: string) {
    if (modalKind === 'route') {
      setSelectedRoute(value);
      setSelectedDriver(null); // reset driver quando troca rota
    } else if (modalKind === 'driver') {
      setSelectedDriver(value);
    } else if (modalKind === 'priority') {
      setPriority(value as Priority);
    }
    setModalKind(null);
  }

  // Validações simples antes de enviar
  function validateSend(): string | null {
    if (!title.trim()) return 'Informe um título.';
    if (!message.trim()) return 'Informe uma mensagem.';
    if (recipient === 'students' && !selectedRoute) return 'Selecione a rota dos estudantes.';
    if (recipient === 'drivers' && !selectedRoute) return 'Selecione a rota.';
    if (recipient === 'drivers' && !selectedDriver) return 'Selecione o motorista.';
    return null;
  }

  // Envio simulado (adiciona ao histórico)
  function handleSend() {
    const error = validateSend();
    if (error) {
      Alert.alert('Campos obrigatórios', error);
      return;
    }

    const now = new Date().toISOString();
    const newNotice: Notice = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      recipient,
      routes: selectedRoute ? [selectedRoute] : [],
      driver: recipient === 'drivers' ? selectedDriver : null,
      priority,
      sentAt: now,
      // números simulados; em app real virão do backend
      totalRecipients:
        recipient === 'both' ? 200 : recipient === 'students' ? 120 : selectedRoute ? DRIVERS_BY_ROUTE[selectedRoute].length : 10,
      readCount: 0,
    };

    setHistory((prev) => [newNotice, ...prev]);

    // Limpa o formulário após envio
    setTitle('');
    setMessage('');
    setSelectedRoute(null);
    setSelectedDriver(null);
    setRecipient('students');
    setPriority('Baixa');

    Alert.alert('Sucesso', 'Aviso enviado!');
    // opcional: navegar para histórico
    setActiveTab('history');
  }

  // --------------------- Estado (Histórico) + Filtros ---------------------

  type Filter = 'all' | 'students' | 'drivers' | 'priority';
  const [filter, setFilter] = useState<Filter>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'Todas'>('Todas');

  // Lista filtrada para renderização
  const filteredHistory = useMemo(() => {
    let list = [...history];
    if (filter === 'students') list = list.filter((n) => n.recipient === 'students');
    if (filter === 'drivers') list = list.filter((n) => n.recipient === 'drivers');
    if (filter === 'priority' && priorityFilter !== 'Todas') {
      list = list.filter((n) => n.priority === priorityFilter);
    }
    return list;
  }, [history, filter, priorityFilter]);

  // Deletar item do histórico
  function handleDelete(id: number) {
    Alert.alert('Excluir aviso', 'Tem certeza que deseja excluir este aviso?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => setHistory((prev) => prev.filter((n) => n.id !== id)),
      },
    ]);
  }

  // Placeholder para “ver detalhes” (em app real: navegar para tela de detalhes)
  function handleView(id: number) {
    const notice = history.find((n) => n.id === id);
    if (!notice) return;
    Alert.alert('Detalhes do aviso', `${notice.title}\n\n${notice.message}`);
  }

  /* =======================================================================
   * RENDERIZAÇÃO
   * ===================================================================== */

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* --------------------- HEADER --------------------- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <View style={styles.iconWrapper}>
              <Ionicons name="chatbubble-ellipses" size={22} color="black" />
            </View>
            <View>
              <Text style={styles.headerText}>Central de Avisos</Text>
              <Text style={styles.headerSubtitle}>Comunicação com estudantes e motoristas</Text>
            </View>
          </View>
        </View>

        {/* --------------------- TABS --------------------- */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'send' && styles.tabActive]}
            onPress={() => setActiveTab('send')}
          >
            <Text style={[styles.tabText, activeTab === 'send' && styles.tabTextActive]}>Enviar Aviso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              Histórico ({history.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* --------------------- CONTEÚDO DAS ABAS --------------------- */}

        {activeTab === 'send' ? (
          // ===================== ABA: ENVIAR AVISO =====================
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            {/* Card: Tipos de Aviso (informativo) */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tipos de Aviso</Text>
              {NOTICE_TYPES.map((item, idx) => (
                <View key={idx} style={styles.noticeTypeItem}>
                  <Text style={styles.noticeTypeTitle}>{item.title}</Text>
                  <Text style={styles.noticeTypeDesc}>{item.desc}</Text>
                </View>
              ))}
              {/* Botão opcional para abrir o modal listando tudo em uma lista rolável */}
              <TouchableOpacity style={[styles.modalButton, { marginTop: 12 }]} onPress={() => setModalKind('noticeType')}>
                <Text style={styles.modalButtonText}>Ver todos os tipos</Text>
              </TouchableOpacity>
            </View>

            {/* Card: Destinatários */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Destinatários</Text>

              {/* Seletor de tipo de destinatário */}
              <View style={styles.recipientRow}>
                {(['both', 'students', 'drivers'] as Recipient[]).map((type) => {
                  const labels: Record<Recipient, string> = {
                    both: 'Todos',
                    students: 'Estudantes',
                    drivers: 'Motoristas',
                  };
                  const icon =
                    type === 'students' ? 'user-graduate' : type === 'drivers' ? 'user-tie' : 'users';

                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.recipientButton, recipient === type && styles.recipientSelected]}
                      onPress={() => {
                        setRecipient(type);
                        // Reset seleções dependentes quando muda a categoria
                        setSelectedRoute(null);
                        setSelectedDriver(null);
                      }}
                    >
                      <FontAwesome5 name={icon} size={18} color="black" />
                      <Text style={styles.recipientLabel}>{labels[type]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Regras de seleção por tipo */}
              {recipient === 'students' && (
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalKind('route')}>
                  <Text style={styles.modalButtonText}>
                    {selectedRoute ?? 'Selecione a rota dos estudantes'}
                  </Text>
                </TouchableOpacity>
              )}

              {recipient === 'drivers' && (
                <>
                  <TouchableOpacity style={styles.modalButton} onPress={() => setModalKind('route')}>
                    <Text style={styles.modalButtonText}>
                      {selectedRoute ?? 'Selecione a rota'}
                    </Text>
                  </TouchableOpacity>

                  {selectedRoute && (
                    <TouchableOpacity style={styles.modalButton} onPress={() => setModalKind('driver')}>
                      <Text style={styles.modalButtonText}>
                        {selectedDriver ?? 'Selecione o motorista da rota'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Card: Conteúdo do Aviso */}
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
                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                placeholderTextColor="#999"
                multiline
              />
            </View>

            {/* Card: Prioridade */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Prioridade</Text>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalKind('priority')}>
                <View style={styles.priorityRow}>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor(priority) }]} />
                  <Text style={styles.modalButtonText}>{priority}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Botão Enviar (sempre visível e com margem inferior) */}
            <TouchableOpacity style={[styles.sendButton, { marginBottom: 130 }]} onPress={handleSend}>
              <MaterialIcons name="send" size={20} color="black" />
              <Text style={styles.sendButtonText}>Enviar Aviso</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          // ===================== ABA: HISTÓRICO =====================
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {/* Filtros fora dos cards */}
            <View style={styles.filtersRow}>
              <FilterChip label="Todos" active={filter === 'all'} onPress={() => setFilter('all')} />
              <FilterChip label="Estudantes" active={filter === 'students'} onPress={() => setFilter('students')} />
              <FilterChip label="Motoristas" active={filter === 'drivers'} onPress={() => setFilter('drivers')} />
              <FilterChip label="Prioridades" active={filter === 'priority'} onPress={() => setFilter('priority')} />
            </View>

            {/* Filtro secundário para prioridade quando o filtro é "priority" */}
            {filter === 'priority' && (
              <View style={styles.priorityFiltersRow}>
                {(['Todas', 'Urgente', 'Alta', 'Média', 'Baixa'] as (Priority | 'Todas')[]).map((p) => (
                  <FilterChip
                    key={p}
                    label={p}
                    active={priorityFilter === p}
                    onPress={() => setPriorityFilter(p)}
                  />
                ))}
              </View>
            )}

            {/* Lista do histórico (FlatList isolado — sem ScrollView, evita warning) */}
            <FlatList
              data={filteredHistory}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  {/* Cabeçalho do card: título + badge de prioridade + ações */}
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>{item.title}</Text>

                    <View style={[styles.priorityBadge, { backgroundColor: priorityColor(item.priority) }]}>
                      <MaterialIcons name="priority-high" size={14} color="#fff" />
                      <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                  </View>

                  {/* Mensagem */}
                  <Text style={styles.historyMessage}>{item.message}</Text>

                  {/* Meta 1: Destinatário */}
                  <View style={styles.historyMetaRow}>
                    <MaterialIcons name="groups" size={16} color="#555" />
                    <Text style={styles.historyMeta}>
                      {getRecipientLabel(item.recipient, item.routes, item.driver)}
                    </Text>
                  </View>

                  {/* Meta 2: Data/hora de envio */}
                  <View style={styles.historyMetaRow}>
                    <MaterialIcons name="schedule" size={16} color="#555" />
                    <Text style={styles.historyMeta}>Enviado: {formatTimestamp(item.sentAt)}</Text>
                  </View>

                  {/* Meta 3: Leitura */}
                  <View style={styles.historyMetaRow}>
                    <MaterialIcons name="done-all" size={16} color="#555" />
                    <Text style={styles.historyMeta}>
                      {item.readCount}/{item.totalRecipients} leram
                    </Text>
                  </View>

                  {/* Ações: ver e excluir */}
                  <View style={styles.historyActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleView(item.id)}>
                      <MaterialIcons name="remove-red-eye" size={20} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item.id)}>
                      <MaterialIcons name="delete" size={20} color="#ff5252" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Text style={{ color: '#777' }}>Nenhum aviso encontrado para este filtro.</Text>
                </View>
              }
            />
          </View>
        )}

        {/* --------------------- MODAL DE SELEÇÃO --------------------- */}
        <SelectModal
          visible={!!modalKind && modalKind !== 'noticeType'}
          title={
            modalKind === 'route'
              ? 'Selecione a rota'
              : modalKind === 'driver'
              ? 'Selecione o motorista'
              : 'Selecione a prioridade'
          }
          options={modalOptions}
          onClose={() => setModalKind(null)}
          onSelect={handleSelect}
        />

        {/* Modal somente informativo para “Tipos de Aviso” */}
        <Modal visible={modalKind === 'noticeType'} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setModalKind(null)}>
            <View style={styles.modalOverlay}>
              <Pressable style={[styles.modalCard, { maxHeight: '70%' }]}>
                <Text style={styles.modalTitle}>Tipos de Aviso</Text>
                <FlatList
                  data={NOTICE_TYPES as any}
                  keyExtractor={(_, i) => String(i)}
                  ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                  renderItem={({ item }) => (
                    <View style={styles.modalItem}>
                      <Text style={[styles.modalItemText, { fontWeight: 'bold' }]}>{item.title}</Text>
                      <Text style={[styles.modalItemText, { color: '#666', marginTop: 4 }]}>{item.desc}</Text>
                    </View>
                  )}
                />
                <TouchableOpacity onPress={() => setModalKind(null)} style={styles.modalCloseBtn}>
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

/* -----------------------------------------------------------
 * Chip de filtro reutilizável (histórico)
 * --------------------------------------------------------- */
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
      onPress={onPress}
      style={[
        styles.filterChip,
        active && { backgroundColor: '#FFCC00', borderColor: '#FFCC00' },
      ]}
    >
      <Text style={[styles.filterChipText, active && { color: '#000', fontWeight: '700' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* -----------------------------------------------------------
 * ESTILOS
 * --------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 70,
    backgroundColor: 'black',
  },
  backButton: { marginRight: 12 },
  headerTitle: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerText: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 12, color: '#ccc' },

  // Tabs
  tabs: { flexDirection: 'row', marginVertical: 12, paddingHorizontal: 16 },
  tabButton: {
    flex: 1,
    padding: 12,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tabActive: { backgroundColor: '#FFCC00', borderColor: 'black' },
  tabText: { color: 'black', fontWeight: '600' },
  tabTextActive: { color: 'black' },

  // Card base
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: 'black' },

  // Tipos de aviso
  noticeTypeItem: { paddingVertical: 8 },
  noticeTypeTitle: { fontWeight: 'bold', fontSize: 14, color: '#000' },
  noticeTypeDesc: { fontSize: 12, color: '#666', marginTop: 2 },

  // Destinatários
  recipientRow: { flexDirection: 'row', justifyContent: 'space-between' },
  recipientButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'white',
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 4,
  },
  recipientSelected: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FFCC00',
  },
  recipientLabel: { fontWeight: 'bold', marginTop: 4, color: 'black' },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    color: 'black',
  },

  // Botão que abre modal (visual igual a input)
  modalButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginTop: 8,
  },
  modalButtonText: { color: '#000' },

  // Prioridade (aba Enviar)
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },

  // Botão enviar
  sendButton: {
    flexDirection: 'row',
    marginBottom: 0,
    backgroundColor: '#FFCC00',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: { fontWeight: 'bold', fontSize: 16, marginLeft: 8, color: 'black' },

  // Histórico - filtros
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
  },
  priorityFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipText: { color: '#333' },

  // Histórico - card
  historyCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: { fontWeight: 'bold', fontSize: 16, color: '#000', flex: 1, paddingRight: 8 },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  historyMessage: { fontSize: 14, color: '#333', marginVertical: 8 },
  historyMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  historyMeta: { fontSize: 12, color: '#666', marginLeft: 6 },
  historyActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  iconButton: { padding: 8 },

  // Modal base
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '60%',
  },
  modalTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12, color: '#000' },
  modalSeparator: { height: 1, backgroundColor: '#eee' },
  modalItem: { paddingVertical: 12 },
  modalItemText: { color: '#000' },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  modalCloseText: { color: '#333', fontWeight: '600' },
});
