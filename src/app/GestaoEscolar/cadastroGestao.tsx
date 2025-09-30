import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from '../../BackEnd/IPconfig';

const CadastroGestao = () => {
  const router = useRouter();
  const [nomeEscola, setNomeEscola] = useState("");
  const [endereco, setEndereco] = useState("");
  const [contatoEscola, setContatoEscola] = useState("");
  const [nomeGestor, setNomeGestor] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefoneGestor, setTelefoneGestor] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = `${API_URL}/api/gestao/cadastrar`;

  const validarEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleCadastro = async () => {
    if (!nomeEscola || !endereco || !nomeGestor || !email || !senha) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios.");
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
          nome_escola: nomeEscola,
          endereco,
          contato_escola: contatoEscola,
          nome_gestor: nomeGestor,
          cargo,
          email,
          telefone_gestor: telefoneGestor,
          senha,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || "Falha no cadastro");

      Alert.alert("Sucesso", "Cadastro realizado!");
      router.replace("./painel");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha na conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Cadastro da Gestão Escolar</Text>

      <TextInput style={styles.input} placeholder="Nome da Escola *" value={nomeEscola} onChangeText={setNomeEscola} />
      <TextInput style={styles.input} placeholder="Endereço *" value={endereco} onChangeText={setEndereco} />
      <TextInput style={styles.input} placeholder="Telefone/Email da Escola" value={contatoEscola} onChangeText={setContatoEscola} />
      <TextInput style={styles.input} placeholder="Nome do Gestor *" value={nomeGestor} onChangeText={setNomeGestor} />
      <TextInput style={styles.input} placeholder="Cargo" value={cargo} onChangeText={setCargo} />
      <TextInput style={styles.input} placeholder="Email do Gestor *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Telefone do Gestor" value={telefoneGestor} onChangeText={setTelefoneGestor} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Senha *" value={senha} onChangeText={setSenha} secureTextEntry />

      <TouchableOpacity style={[styles.botao, loading && { backgroundColor: "#ccc" }]} onPress={handleCadastro} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.textoBotao}>Cadastrar</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 30, backgroundColor: "#FFF8E7" },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { height: 50, borderWidth: 1, borderColor: "#CCC", borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, backgroundColor: "#FFF" },
  botao: { height: 50, backgroundColor: "#FFB700", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 10 },
  textoBotao: { color: "#000", fontSize: 16, fontWeight: "bold" },
});

export default CadastroGestao;