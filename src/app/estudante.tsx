import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Estudante() {
  const navigation = useNavigation<any>();

  const [nome, setNome] = useState('');
  const [curso, setCurso] = useState('');
  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');

  // Novos estados para senha
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  const handleCadastro = () => {
    // Valida campos obrigatórios
    if (!nome || !email || !matricula || !responsavel || !telefone) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    // Valida senhas
    if (!senha || !confirmaSenha) {
      Alert.alert('Atenção', 'Preencha os campos de senha e confirmação.');
      return;
    }
    if (senha !== confirmaSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const dados = {
      nome,
      curso,
      email,
      matricula,
      responsavel,
      telefone,
      senha, // incluir senha no objeto
    };

    Alert.alert('Cadastro realizado!', JSON.stringify(dados, null, 2));

    // Limpar campos
    setNome('');
    setCurso('');
    setEmail('');
    setMatricula('');
    setResponsavel('');
    setTelefone('');
    setSenha('');
    setConfirmaSenha('');

    // Navegar para telaInicial
    navigation.navigate('telaInicial');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>CADASTRA-SE:</Text>

        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Fulano de tal"
          value={nome}
          onChangeText={setNome}
        />

        <Text style={styles.label}>Curso</Text>
        <TextInput
          style={styles.input}
          placeholder="Opcional"
          value={curso}
          onChangeText={setCurso}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@gmail.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>N° da Matrícula *</Text>
        <TextInput
          style={styles.input}
          placeholder="123456"
          keyboardType="numeric"
          value={matricula}
          onChangeText={setMatricula}
        />

        <Text style={styles.label}>Nome do Responsável *</Text>
        <TextInput
          style={styles.input}
          placeholder="Responsável"
          value={responsavel}
          onChangeText={setResponsavel}
        />

        <Text style={styles.label}>N° do Responsável *</Text>
        <TextInput
          style={styles.input}
          placeholder="(81) 99999-9999"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />

        {/* NOVOS CAMPOS DE SENHA */}
        <Text style={styles.label}>Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <Text style={styles.label}>Confirmar Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirme sua senha"
          secureTextEntry
          value={confirmaSenha}
          onChangeText={setConfirmaSenha}
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>CADASTRAR</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2efe5',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 4,
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
