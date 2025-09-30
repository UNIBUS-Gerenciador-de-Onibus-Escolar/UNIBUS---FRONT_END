import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Relatorios() {
  const router = useRouter();
  const [descricaoErro, setDescricaoErro] = useState('');
  const [dadosSistema, setDadosSistema] = useState({
    alunos: 0,
    rotas: 0,
    motoristas: 0,
    sincronizado: true,
    ultimaAtualizacao: '',
  });

  useEffect(() => {
    // Simulação de carregamento de dados do sistema (mock)
    const carregarDados = () => {
      setTimeout(() => {
        setDadosSistema({
          alunos: 87,
          rotas: 14,
          motoristas: 11,
          sincronizado: true,
          ultimaAtualizacao: '07/08/2025 12:42',
        });
      }, 1000);
    };
    carregarDados();
  }, []);

  const handleRelatarErro = () => {
    if (!descricaoErro.trim()) {
      Alert.alert('Erro', 'Descreva o problema ocorrido.');
      return;
    }

    // Aqui você pode enviar para API, salvar logs, etc
    console.log('🔴 Relatório enviado:', descricaoErro);

    Alert.alert('Relatório Enviado', 'A equipe técnica foi notificada.');
    setDescricaoErro('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Botão Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🔧 Painel Técnico do Sistema</Text>

      {/* Dados do Sistema */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Status do Sistema</Text>
        <Text style={styles.item}>👨‍🎓 Alunos Cadastrados: {dadosSistema.alunos}</Text>
        <Text style={styles.item}>🚌 Rotas Ativas: {dadosSistema.rotas}</Text>
        <Text style={styles.item}>👨‍✈️ Motoristas Ativos: {dadosSistema.motoristas}</Text>
        <Text style={styles.item}>
          🔄 Sincronização: {dadosSistema.sincronizado ? '✅ Ok' : '❌ Erro'}
        </Text>
        <Text style={styles.item}>
          📅 Última Atualização: {dadosSistema.ultimaAtualizacao}
        </Text>
      </View>

      {/* Campo de Relato de Erros */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 Relatar Problema Técnico</Text>
        <TextInput
          style={styles.input}
          placeholder="Descreva o erro encontrado no sistema, falha na rota, carregamento, etc..."
          value={descricaoErro}
          onChangeText={setDescricaoErro}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.button} onPress={handleRelatarErro}>
          <MaterialIcons name="report-problem" size={20} color="#fff" />
          <Text style={styles.buttonText}>Enviar Relatório Técnico</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2e86de',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  item: {
    fontSize: 15,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#d63031',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
