import  React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const scale = width / 375;
function normalize(size: number) {
  return Math.round(size * scale);
}

type RouteItem = {
  id: string;
  routeName: string;
  driver: string;
  vehicle: string;
  shift: string;
  departureTime: string;
  arrivalTime: string;
  returnDeparture: string;
  returnArrival: string;
  subscribed?: boolean;
};

type SchoolInfo = {
  name: string;
  totalRoutes: number;
  openRoutes: number;
};

export default function MainRoutesScreen() {
  const router = useRouter();
  const logo = require("../../../../assets/images/Logo_App.png");

  const [estudante, setEstudante] = useState<{ id: string; nome_completo: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "subscribed">("all");
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({ name: "Carregando...", totalRoutes: 0, openRoutes: 0 });
  const [pendingRequests] = useState(12);

  // Carregar estudante
  useEffect(() => {
    async function loadEstudante() {
      try {
        const stored = await AsyncStorage.getItem("estudante");
        if (stored) setEstudante(JSON.parse(stored));
        else router.replace("../index");
      } catch (err) {
        console.log("Erro ao carregar estudante:", err);
      }
    }
    loadEstudante();
  }, []);

  // Buscar rotas e inscrições
  useEffect(() => {
    async function fetchRoutes() {
      if (!estudante) return;
      try {
        // Buscar todas as rotas
        const resRoutes = await fetch("http://192.168.0.4:5000/api/rotas/listar");
        const data = await resRoutes.json();

        // Buscar rotas em que o estudante já está inscrito
        const resInscritos = await fetch(`http://192.168.0.4:5000/inscricaoEstudante/listar_rotas_estudante/${estudante.id}`);
        const inscritosData = await resInscritos.json();
        const inscritosIds = inscritosData.map((r: any) => r.id);

        // Mapear rotas e marcar se está inscrito
        const mappedRoutes: RouteItem[] = data.map((r: any) => ({
          id: r.id,
          routeName: r.nome_rota,
          driver: r.motorista_nome,
          vehicle: r.placa_veiculo,
          shift: r.turno || "Integral",
          departureTime: r.horario_saida_casa || "--:--",
          arrivalTime: r.horario_chegada_escola || "--:--",
          returnDeparture: r.horario_saida_escola || "--:--",
          returnArrival: r.horario_chegada_casa || "--:--",
          subscribed: inscritosIds.includes(r.id),
        }));

        setRoutes(mappedRoutes);

        // Header da escola
        if (data.length > 0) {
          const schoolName = data[0].nome_escola || "Escola Desconhecida";
          const totalRoutes = data.length;
          const openRoutes = mappedRoutes.filter(r => r.subscribed).length;
          setSchoolInfo({ name: schoolName, totalRoutes, openRoutes });
        }
      } catch (error) {
        console.log(error);
        Alert.alert("Erro", "Não foi possível carregar as rotas.");
      }
    }
    fetchRoutes();
  }, [estudante]);

  // Filtros
  const filters = useMemo(
    () => [
      { key: "all", label: "Todos", count: routes.length },
      { key: "subscribed", label: "Inscritos", count: routes.filter(r => r.subscribed).length },
    ],
    [routes]
  );

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return routes.filter(route => {
      const matchesSearch =
        route.routeName.toLowerCase().includes(q) || route.driver.toLowerCase().includes(q);
      if (selectedFilter === "all") return matchesSearch;
      if (selectedFilter === "subscribed") return matchesSearch && route.subscribed;
      return true;
    });
  }, [routes, searchQuery, selectedFilter]);

  // Inscrição / remoção de rota
  async function handleSubscribeRoute(routeId: string) {
    if (!estudante) return;
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    try {
      if (!route.subscribed) {
        const response = await fetch("http://192.168.0.4:5000/inscricaoEstudante/inscrever", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estudante_id: estudante.id, rota_id: routeId }),
        });
        if (response.ok) setRoutes(prev => prev.map(r => (r.id === routeId ? { ...r, subscribed: true } : r)));
        else {
          const data = await response.json();
          Alert.alert("Erro", data.erro || "Não foi possível inscrever-se.");
        }
      } else {
        const response = await fetch("http://192.168.0.4:5000/inscricaoEstudante/remover", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estudante_id: estudante.id, rota_id: routeId }),
        });
        if (response.ok) setRoutes(prev => prev.map(r => (r.id === routeId ? { ...r, subscribed: false } : r)));
        else {
          const data = await response.json();
          Alert.alert("Erro", data.erro || "Não foi possível remover a inscrição.");
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha na comunicação com o servidor.");
    }
  }

  // Navegação
  function handleRoutePress(routeId: string) {
    router.push({ pathname: "/Estudante/DetalhesRotas", params: { routeId } });
  }
  function handleRequestRoute() {
    router.push("/Estudante/rotaSolicitacao");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.title}>UniBus</Text>
            <Text style={styles.subtitle}>Transporte Escolar</Text>
          </View>
        </View>
        <View style={styles.schoolBox}>
          <FontAwesome5 name="school" size={22} color="#111" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.schoolName}>{schoolInfo.name}</Text>
            <Text style={styles.schoolMeta}>{schoolInfo.totalRoutes} rotas • {schoolInfo.openRoutes} abertas</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={normalize(18)} color="#999" style={{ marginLeft: normalize(12) }} />
          <TextInput
            placeholder="Buscar por rota ou motorista..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: normalize(12) }}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterButton, selectedFilter === f.key ? styles.filterButtonActive : null]}
              onPress={() => setSelectedFilter(f.key as any)}
            >
              <Text style={[styles.filterText, selectedFilter === f.key ? styles.filterTextActive : null]}>
                {f.label} ({f.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de rotas */}
        <FlatList
          data={filteredRoutes}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: normalize(40) }}
          renderItem={({ item }) => (
            <View style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <View style={styles.routeLeft}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: normalize(8) }}>
                      <MaterialCommunityIcons name="bus-school" size={normalize(22)}  />
                      <View>
                        <Text style={styles.routeName}>{item.routeName}</Text>
                        <Text style={styles.metaText}>
                          <Ionicons name="person-outline" size={normalize(12)} /> {item.driver}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Horários */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoBoxBlue]}>
                  <Text style={styles.infoTitle}>Ida</Text>
                  <Text style={styles.infoSmall}>Saída: {item.departureTime}</Text>
                  <Text style={styles.infoSmall}>Chegada: {item.arrivalTime}</Text>
                </View>
                <View style={[styles.infoBoxGreen]}>
                  <Text style={styles.infoTitle}>Volta</Text>
                  <Text style={styles.infoSmall}>Saída: {item.returnDeparture}</Text>
                  <Text style={styles.infoSmall}>Chegada: {item.returnArrival}</Text>
                </View>
              </View>

              {/* Ações */}
              <View style={styles.actionsRow}>
                <TouchableOpacity onPress={() => handleRoutePress(item.id)} style={styles.grayButton}>
                  <Ionicons name="location-outline" size={normalize(14)} color="#111"  />
                  <Text style={styles.grayButtonText}>Ver Detalhes</Text>
                </TouchableOpacity>

                {!item.subscribed && (
                  <TouchableOpacity onPress={() => handleSubscribeRoute(item.id)} style={styles.primaryButton}>
                    <Ionicons name="add-circle-outline" size={normalize(16)} color="#111" />
                    <Text style={styles.primaryButtonText}>Inscrever-se</Text>
                  </TouchableOpacity>
                )}

                {item.subscribed && (
                  <TouchableOpacity onPress={() => handleSubscribeRoute(item.id)} style={styles.disabledButton}>
                    <Ionicons name="checkmark-circle" size={normalize(16)} color="#111" />
                    <Text style={styles.disabledButtonText}>Inscrito</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListFooterComponent={() => (
            <View style={styles.requestCard}>
              <Text style={styles.requestTitle}>Não encontrou sua rota?</Text>
              <Text style={styles.requestSubtitle}>
                Solicite uma nova rota para sua região. Com {pendingRequests} solicitações pendentes, há grande chance de aprovação!
              </Text>
              <TouchableOpacity onPress={handleRequestRoute} style={styles.requestButton}>
                <Ionicons name="add" size={normalize(18)} color="#FFD600" />
                <Text style={styles.requestButtonText}>Solicitar Nova Rota</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}

// ================================
// ESTILOS
// ================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#FFD600", paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: normalize(12) },
  logo: { width: 60, height: 60, borderRadius: 110 },
  title: { fontSize: normalize(18), fontWeight: "800", color: "#000" },
  subtitle: { fontSize: normalize(12), color: "#111" },
  schoolBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff7cc", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginTop: 16 },
  schoolName: { fontWeight: "700", color: "#111", fontSize: normalize(14) },
  schoolMeta: { color: "#444", fontSize: normalize(12), marginTop: normalize(2) },
  content: { flex: 1, paddingHorizontal: normalize(18) },
  searchContainer: { height: normalize(44), borderRadius: normalize(14), backgroundColor: "#fff", borderWidth: 1, borderColor: "#e6e6e6", flexDirection: "row", alignItems: "center", marginTop: normalize(12) },
  searchInput: { flex: 1, paddingHorizontal: normalize(12), fontSize: normalize(14), color: "#111", height: "100%" },
  filterButton: { paddingHorizontal: normalize(12), paddingVertical: normalize(8), borderRadius: normalize(12), backgroundColor: "#f3f4f6", marginRight: normalize(10), width: normalize(100), height: normalize(36), justifyContent: "center", alignItems: "center", flexDirection: "row" },
  filterButtonActive: { backgroundColor: "#FFD600" },
  filterText: { fontWeight: "700", color: "#444", fontSize: normalize(13) },
  filterTextActive: { color: "#000" },

  // Card de rota
  routeCard: { backgroundColor: "#fff", borderRadius: normalize(18), marginTop: normalize(14), padding: normalize(14), elevation: 2, borderWidth: 1, borderColor: "#eee" },
  routeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: normalize(10) },
  routeLeft: { flexDirection: "row", alignItems: "flex-start", gap: normalize(10), flex: 1 },
  routeName: { fontWeight: "700", fontSize: normalize(15), color: "#111" },
  metaText: { fontSize: normalize(12), color: "#555", marginTop: normalize(2) },
  infoGrid: { flexDirection: "row", marginTop: normalize(8), gap: normalize(8) },
  infoBoxBlue: { flex: 1, padding: normalize(10), backgroundColor: "#eff6ff", borderRadius: normalize(10) },
  infoBoxGreen: { flex: 1, padding: normalize(10), backgroundColor: "#ecfdf5", borderRadius: normalize(10) },
  infoTitle: { fontWeight: "700", color: "#111", fontSize: normalize(13) },
  infoSmall: { fontSize: normalize(12), color: "#444", marginTop: normalize(2) },
  actionsRow: { flexDirection: "row", gap: normalize(8), marginTop: normalize(12) },
  grayButton: { flexDirection: "row", alignItems: "center", gap: normalize(6), backgroundColor: "#f3f4f6", paddingVertical: normalize(8), paddingHorizontal: normalize(14), borderRadius: normalize(12) },
  grayButtonText: { fontSize: normalize(13), fontWeight: "600", color: "#111" },
  primaryButton: { flexDirection: "row", alignItems: "center", gap: normalize(6), backgroundColor: "#FFD600", paddingVertical: normalize(8), paddingHorizontal: normalize(14), borderRadius: normalize(12) },
  primaryButtonText: { fontSize: normalize(13), fontWeight: "700", color: "#111" },
  disabledButton: { flexDirection: "row", alignItems: "center", gap: normalize(6), backgroundColor: "#f3f4f6", paddingVertical: normalize(8), paddingHorizontal: normalize(14), borderRadius: normalize(12) },
  disabledButtonText: { fontSize: normalize(13), fontWeight: "600", color: "#111" },
  

  // Card de solicitação
  requestCard: { backgroundColor: "#fff", borderRadius: normalize(18), padding: normalize(16), borderWidth: 1, borderColor: "#eee", marginTop: normalize(25), elevation: 2 },
  requestTitle: { fontSize: normalize(15), fontWeight: "700", marginBottom: normalize(8), color: "#111" },
  requestSubtitle: { fontSize: normalize(13), color: "#444", marginBottom: normalize(14) },
  requestButton: { flexDirection: "row", alignItems: "center", gap: normalize(8), paddingVertical: normalize(10), backgroundColor: "#FFD600", borderRadius: normalize(12), justifyContent: "center" },
  requestButtonText: { fontWeight: "700", color: "#111", fontSize: normalize(14) },
});
