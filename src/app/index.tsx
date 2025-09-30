import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '../BackEnd/IPconfig';

type UsuarioTipo = 'estudante' | 'gestao' | 'motorista';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<UsuarioTipo>('estudante');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha o email e a senha.');
      return;
    }

    setLoading(true);

    try {
      const endpoints: Record<UsuarioTipo, string> = {
        estudante: `${API_URL}/api/estudantes/login`,
        gestao: `${API_URL}/api/gestao/login`,
        motorista: `${API_URL}/api/motoristas/login`,
      };

      const storageKeys: Record<UsuarioTipo, string> = {
        estudante: 'estudante',
        gestao: 'gestao',
        motorista: 'motorista',
      };

      const response = await fetch(endpoints[tipo], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || 'Login inválido');
      }

      await AsyncStorage.setItem(storageKeys[tipo], JSON.stringify(resultado));

      Alert.alert('Bem-vindo!', `Olá, ${resultado.nome_completo}`);

      if (tipo === 'estudante') router.push('/Estudante/tabs/telaInicial');
      if (tipo === 'gestao') router.push('/GestaoEscolar/painel');
      if (tipo === 'motorista') router.push('/Motorista/telaMotorista');

    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha de conexão');
    } finally {
      setLoading(false);
    }
  };

  const alternarTipo = () => {
    const tipos: UsuarioTipo[] = ['estudante', 'gestao', 'motorista'];
    const index = tipos.indexOf(tipo);
    setTipo(tipos[(index + 1) % tipos.length]);
  };

  const tipoIcone = () => {
    switch (tipo) {
      case 'estudante': return require('../../assets/images/EstudanteIcon.png');
      case 'gestao': return require('../../assets/images/GestaoIcon.png');
      case 'motorista': return require('../../assets/images/MotoristaIcon.png');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('../../assets/images/Logo_App.png')} style={styles.logo} />
          <Text style={styles.title}>UniBus</Text>

<<<<<<< HEAD
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
=======
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputEmail}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.tipoButton} onPress={alternarTipo}>
              <Image source={tipoIcone()} style={styles.tipoIcone} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.inputSenha}
>>>>>>> de014f1 (cadastro da gestão e o card das rotas)
            placeholder="Senha"
            placeholderTextColor="#999"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

<<<<<<< HEAD
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>ENTRAR</Text>
=======
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" size="large" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
>>>>>>> de014f1 (cadastro da gestão e o card das rotas)
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/cadastro')}>
            <Text style={styles.registerText}>
              Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

<<<<<<< HEAD
// ... estilos continuam os mesmos

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff', // fundo bege suave, igual ao protótipo
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 35,
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#000',
  },
  input: {
    width: '100%',
    height: 70,
    backgroundColor: '#FFF', // branco para destacar os campos
    borderWidth: 1.5,
    borderColor: '#FFB800', // amarelo consistente com botões
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 20,
    marginBottom: 25,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 75,
    backgroundColor: '#FFB800', // amarelo chapado igual protótipo
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 24,
  },
  registerText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  registerLink: {
    fontWeight: 'bold',
    color: '#FFB800', // link em amarelo, destacando ação
    textDecorationLine: 'underline',
    fontSize: 18,
  },
=======
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFBEF' },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 35 },
  logo: { width: 220, height: 220, resizeMode: 'contain', marginBottom: 30 },
  title: { fontSize: 42, fontWeight: 'bold', marginBottom: 40, color: '#000' },
  inputRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 25 },
  inputEmail: {
    flex: 1, height: 70, backgroundColor: '#FFF', borderWidth: 1.5,
    borderColor: '#FFB800', borderRadius: 16, paddingHorizontal: 20, fontSize: 20, color: '#000',
  },
  inputSenha: {
    width: '100%', height: 70, backgroundColor: '#FFF', borderWidth: 1.5,
    borderColor: '#FFB800', borderRadius: 16, paddingHorizontal: 20, fontSize: 20,
    color: '#000', marginBottom: 25,
  },
  tipoButton: {
    marginLeft: -50, width: 50, height: 70, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFB800',
  },
  tipoIcone: { width: 30, height: 30, resizeMode: 'contain' },
  button: {
    width: '100%', height: 75, backgroundColor: '#FFB800', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 40,
    shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6, elevation: 5,
  },
  buttonText: { color: '#000', fontWeight: 'bold', fontSize: 24 },
  registerText: { fontSize: 18, color: '#000', textAlign: 'center' },
  registerLink: { fontWeight: 'bold', color: '#FFB800', textDecorationLine: 'underline', fontSize: 18 },
>>>>>>> de014f1 (cadastro da gestão e o card das rotas)
});
