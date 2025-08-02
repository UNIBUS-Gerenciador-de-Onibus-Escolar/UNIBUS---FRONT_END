import React from 'react';
import { View,Text,TextInput,TouchableOpacity,Image,StyleSheet,SafeAreaView,KeyboardAvoidingView,Platform,ScrollView,} from 'react-native';
import { router } from 'expo-router';

export default function LoginScreen() {
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
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button}>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: 240,
    height: 240,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 45,
    color: '#000',
  },
  input: {
    width: '100%',
    height: 75,
    backgroundColor: '#f6f6f6',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 20,
    marginBottom: 25,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 75,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
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
    color: '#000',
    textDecorationLine: 'underline',
    fontSize: 18,
  },
});
