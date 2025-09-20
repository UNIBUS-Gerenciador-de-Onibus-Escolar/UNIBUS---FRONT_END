import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CadastroOnibusRotas() {
  const router = useRouter();

  const [onibus, setOnibus] = useState('');
  const [motorista, setMotorista] = useState('');
  const [rota, setRota] = useState('');
  const [pontoInicial, setPontoInicial] = useState('');
  const [pontoFinal, setPontoFinal] = useState('');

  const handleCadastro = () => {
    if (!onibus || !motorista || !rota || !pontoInicial || !pontoFinal) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    console.log('Ônibus cadastrado:', {
      onibus,
      motorista,
      rota,
      pontoInicial,
      pontoFinal,
    });

    Alert.alert('Sucesso', 'Ônibus e rota cadastrados com sucesso!');

    setOnibus('');
    setMotorista('');
    setRota('');
    setPontoInicial('');
    setPontoFinal('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Seta para voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Cadastro de Ônibus e Rotas</Text>

      <Text style={styles.label}>Nome ou Placa do Ônibus</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Ônibus 45 ou ABC-1234"
        value={onibus}
        onChangeText={setOnibus}
      />

      <Text style={styles.label}>Nome do Motorista</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: João da Silva"
        value={motorista}
        onChangeText={setMotorista}
      />

      <Text style={styles.label}>Número da Rota</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 01"
        keyboardType="numeric"
        value={rota}
        onChangeText={setRota}
      />

      <Text style={styles.label}>Ponto Inicial</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Escola Municipal"
        value={pontoInicial}
        onChangeText={setPontoInicial}
      />

      <Text style={styles.label}>Ponto Final</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Vila do Sossego"
        value={pontoFinal}
        onChangeText={setPontoFinal}
      />

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar Ônibus e Rota</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2e86de',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
