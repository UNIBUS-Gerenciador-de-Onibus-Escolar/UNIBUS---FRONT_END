import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha o email e a senha.');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.4:5000/api/estudantes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const resultado = await response.json();

      if (response.ok) {
        // salvar dados do estudante no AsyncStorage
        await AsyncStorage.setItem('estudante', JSON.stringify(resultado));

        Alert.alert('Bem-vindo!', `Olá, ${resultado.nome_completo}`);
        router.push('/Estudante/tabs/telaInicial'); // redireciona para a tela inicial
      } else {
        Alert.alert('Erro', resultado.erro || 'Login inválido');
      }
    } catch (error) {
      console.error('Erro ao logar:', error);
      Alert.alert('Erro', 'Erro de conexão com o servidor');
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
            placeholder="Senha"
            placeholderTextColor="#999"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>ENTRAR</Text>
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

// ... estilos continuam os mesmos

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBEF', // fundo bege suave, igual ao protótipo
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
});
