import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, LongPressEvent } from "react-native-maps";
import { API_URL } from "../../BackEnd/IPconfig";

type Ponto = {
  name: string;
  latitude: string; // string durante edição
  longitude: string; // string durante edição
  horario: string;
};

export default function CadastroRota() {
  const router = useRouter();

  const [rota, setRota] = useState({
    nome: "",
    numeroOnibus: "",
    placa: "",
    turno: "",
    motorista: "",
    telefoneMotorista: "",
    idaSaida: "",
    idaChegada: "",
    voltaSaida: "",
    voltaChegada: "",
    pontos: [
      {
        name: "",
        latitude: "-8.28179",  // coordenada inicial como string
        longitude: "-35.99857", // coordenada inicial como string
        horario: "",
      },
    ] as Ponto[],
    observacoes: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [novoPonto, setNovoPonto] = useState<Ponto>({
    name: "",
    latitude: "-8.28179",
    longitude: "-35.99857",
    horario: "",
  });

  const adicionarNovoPonto = () => {
    setRota((prev) => ({
      ...prev,
      pontos: [
        ...prev.pontos,
        { name: "", latitude: "-8.28179", longitude: "-35.99857", horario: "" },
      ],
    }));
  };

  const removerPonto = (index: number) => {
    setRota((prev) => ({
      ...prev,
      pontos: prev.pontos.filter((_, i) => i !== index),
    }));
  };

  const adicionarPonto = () => {
    if (!novoPonto.name || !novoPonto.horario || !novoPonto.latitude || !novoPonto.longitude) {
      Alert.alert("Atenção", "Preencha todos os campos do ponto!");
      return;
    }
    setRota((prev) => ({
      ...prev,
      pontos: [...prev.pontos, { ...novoPonto }],
    }));
    setModalVisible(false);
    setNovoPonto({ name: "", latitude: "-8.28179", longitude: "-35.99857", horario: "" });
  };

  const cadastrarRota = async () => {
    if (!rota.nome || !rota.numeroOnibus || !rota.placa || !rota.motorista) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/rotas/cadastrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_rota: rota.nome,
          numero_onibus: rota.numeroOnibus,
          placa_veiculo: rota.placa,
          turno: rota.turno,
          motorista_nome: rota.motorista,
          motorista_telefone: rota.telefoneMotorista,
          horario_saida_casa: rota.idaSaida,
          horario_chegada_escola: rota.idaChegada,
          horario_saida_escola: rota.voltaSaida,
          horario_chegada_casa: rota.voltaChegada,
          pontos_parada: rota.pontos.map((p) => ({
            name: p.name,
            latitude: parseFloat(p.latitude),
            longitude: parseFloat(p.longitude),
            horario: p.horario,
          })),
          observacoes: rota.observacoes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Sucesso", data?.mensagem || "Rota cadastrada com sucesso!");
        router.back();
      } else {
        Alert.alert("Erro", data?.erro || `Erro ${res.status}`);
      }
    } catch (networkError) {
      Alert.alert("Erro", "Falha de conexão com o servidor.");
      console.error(networkError);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-forward" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Cadastro de Rota</Text>
        <Text style={styles.subtitle}>Preencha os dados abaixo para cadastrar uma nova rota escolar.</Text>
      </View>

      <View style={styles.container}>
        {/* Informações do ônibus */}
        <Text style={styles.section}>🚌 Informações do Ônibus</Text>
        <TextInput style={styles.input} placeholder="Nome da Rota*" value={rota.nome} onChangeText={(text) => setRota((prev) => ({ ...prev, nome: text }))}/>
        <TextInput style={styles.input} placeholder="Número do Ônibus*" value={rota.numeroOnibus} onChangeText={(text) => setRota((prev) => ({ ...prev, numeroOnibus: text }))}/>
        <TextInput style={styles.input} placeholder="Placa do Veículo*" value={rota.placa} onChangeText={(text) => setRota((prev) => ({ ...prev, placa: text }))}/>
        <TextInput style={styles.input} placeholder="Turno de Operação" value={rota.turno} onChangeText={(text) => setRota((prev) => ({ ...prev, turno: text }))}/>

        {/* Dados do motorista */}
        <Text style={styles.section}>👤 Dados do Motorista</Text>
        <TextInput style={styles.input} placeholder="Nome do Motorista*" value={rota.motorista} onChangeText={(text) => setRota((prev) => ({ ...prev, motorista: text }))}/>
        <TextInput style={styles.input} placeholder="Telefone do Motorista*" keyboardType="phone-pad" value={rota.telefoneMotorista} onChangeText={(text) => setRota((prev) => ({ ...prev, telefoneMotorista: text }))}/>

        {/* Horários */}
        <Text style={styles.section}>⏰ Horários de Operação</Text>
        <Text style={styles.subsection}>🏠 ➡️ 🏫 IDA</Text>
        <TextInput style={styles.input} placeholder="Horário de Saída de Casa" value={rota.idaSaida} onChangeText={(text) => setRota((prev) => ({ ...prev, idaSaida: text }))}/>
        <TextInput style={styles.input} placeholder="Horário de Chegada na Escola" value={rota.idaChegada} onChangeText={(text) => setRota((prev) => ({ ...prev, idaChegada: text }))}/>
        <Text style={styles.subsection}>🏫 ➡️ 🏠 VOLTA</Text>
        <TextInput style={styles.input} placeholder="Horário de Saída da Escola" value={rota.voltaSaida} onChangeText={(text) => setRota((prev) => ({ ...prev, voltaSaida: text }))}/>
        <TextInput style={styles.input} placeholder="Horário de Chegada em Casa" value={rota.voltaChegada} onChangeText={(text) => setRota((prev) => ({ ...prev, voltaChegada: text }))}/>

        {/* Mapa */}
        <Text style={styles.section}>📍 Pontos de Parada</Text>
        <MapView
          style={{ width: "100%", height: 300, marginVertical: 10 }}
          initialRegion={{
            latitude: -8.28179,
            longitude: -35.99857,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onLongPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setRota((prev) => ({
              ...prev,
              pontos: [...prev.pontos, { name: "", latitude: latitude.toString(), longitude: longitude.toString(), horario: "" }],
            }));
          }}
        >
          {rota.pontos.map((ponto, index) => (
            <Marker key={index} coordinate={{ latitude: parseFloat(ponto.latitude), longitude: parseFloat(ponto.longitude) }} title={ponto.name || `Ponto ${index + 1}`} description={`Horário: ${ponto.horario}`}/>
          ))}
          {rota.pontos.length > 1 && (
      <Polyline
           coordinates={rota.pontos
        .filter(p => !isNaN(parseFloat(p.latitude)) && !isNaN(parseFloat(p.longitude)))
        .map(p => ({
      latitude: parseFloat(p.latitude),
      longitude: parseFloat(p.longitude),
    }))}
  strokeColor="#FFD32A"
  strokeWidth={4}
/>

          )}
        </MapView>

        {/* Lista de pontos */}
        {rota.pontos.map((ponto, index) => (
          <View key={index} style={styles.pontoContainer}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Ponto {index + 1}</Text>
            <TextInput style={styles.input} placeholder="Nome do Ponto" value={ponto.name} onChangeText={(text) => {
              const novos = [...rota.pontos];
              novos[index].name = text;
              setRota((prev) => ({ ...prev, pontos: novos }));
            }}/>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TextInput style={[styles.input, { flex: 1, marginRight: 5 }]} placeholder="Latitude" keyboardType="numeric" value={ponto.latitude} onChangeText={(text) => {
                const novos = [...rota.pontos];
                novos[index].latitude = text;
                setRota((prev) => ({ ...prev, pontos: novos }));
              }}/>
              <TextInput style={[styles.input, { flex: 1, marginLeft: 5 }]} placeholder="Longitude" keyboardType="numeric" value={ponto.longitude} onChangeText={(text) => {
                const novos = [...rota.pontos];
                novos[index].longitude = text;
                setRota((prev) => ({ ...prev, pontos: novos }));
              }}/>
            </View>
            <TextInput style={styles.input} placeholder="Horário" value={ponto.horario} onChangeText={(text) => {
              const novos = [...rota.pontos];
              novos[index].horario = text;
              setRota((prev) => ({ ...prev, pontos: novos }));
            }}/>
            <TouchableOpacity onPress={() => removerPonto(index)} style={{ marginTop: 5 }}>
              <Text style={{ color: "red", fontWeight: "bold" }}>❌ Remover Ponto</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={adicionarNovoPonto}>
          <Text style={styles.addButtonText}>+ Novo Ponto</Text>
        </TouchableOpacity>

        <Text style={styles.section}>📝 Informações Adicionais</Text>
        <TextInput style={[styles.input, { height: 100, textAlignVertical: "top" }]} placeholder="Observações" multiline value={rota.observacoes} onChangeText={(text) => setRota((prev) => ({ ...prev, observacoes: text }))}/>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={cadastrarRota}><Text style={styles.submitText}>Cadastrar Rota</Text></TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>Novo Ponto</Text>
            <TextInput placeholder="Nome do Ponto" style={styles.input} value={novoPonto.name} onChangeText={(text) => setNovoPonto((prev) => ({ ...prev, name: text }))}/>
            <TextInput placeholder="Horário do Ponto" style={styles.input} value={novoPonto.horario} onChangeText={(text) => setNovoPonto((prev) => ({ ...prev, horario: text }))}/>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
              <Button title="Adicionar" onPress={adicionarPonto} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: "#fff" },
  header: { padding: 20, backgroundColor: "#FFD32A", borderRadius: 12, marginBottom: 10, paddingTop: 70, position: "relative" },
  title: { fontSize: 25, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 14, marginTop: 5, color: "#333" },
  section: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  subsection: { fontSize: 15, fontWeight: "500", marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, backgroundColor: "#f9f9f9", marginTop: 10 },
  pontoContainer: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, backgroundColor: "#f9f9f9" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginVertical: 20 },
  submitButton: { flex: 1, backgroundColor: "#FFD32A", padding: 15, borderRadius: 10, marginRight: 10, alignItems: "center" },
  submitText: { fontWeight: "bold", fontSize: 16, color: "#000" },
  cancelButton: { flex: 1, backgroundColor: "#eee", padding: 15, borderRadius: 10, marginLeft: 10, alignItems: "center" },
  cancelText: { fontWeight: "bold", fontSize: 16, color: "#333" },
  addButton: { backgroundColor: "#FFD32A", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 15 },
  addButtonText: { color: "#000", fontWeight: "600" },
  modalBackground: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 20 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  backButton: { padding: 8, position: "absolute", right: 20, top: 50 },
});
