import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, Entypo, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import polyline from '@mapbox/polyline';

const GOOGLE_MAPS_APIKEY = 'SUA_API_KEY_GOOGLE_AQUI'; // Substitua pela sua API

export default function DetalhesRota() {
  const router = useRouter();

  // Estados
  const [coordsRota, setCoordsRota] = useState<{ latitude: number; longitude: number }[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const pontoPartida = { latitude: -8.2817903, longitude: -35.9985744 };
  const pontoChegada = { latitude: -8.266915, longitude: -35.972216 };

  const [region, setRegion] = useState<Region>({
    latitude: (pontoPartida.latitude + pontoChegada.latitude) / 2,
    longitude: (pontoPartida.longitude + pontoChegada.longitude) / 2,
    latitudeDelta: Math.abs(pontoPartida.latitude - pontoChegada.latitude) * 2 || 0.03,
    longitudeDelta: Math.abs(pontoPartida.longitude - pontoChegada.longitude) * 2 || 0.03,
  });

  // Buscar rota e localização do usuário
  useEffect(() => {
    buscarRota();
    solicitarLocalizacao();
  }, []);

  async function buscarRota() {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${pontoPartida.latitude},${pontoPartida.longitude}&destination=${pontoChegada.latitude},${pontoChegada.longitude}&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes.length > 0) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map((point: [number, number]) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setCoordsRota(coords);
      } else {
        Alert.alert('Erro', 'Não foi possível obter a rota.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao buscar rota no Google Maps.');
    } finally {
      setLoading(false);
    }
  }

  async function solicitarLocalizacao() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Não foi possível acessar a localização.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando rota...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Rota 501</Text>

      <View style={styles.mapCard}>
        <Text style={styles.mapLabel}>Localização da Rota</Text>
        <MapView style={styles.map} region={region} showsUserLocation={true} loadingEnabled={true}>
          <Marker coordinate={pontoPartida} title="Ponto de Partida" description="Rua Marieta Lira, Kennedy" />
          <Marker coordinate={pontoChegada} title="Ponto de Chegada" description="Escola Técnica Fernando Lyra" pinColor="green" />
          {userLocation && <Marker coordinate={userLocation} title="Você está aqui" pinColor="blue" />}
          {coordsRota.length > 0 && <Polyline coordinates={coordsRota} strokeColor="#007AFF" strokeWidth={5} />}
        </MapView>
      </View>

      <View style={styles.info}>
        <Text style={styles.item}><Entypo name="location" size={16} /> Origem: Centro</Text>
        <Text style={styles.item}><Entypo name="flag" size={16} /> Destino: Bairro</Text>
        <Text style={styles.item}><Ionicons name="time-outline" size={16} /> Saída: 07:15</Text>
        <Text style={styles.item}><Ionicons name="time-outline" size={16} /> Chegada: 07:45</Text>
        <Text style={styles.item}><Ionicons name="person-outline" size={16} /> Motorista: João da Silva</Text>
        <Text style={styles.item}><Feather name="phone" size={16} /> (11) 91234-5678</Text>
        <Text style={styles.item}><FontAwesome5 name="car-side" size={16} /> Placa: ABC-1234 | Van Sprinter</Text>
        <Text style={styles.item}><Ionicons name="checkmark-circle-outline" size={16} color="#00B300" /> Em boas condições</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFFDF5', flexGrow: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backText: { marginLeft: 8, fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  mapCard: { height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 16, backgroundColor: '#fff' },
  mapLabel: { padding: 10, fontWeight: 'bold', fontSize: 16, backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderColor: '#eee' },
  map: { flex: 1 },
  info: { marginTop: 8 },
  item: { fontSize: 14, marginVertical: 4, flexDirection: 'row' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
''