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
import { X, Route, Clock, MapPin, Home, School, User, Phone, Car } from "lucide-react-native";

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
          `http://192.168.0.101:5000/api/rotas/detalhes/${routeId}/${estudante.id}`
        );
        if (!res.ok) throw new Error("Rota não encontrada");
        const data: RouteData = await res.json();

        // Cria stops com base nos pontos recebidos do backend
        let stops: Stop[] = data.pontos_parada.map((ponto, idx) => ({
          id: idx + 1,
          name: ponto.name,
          type: idx === 0 ? "origin" : "stop",
          latitude: ponto.latitude,
          longitude: ponto.longitude,
        }));

        // Adiciona o destino final (escola) somente se ainda não estiver no último ponto
        if (data.destino_escola) {
          const ultimoStop = stops[stops.length - 1];
          if (!ultimoStop || ultimoStop.name !== data.destino_escola.nome) {
            stops.push({
              id: stops.length + 1,
              name: data.destino_escola.nome,
              type: "destination",
              latitude: data.destino_escola.latitude,
              longitude: data.destino_escola.longitude,
            });
          } else {
            stops[stops.length - 1].type = "destination";
          }
        }

        setRouteData({ ...data, pontos_parada: stops });

        if (stops.length > 0) {
          setRegion({
            latitude: stops[0].latitude,
            longitude: stops[0].longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
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
      <LinearGradient colors={["#FFD600", "#FFB300"]} style={styles.header}>
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
          <Clock size={16} color="black" style={{ marginLeft: 10, marginRight: 4 }} />
          <Text style={styles.smallText}>
            {routeData.horario_saida_casa} - {routeData.horario_chegada_casa}
          </Text>
        </View>
      </LinearGradient>

      {/* Mapa */}
      <View style={{ height: 250, marginHorizontal: 16, marginBottom: 16, borderRadius: 20, overflow: "hidden" }}>
        <MapView style={{ flex: 1 }} region={region} showsUserLocation>
          {routeData.pontos_parada.map((stop) => (
            <Marker
              key={stop.id}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.name}
            />
          ))}
          {routeData.pontos_parada.length > 1 && (
            <Polyline
              coordinates={routeData.pontos_parada.map((s) => ({
                latitude: s.latitude,
                longitude: s.longitude,
              }))}
              strokeColor="#FFB300"
              strokeWidth={4}
            />
          )}
        </MapView>
      </View>

      {/* Trajeto e Paradas */}
      <View style={styles.card}>
        <LinearGradient colors={["#FFD600", "#FFB300"]} style={styles.cardHeader}>
          <MapPin size={20} color="black" />
          <Text style={styles.cardTitle}> Trajeto e Paradas</Text>
        </LinearGradient>
        <View style={styles.cardBody}>
          {routeData.pontos_parada.map((stop) => (
            <View key={stop.id} style={styles.stopItem}>
              <View style={styles.stopIcon}>
                {stop.type === "origin" ? (
                  <Home size={20} color="white" />
                ) : stop.type === "destination" ? (
                  <School size={20} color="white" />
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
        <LinearGradient colors={["#FFD600", "#FFB300"]} style={styles.cardHeader}>
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
        <LinearGradient colors={["#FFD600", "#FFB300"]} style={styles.cardHeader}>
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
          <LinearGradient colors={["#FFD600", "#FFB300"]} style={styles.cardHeader}>
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
  container: { flex: 1, backgroundColor: "white" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "green", marginRight: 6 },
  statusText: { color: "black", fontWeight: "600" },
  routeName: { fontSize: 24, fontWeight: "bold", color: "black", textAlign: "center", marginVertical: 10 },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  smallText: { fontSize: 14, color: "black" },
  card: { margin: 16, borderRadius: 20, backgroundColor: "white", elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "black", marginLeft: 8 },
  cardBody: { padding: 16 },
  stopItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  stopIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "black", justifyContent: "center", alignItems: "center" },
  stopIndex: { color: "white", fontWeight: "bold" },
  stopName: { fontSize: 16, fontWeight: "600", color: "black" },
  stopBadge: { backgroundColor: "#FFD600", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: "600", color: "black" },
  stopTime: { fontSize: 14, color: "black" },
  observacoesText: { fontSize: 14, color: "black" },
});
