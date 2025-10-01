import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '../BackEnd/IPconfig';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

type UsuarioTipo = 'estudante' | 'gestao' | 'motorista';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<UsuarioTipo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!tipo) {
      Alert.alert('Atenção', 'Selecione o tipo de usuário.');
      return;
    }
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

      let nomeUsuario = '';
      if (tipo === 'estudante') nomeUsuario = resultado.nome_completo;
      else if (tipo === 'gestao') nomeUsuario = resultado.nome_gestor;
      else if (tipo === 'motorista') nomeUsuario = resultado.motorista.nome_completo;

      Alert.alert('Bem-vindo!', `Olá, ${nomeUsuario}`);

      if (tipo === 'estudante') router.push('/Estudante/tabs/telaInicial');
      if (tipo === 'gestao') router.push('/GestaoEscolar/painel');
      if (tipo === 'motorista') router.push('/Motorista/telaMotorista');

    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Falha de conexão');
    } finally {
      setLoading(false);
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
          {/* Logo e título */}
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/Logo_App.png')} style={styles.logo} />
            <Text style={styles.title}>UniBus</Text>
            <Text style={styles.subtitle}>Sistema de Transporte Escolar</Text>
          </View>

          {/* Card de Login */}
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Fazer Login</Text>
            <Text style={styles.loginSubtitle}>Acesse sua conta para continuar</Text>

            {/* Escolha de Usuário */}
            <Text style={styles.userTypeLabel}>Escolha seu usuário</Text>
            <View style={styles.userTypeContainer}>
              {[
                { id: 'estudante', label: 'Estudante', icon: <Image source={require('../../assets/images/EstudanteIcon.png')} style={{ width: 32, height: 32 }} /> },
                { id: 'gestao', label: 'Gestão', icon: <Image source={require('../../assets/images/GestaoIcon.png')} style={{ width: 32, height: 32 }} /> },
                { id: 'motorista', label: 'Motorista', icon: <Image source={require('../../assets/images/MotoristaIcon.png')} style={{ width: 32, height: 32 }} /> },
              ].map(({ id, label, icon }) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.userTypeButton,
                    tipo === id && styles.userTypeButtonSelected,
                  ]}
                  onPress={() => setTipo(id as UsuarioTipo)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.userTypeIconBox, tipo === id && styles.userTypeIconBoxSelected]}>
                    {icon}
                  </View>
                  <Text style={[styles.userTypeText, tipo === id && styles.userTypeTextSelected]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Campos de Email e Senha */}
            {tipo && (
              <View style={styles.formFields}>
                {/* Email */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="exemplo@gmail.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {/* Senha */}
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 40 }]}
                    placeholder="Digite sua senha"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={senha}
                    onChangeText={setSenha}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <Ionicons name="eye-outline" size={20} color="#9CA3AF" />
                    ) : (
                      <Ionicons name="eye-off-outline" size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>

                
              </View>
            )}

            {/* Botão Entrar */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (loading || !tipo || !email || !senha) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading || !tipo || !email || !senha}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <View style={styles.loginButtonContent}>
                  <Text style={styles.loginButtonText}>ENTRAR</Text>
                  <FontAwesome5 name="arrow-right" size={20} color="#000" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Link de Cadastro */}
          <TouchableOpacity onPress={() => router.push('/cadastro')} activeOpacity={0.7}>
            <Text style={styles.registerText}>
              Não tem conta? <Text style={styles.registerLink}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>

          {/* Card Sistema Educacional */}
          <View style={styles.systemCard}>
            <FontAwesome5 name="graduation-cap" size={32} color="#FBBF24" style={styles.systemIcon} />
            <Text style={styles.systemTitle}>Transporte Escolar</Text>
            <Text style={styles.systemDescription}>
              Conectando estudantes, escolas e motoristas
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8ff', // amarelo claro do gradiente do fundo do código 1
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginTop: 60,
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'white', // amarelo gradiente aproximado
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  bus: {
    width: 48,
    height: 32,
    backgroundColor: '#000',
    borderRadius: 8,
    position: 'relative',
  },
  busTop: {
    position: 'absolute',
    top: -4,
    left: 4,
    right: 4,
    height: 12,
    backgroundColor: '#27272A',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  busBottomLeft: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 8,
    height: 4,
    backgroundColor: '#FBBF24',
    borderRadius: 4,
  },
  busBottomRight: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 4,
    backgroundColor: '#FBBF24',
    borderRadius: 4,
  },
  graduationCapContainer: {
    position: 'absolute',
    top: -12,
    right: -8,
    width: 24,
    height: 24,
  },
  graduationCap: {
    width: 24,
    height: 24,
    backgroundColor: '#000',
    borderRadius: 4,
    transform: [{ rotate: '12deg' }],
    position: 'relative',
  },
  graduationCapDetailsTop: {
    position: 'absolute',
    top: -4,
    left: '50%',
    width: 4,
    height: 12,
    backgroundColor: '#000',
    transform: [{ translateX: -2 }],
  },
  graduationCapDetailsBottom: {
    position: 'absolute',
    top: -8,
    left: '50%',
    width: 4,
    height: 4,
    backgroundColor: '#FBBF24',
    borderRadius: 2,
    transform: [{ translateX: -2 }],
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#27272A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#52525B',
  },
  loginCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#52525B',
    marginBottom: 24,
  },
  userTypeLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#52525B',
    marginBottom: 12,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 16,
  },
  userTypeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    width: 96,
  },
  userTypeButtonSelected: {
    backgroundColor: '#FBBF24',
    shadowOpacity: 0.25,
    transform: [{ scale: 1.05 }],
  },
  userTypeIconBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
  },
  userTypeIconBoxSelected: {
    backgroundColor: '#FBBF24',
  },
  userTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  userTypeTextSelected: {
    color: '#27272A',
  },
  formFields: {
    marginTop: 8,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 24,
    
  },
  inputIcon: {
    position: 'absolute',
    top: 18,
    left: 16,
    zIndex: 10,
  },
  input: {
    height: 56,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#FBBF24',
    borderRadius: 24,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#27272A',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    zIndex: 10,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#FBBF24',
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    height: 56,
    borderRadius: 24,
    backgroundColor: '#ffbe18ff',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#ffffffff',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    fontWeight: '900',
    fontSize: 18,
    marginRight: 20,
    color: '#27272A',
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#52525B',
    textAlign: 'center',
    marginBottom: 24,
  },
  registerLink: {
    fontWeight: '700',
    color: '#FBBF24',
    textDecorationLine: 'underline',
  },
  systemCard: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 15,
  },
  systemIcon: {
    marginBottom: 12,
  },
  systemTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 8,
  },
  systemDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
