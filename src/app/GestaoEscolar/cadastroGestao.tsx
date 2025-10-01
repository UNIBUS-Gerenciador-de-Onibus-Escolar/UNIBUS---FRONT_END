import React, { JSX, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_URL } from "../../BackEnd/IPconfig";

const CadastroGestao = () => {
  const router = useRouter();

  // Estados dos campos
  const [nomeEscola, setNomeEscola] = useState("");
  const [endereco, setEndereco] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [contatoEscola, setContatoEscola] = useState("");
  const [nomeGestor, setNomeGestor] = useState("");
  const [cargo, setCargo] = useState("");
  const [emailGestor, setEmailGestor] = useState("");
  const [telefoneGestor, setTelefoneGestor] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const BACKEND_URL = `${API_URL}/api/gestao/cadastrar`;

  // =======================
  // Funções auxiliares
  // =======================
  const validarEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validarSenha = (senha: string) => senha.length >= 6;

  const maxLengths: { [key: string]: number } = {
    nomeEscola: 255,
    endereco: 255,
    contatoEscola: 100,
    nomeGestor: 150,
    cargo: 100,
    emailGestor: 150,
    telefoneGestor: 20,
    senha: 255,
    // latitude e longitude ilimitados
  };

  const formatarTelefone = (text: string) => {
    const numeros = text.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 6) return `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
    return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7,11)}`;
  };

  const validarCampos = () => {
    let novosErros: { [key: string]: string } = {};
    if (!nomeEscola) novosErros.nomeEscola = "Nome da escola é obrigatório.";
    if (!endereco) novosErros.endereco = "Endereço é obrigatório.";
    if (!nomeGestor) novosErros.nomeGestor = "Nome do gestor é obrigatório.";
    if (!emailGestor) {
      novosErros.emailGestor = "E-mail é obrigatório.";
    } else if (!validarEmail(emailGestor)) {
      novosErros.emailGestor = "Digite um e-mail válido.";
    }
    if (!senha) {
      novosErros.senha = "Senha é obrigatória.";
    } else if (!validarSenha(senha)) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleCadastro = async () => {
    if (!validarCampos()) return;

    setLoading(true);
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_escola: nomeEscola,
          endereco,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          contato_escola: contatoEscola,
          nome_gestor: nomeGestor,
          cargo,
          email_gestor: emailGestor,
          telefone_gestor: telefoneGestor,
          senha,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || "Falha no cadastro");

      Alert.alert("✅ Sucesso", "Cadastro realizado com sucesso!");
      router.replace("./painel");
    } catch (error: any) {
      Alert.alert("❌ Erro", error.message || "Falha na conexão");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    setValue: (text: string) => void,
    key: string,
    icon?: JSX.Element,
    placeholder?: string,
    secure?: boolean,
    keyboardType: any = "default",
    formatFn?: (text: string) => string
  ) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, erros[key] && { borderColor: "red" }]}>
        {icon && <View style={{ marginRight: 10 }}>{icon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder || label}
          value={value}
          onChangeText={(text) => setValue(formatFn ? formatFn(text) : text)}
          secureTextEntry={key === "senha" ? !mostrarSenha : false}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {key === "senha" && (
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons name={mostrarSenha ? "eye-off" : "eye"} size={22} color="#555" />
          </TouchableOpacity>
        )}
      </View>
      {erros[key] && <Text style={styles.error}>{erros[key]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1,  backgroundColor: "#ffffffff" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          {/* Header com botão voltar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cadastro da Gestão Escolar</Text>
          </View>

          <View style={styles.Main}>

          {renderInput("Nome da Escola *", nomeEscola, setNomeEscola, "nomeEscola", <MaterialCommunityIcons name="school" size={22} color="#555" />)}
          {renderInput("Endereço *", endereco, setEndereco, "endereco", <Ionicons name="location-sharp" size={22} color="#555" />)}
          {renderInput("Latitude (opcional)", latitude, setLatitude, "latitude", <Ionicons name="navigate" size={22} color="#555" />, "Ex: -8.0458", false, "numeric")}
          {renderInput("Longitude (opcional)", longitude, setLongitude, "longitude", <Ionicons name="navigate" size={22} color="#555" />, "Ex: -34.8761", false, "numeric")}
          {renderInput("Telefone/Email da Escola", contatoEscola, setContatoEscola, "contatoEscola", <Ionicons name="business" size={22} color="#555" />)}
          {renderInput("Nome do Gestor *", nomeGestor, setNomeGestor, "nomeGestor", <FontAwesome5 name="user-tie" size={22} color="#555" />)}
          {renderInput("Cargo", cargo, setCargo, "cargo", <FontAwesome5 name="briefcase" size={22} color="#555" />)}
          {renderInput("Email do Gestor *", emailGestor, setEmailGestor, "emailGestor", <Ionicons name="mail" size={22} color="#555" />, "exemplo@email.com", false, "email-address")}
          {renderInput("Telefone do Gestor", telefoneGestor, setTelefoneGestor, "telefoneGestor", <Ionicons name="call" size={22} color="#555" />, "Ex: (81) 99999-9999", false, "phone-pad", formatarTelefone)}
          {renderInput("Senha *", senha, setSenha, "senha", <Ionicons name="lock-closed" size={22} color="#555" />)}

          <TouchableOpacity
            style={[styles.botao, loading && { backgroundColor: "#ccc" }]}
            onPress={handleCadastro}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.textoBotao}>Cadastrar</Text>}
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffc400ff",
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  Main: {
    padding: 26,
  },
  backButton: {
    marginRight: 12,
    marginTop: 60,
  },
  headerTitle: {
    marginTop: 60,
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5, color: "#444" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFB700", // borda amarela
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FFF",
  },
  input: { flex: 1, height: 50 },
  error: { color: "red", fontSize: 12, marginTop: 4 },
  botao: {
    height: 50,
    backgroundColor: "#FFB700",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  textoBotao: { color: "#000", fontSize: 16, fontWeight: "bold" },
});

export default CadastroGestao;
