import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  X,
  Route,
  Clock,
  MapPin,
  Home,
  School,
  User,
  Phone,
  Car,
} from "lucide-react-native";
import { API_URL } from "../../BackEnd/IPconfig";

type Stop = {
  id: number;
  name: string;
  type: "origin" | "stop" | "destination";
  latitude: number;
  longitude: number;
};

type RouteData = {
  id: string;
  nome_rota: string;
  motorista_nome: string;
  motorista_telefone: string;
  placa_veiculo: string;
  turno: string;
  horario_saida_casa: string;
  horario_chegada_escola: string;
  horario_saida_escola: string;
  horario_chegada_casa: string;
  pontos_parada: Stop[];
  destino_escola?: { nome: string; latitude: number; longitude: number };
  observacoes?: string;
};

const DetalhesRotas = () => {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: -8.28179,
    longitude: -35.99857,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        const stored = await AsyncStorage.getItem("estudante");
        if (!stored) return router.replace("../index");
        const estudante = stored ? JSON.parse(stored) : null;
        if (!estudante) return;

        const res = await fetch(
          `${API_URL}/api/rotas/detalhes/${routeId}/${estudante.id}`
        );
        if (!res.ok) throw new Error("Rota não encontrada");
        const data: RouteData = await res.json();

        // Usa apenas coordenadas vindas do backend
      let stops: Stop[] = data.pontos_parada
  // Filtra para não incluir o ponto com o mesmo nome da escola
  .filter(ponto => ponto.name !== data.destino_escola?.nome)
  .map((ponto, idx) => ({
    id: idx + 1,
    name: ponto.name,
    type: "stop",
    latitude: ponto.latitude,
    longitude: ponto.longitude,
  }));


        if (stops.length > 0) {
          stops[0].type = "origin"; // Primeiro ponto
        }

        if (data.destino_escola) {
          stops.push({
            id: stops.length + 1,
            name: data.destino_escola.nome,
            type: "destination",
            latitude: data.destino_escola.latitude,
            longitude: data.destino_escola.longitude,
          });
        } else if (stops.length > 1) {
          stops[stops.length - 1].type = "destination";
        }

        setRouteData({ ...data, pontos_parada: stops });

        // Ajusta região do mapa para englobar todos os pontos
        if (stops.length > 0) {
          const lats = stops.map((s) => s.latitude);
          const lngs = stops.map((s) => s.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);

          setRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: (maxLat - minLat) * 1.5 || 0.03,
            longitudeDelta: (maxLng - minLng) * 1.5 || 0.03,
          });
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Erro", "Não foi possível carregar os detalhes da rota.");
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [routeId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text>Carregando rota...</Text>
      </View>
    );
  }

  if (!routeData) {
    return (
      <View style={styles.centered}>
        <Text>Rota não encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#FFD600", "#FFD600"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={28} color="black" />
          </TouchableOpacity>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Ativa</Text>
          </View>
        </View>
        <Text style={styles.routeName}>{routeData.nome_rota}</Text>
        <View style={styles.rowCenter}>
          <Route size={16} color="black" style={{ marginRight: 4 }} />
          <Text style={styles.smallText}>{routeData.turno}</Text>
          <Clock
            size={16}
            color="black"
            style={{ marginLeft: 10, marginRight: 4 }}
          />
          <Text style={styles.smallText}>
            {routeData.horario_saida_casa} - {routeData.horario_chegada_casa}
          </Text>
        </View>
      </LinearGradient>

      {/* Mapa */}
      <View
        style={{
          height: 250,
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <MapView style={{ flex: 1 }} region={region} showsUserLocation>
          {routeData.pontos_parada.map((stop) => (
            <Marker
              key={stop.id}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.name}
              pinColor={
                stop.type === "origin"
                  ? "green"
                  : stop.type === "destination"
                  ? "red"
                  : "orange"
              }
            />
          ))}
          {routeData.pontos_parada.length > 1 && (
            <Polyline
              coordinates={routeData.pontos_parada.map((s) => ({
                latitude: s.latitude,
                longitude: s.longitude,
              }))}
              strokeColor="#FFD600"
              strokeWidth={4}
            />
          )}
        </MapView>
      </View>

      {/* Trajeto e Paradas */}
      <View style={styles.card}>
        <LinearGradient colors={["#FFD600", "#FFD600"]} style={styles.cardHeader}>
          <MapPin size={20} color="black" />
          <Text style={styles.cardTitle}> Trajeto e Paradas</Text>
        </LinearGradient>
        <View style={styles.cardBody}>
          {routeData.pontos_parada.map((stop) => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopIcon}>
                {stop.type === "origin" ? (
                  <Home size={20} color="#FFD600" />
                ) : stop.type === "destination" ? (
                  <School size={20} color="#FFD600" />
                ) : (
                  <Text style={styles.stopIndex}>{stop.id}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stopName}>{stop.name}</Text>
              </View>
              <Text style={styles.stopBadge}>
                {stop.type === "origin"
                  ? "Origem"
                  : stop.type === "destination"
                  ? "Destino"
                  : "Parada"}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Motorista */}
      <View style={styles.card}>
        <LinearGradient colors={["#FFD600", "#FFD600"]} style={styles.cardHeader}>
          <User size={18} color="black" />
          <Text style={styles.cardTitle}> Motorista</Text>
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={styles.stopName}>{routeData.motorista_nome}</Text>
          <View style={styles.rowCenter}>
            <Phone size={18} color="black" style={{ marginRight: 6 }} />
            <Text style={styles.stopTime}>{routeData.motorista_telefone}</Text>
          </View>
        </View>
      </View>

      {/* Veículo */}
      <View style={styles.card}>
        <LinearGradient colors={["#FFD600", "#FFD600"]} style={styles.cardHeader}>
          <Car size={18} color="black" />
          <Text style={styles.cardTitle}> Veículo</Text>
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={styles.stopName}>Placa: {routeData.placa_veiculo}</Text>
        </View>
      </View>

      {/* Observações */}
      {routeData.observacoes ? (
        <View style={styles.card}>
          <LinearGradient colors={["#FFD600", "#FFD600"]} style={styles.cardHeader}>
            <Text style={styles.cardTitle}> Observações</Text>
          </LinearGradient>
          <View style={styles.cardBody}>
            <Text style={styles.observacoesText}>{routeData.observacoes}</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default DetalhesRotas;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 20, },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 16, paddingTop: 80,  marginBottom:40, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 ,},
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "green", marginRight: 6 },
  statusText: { fontSize: 14, color: "black" },
  routeName: { fontSize: 20, fontWeight: "bold", marginTop: 6, color: "black" },
  rowCenter: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  smallText: { fontSize: 14, color: "black" },
  card: { margin: 16, borderRadius: 16, backgroundColor: "#fafafa", overflow: "hidden", elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 10 },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 6, color: "black" },
  cardBody: { padding: 12 },
  stopItem: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  stopIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#000000ff", justifyContent: "center", alignItems: "center", marginRight: 10 },
  stopIndex: { fontSize: 14, fontWeight: "bold", color: "#FFD600" },
  stopName: { fontSize: 15, color: "black" },
  stopBadge: { fontSize: 12, color: "gray", marginLeft: 6 },
  stopTime: { fontSize: 14, color: "black" },
  observacoesText: { fontSize: 14, color: "black" },
});
