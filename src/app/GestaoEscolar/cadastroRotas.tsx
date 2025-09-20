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
import { useRouter } from "expo-router";

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
    pontos: [""],
    observacoes: "",
  });

  // Adiciona um novo ponto de parada
  const adicionarPonto = () => {
    setRota((prev) => ({ ...prev, pontos: [...prev.pontos, ""] }));
  };

  // Atualiza o texto de um ponto específico
  const atualizarPonto = (text: string, index: number) => {
    const novosPontos = [...rota.pontos];
    novosPontos[index] = text;
    setRota((prev) => ({ ...prev, pontos: novosPontos }));
  };

  // Remove um ponto
  const removerPonto = (index: number) => {
    const novosPontos = rota.pontos.filter((_, i) => i !== index);
    setRota((prev) => ({ ...prev, pontos: novosPontos }));
  };

  // Função para enviar rota para o backend Flask
  const cadastrarRota = async () => {
    if (!rota.nome || !rota.numeroOnibus || !rota.placa || !rota.motorista) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios!");
      return;
    }

    try {
      const res = await fetch("http://192.168.137.1:5000/api/rotas/cadastrar", {
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
          pontos_parada: rota.pontos.map((p) => p.trim()).filter((p) => p !== ""),
          observacoes: rota.observacoes,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        console.warn("Resposta não era JSON");
      }

      if (res.ok) {
        Alert.alert("Sucesso", data?.mensagem || "Rota cadastrada com sucesso!");
        router.back(); // <--- Corrigido para Expo Router
      } else {
        Alert.alert("Erro", data?.erro || `Erro ${res.status}: ${res.statusText}`);
      }
    } catch (networkError) {
      Alert.alert("Erro", "Falha de conexão com o servidor. Verifique sua rede.");
      console.error("Erro de rede:", networkError);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Cadastro de Rota</Text>
        <Text style={styles.subtitle}>
          Preencha os dados abaixo para cadastrar uma nova rota escolar.
        </Text>
      </View>

      <View style={styles.container}>
        {/* Informações do ônibus */}
        <Text style={styles.section}>🚌 Informações do Ônibus</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da Rota*"
          value={rota.nome}
          onChangeText={(text) => setRota((prev) => ({ ...prev, nome: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Número do Ônibus*"
          value={rota.numeroOnibus}
          onChangeText={(text) =>
            setRota((prev) => ({ ...prev, numeroOnibus: text }))
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Placa do Veículo*"
          value={rota.placa}
          onChangeText={(text) => setRota((prev) => ({ ...prev, placa: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Turno de Operação (Manhã, Tarde, Noite...)"
          value={rota.turno}
          onChangeText={(text) => setRota((prev) => ({ ...prev, turno: text }))}
        />

        {/* Dados do motorista */}
        <Text style={styles.section}>👤 Dados do Motorista</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do Motorista*"
          value={rota.motorista}
          onChangeText={(text) =>
            setRota((prev) => ({ ...prev, motorista: text }))
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone do Motorista*"
          keyboardType="phone-pad"
          value={rota.telefoneMotorista}
          onChangeText={(text) =>
            setRota((prev) => ({ ...prev, telefoneMotorista: text }))
          }
        />

        {/* Horários */}
        <Text style={styles.section}>⏰ Horários de Operação</Text>
        <Text style={styles.subsection}>🏠 ➡️ 🏫 IDA</Text>
        <TextInput
          style={styles.input}
          placeholder="Horário de Saída de Casa*"
          value={rota.idaSaida}
          onChangeText={(text) => setRota((prev) => ({ ...prev, idaSaida: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Horário de Chegada na Escola*"
          value={rota.idaChegada}
          onChangeText={(text) =>
            setRota((prev) => ({ ...prev, idaChegada: text }))
          }
        />

        <Text style={styles.subsection}>🏫 ➡️ 🏠 VOLTA</Text>
        <TextInput
          style={styles.input}
          placeholder="Horário de Saída da Escola*"
          value={rota.voltaSaida}
          onChangeText={(text) =>
            setRota((prev) => ({ ...prev, voltaSaida: text }))
          }
        />
        <TextInput
          style={styles.input}
          placeholder="Horário de Chegada em Casa*"
          value={rota.voltaChegada}
          onChangeText={(text) =>
            setRota((prev) => ({ ...prev, voltaChegada: text }))
          }
        />

        {/* Pontos de Parada */}
        <Text style={styles.section}>📍 Pontos de Parada</Text>
        {rota.pontos.map((ponto, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
          >
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={`Ponto ${index + 1}`}
              value={ponto}
              onChangeText={(text) => atualizarPonto(text, index)}
            />
            {rota.pontos.length > 1 && (
              <TouchableOpacity
                onPress={() => removerPonto(index)}
                style={{
                  marginLeft: 8,
                  backgroundColor: "#ff4d4d",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>❌</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={adicionarPonto}>
          <Text style={styles.addButtonText}>+ Adicionar Ponto</Text>
        </TouchableOpacity>

        {/* Informações adicionais */}
        <Text style={styles.section}>📝 Informações Adicionais</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Observações Especiais, Restrições, Pontos de Atenção..."
          multiline
          value={rota.observacoes}
          onChangeText={(text) =>
            setRota((prev) => ({ ...prev, observacoes: text }))
          }
        />

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.submitButton} onPress={cadastrarRota}>
            <Text style={styles.submitText}>Cadastrar Rota</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: "#fff" },
  header: {
    padding: 20,
    backgroundColor: "#FFD32A",
    borderRadius: 12,
    marginBottom: 10,
    paddingTop: 70,
  },
  title: { fontSize: 25, fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: 14, marginTop: 5, color: "#333" },
  section: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  subsection: { fontSize: 15, fontWeight: "500", marginTop: 10, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9f9f9",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#FFD32A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "#000", fontWeight: "600" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#FFD32A",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  submitText: { fontWeight: "bold", fontSize: 16, color: "#000" },
  cancelButton: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: "center",
  },
  cancelText: { fontWeight: "bold", fontSize: 16, color: "#333" },
});
