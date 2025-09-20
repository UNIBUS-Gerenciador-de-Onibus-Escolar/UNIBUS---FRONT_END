import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const MotoristaCadastro = () => {
  const router = useRouter();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [cnh, setCnh] = useState("");
  const [validadeCnh, setValidadeCnh] = useState("");
  const [placaOnibus, setPlacaOnibus] = useState("");
  const [modeloOnibus, setModeloOnibus] = useState("");
  const [rota, setRota] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "http://192.168.0.4:5000/motoristas/cadastrar";

  // Selecionar foto
  const handleSelecionarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada", "É necessário permitir acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFotoPerfil(
        result.assets[0].base64
          ? `data:image/jpg;base64,${result.assets[0].base64}`
          : result.assets[0].uri
      );
    }
  };

  const validarEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  // Cadastrar motorista
  const handleCadastro = async () => {
    if (
      !nomeCompleto ||
      !email ||
      !telefone ||
      !senha ||
      !cnh ||
      !validadeCnh ||
      !placaOnibus ||
      !modeloOnibus ||
      !rota
    ) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios.");
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert("Erro", "Digite um email válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_completo: nomeCompleto,
          email,
          telefone,
          senha,
          cnh,
          validade_cnh: validadeCnh,
          placa_onibus: placaOnibus.toUpperCase(),
          modelo_onibus: modeloOnibus,
          rota,
          foto_perfil: fotoPerfil || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.erro || "Falha no cadastro");

      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      router.replace("/Motorista/telaMotorista"); // vai para telaMotorista.tsx
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha na conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.titulo}>Cadastro de Motorista</Text>

      <TouchableOpacity style={styles.fotoWrapper} onPress={handleSelecionarFoto}>
        {fotoPerfil ? (
          <Image source={{ uri: fotoPerfil }} style={styles.foto} />
        ) : (
          <View style={styles.fotoPlaceholder}>
            <Ionicons name="camera" size={36} color="#888" />
            <Text style={styles.fotoTexto}>Adicionar Foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={nomeCompleto}
        onChangeText={setNomeCompleto}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Número da CNH"
        value={cnh}
        onChangeText={setCnh}
      />
      <TextInput
        style={styles.input}
        placeholder="Validade da CNH (DD/MM/AAAA)"
        value={validadeCnh}
        onChangeText={setValidadeCnh}
      />
      <TextInput
        style={styles.input}
        placeholder="Placa do ônibus"
        value={placaOnibus}
        onChangeText={(text) => setPlacaOnibus(text.toUpperCase())}
      />
      <TextInput
        style={styles.input}
        placeholder="Modelo/ano do ônibus"
        value={modeloOnibus}
        onChangeText={setModeloOnibus}
      />
      <TextInput
        style={styles.input}
        placeholder="Rota"
        value={rota}
        onChangeText={setRota}
      />

      <TouchableOpacity
        style={[styles.botao, loading && { backgroundColor: "#ccc" }]}
        onPress={handleCadastro}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.textoBotao}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: "#FFF8E7",
  },
  voltar: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#222",
    alignSelf: "center",
  },
  fotoWrapper: {
    alignSelf: "center",
    marginBottom: 20,
  },
  foto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  fotoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  fotoTexto: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#FFC107",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    height: 50,
    marginBottom: 15,
  },
  botao: {
    backgroundColor: "#FFC107",
    height: 55,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  textoBotao: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});

export default MotoristaCadastro;
