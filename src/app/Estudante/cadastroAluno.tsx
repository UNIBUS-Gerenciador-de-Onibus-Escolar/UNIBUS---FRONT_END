import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Estudante() {
  const [nome, setNome] = useState('');
  const [escola, setEscola] = useState('');
  const [openEscola, setOpenEscola] = useState(false);
  const [openTurma, setOpenTurma] = useState(false);
  const [turma, setTurma] = useState<string>('1TDS"A"');

  const [email, setEmail] = useState('');
  const [matricula, setMatricula] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmaSenha, setShowConfirmaSenha] = useState(false);

  // Mensagens de erro
  const [erroNome, setErroNome] = useState('');
  const [erroEscola, setErroEscola] = useState('');
  const [erroTurma, setErroTurma] = useState('');
  const [erroEmail, setErroEmail] = useState('');
  const [erroMatricula, setErroMatricula] = useState('');
  const [erroTelefone, setErroTelefone] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [erroConfirmaSenha, setErroConfirmaSenha] = useState('');

  const turmasDisponiveis: string[] = [
    '1TDS"A"', '1TDS"B"', '2TDS"A"', '2TDS"B"', '3TDS"A"', '3TDS"B"',
    '1MKT"A"', '1MKT"B"', '2MKT"A"', '2MKT"B"', '3MKT"A"', '3MKT"B"',
  ];
  const turmaItems = turmasDisponiveis.map(t => ({ label: t, value: t }));

  // Exemplo de escolas cadastradas (pode vir do backend futuramente)
  const escolasDisponiveis: string[] = ['ETE - Ministro Fernando Lyra', 'Escola teste A', 'Escola teste B'];
  const escolaItems = escolasDisponiveis.map(e => ({ label: e, value: e }));

  const parseTurma = (t: string) => {
    const m = t.match(/^(\d)([A-Z]{3})"([A-Z])"$/);
    return {
      anoFromTurma: m?.[1] ?? '',
      cursoAbrev: m?.[2] ?? '',
      classe: m?.[3] ?? '',
    };
  };

  // Validações
  const validarEmail = (text: string) => {
    setEmail(text);
    setErroEmail(/\S+@\S+\.\S+/.test(text) ? '' : 'Email inválido');
  };

  const validarMatricula = (text: string) => {
    const numeros = text.replace(/\D/g, '');
    setMatricula(numeros);
    setErroMatricula(/^\d{7}$/.test(numeros) ? '' : 'Matrícula deve ter 7 números');
  };

  const formatTelefone = (text: string) => {
    const numeros = text.replace(/\D/g, '');
    let formatted = numeros;
    if (numeros.length > 0) formatted = `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7,11)}`;
    return formatted;
  };

  const validarTelefone = (text: string) => {
    const formatado = formatTelefone(text);
    setTelefone(formatado);
    setErroTelefone(formatado.replace(/\D/g, '').length >= 10 ? '' : 'Telefone inválido');
  };

  const validarSenha = (text: string) => {
    setSenha(text);
    setErroSenha(text.length >= 6 ? '' : 'Senha deve ter mínimo 6 caracteres');
  };

  const validarConfirmaSenha = (text: string) => {
    setConfirmaSenha(text);
    setErroConfirmaSenha(text === senha ? '' : 'Senhas não coincidem');
  };

  const handleCadastro = async () => {
    // Validar campos antes de enviar
    if (!nome || !escola || !turma || !email || !matricula || !responsavel || !telefone) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (erroEmail || erroMatricula || erroTelefone || erroSenha || erroConfirmaSenha) {
      Alert.alert('Atenção', 'Corrija os erros antes de continuar.');
      return;
    }

    const dados = {
      nome_completo: nome,
      escola,
      turma,
      email,
      numero_matricula: matricula,
      nome_responsavel: responsavel,
      numero_responsavel: telefone,
      senha,
    };

    try {
      setLoading(true);
      const response = await fetch('http://192.168.0.4:5000/api/estudantes/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const resultado = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', resultado.mensagem || 'Cadastro realizado!');
        // Resetar campos
        setNome(''); setEscola(''); setTurma('1TDS"A"');
        setEmail(''); setMatricula(''); setResponsavel(''); setTelefone('');
        setSenha(''); setConfirmaSenha('');
        router.push('/Estudante/tabs/telaInicial');
      } else {
        Alert.alert('Erro', resultado.erro || 'Erro no cadastro');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <FlatList
  data={[0]} // Dummy data para renderizar todo o formulário
  renderItem={() => (
    <>
      <Text style={styles.title}>📚 Cadastro de Estudante</Text>

      <Text style={styles.label}>Nome Completo *</Text>
      <TextInput
        style={styles.input}
        placeholder="Fulano de Tal"
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
      />

      <View style={{ zIndex: 3000, width: '100%' }}>
  <Text style={styles.label}>Escola *</Text>
  <DropDownPicker
    open={openEscola}
    value={escola}
    items={escolaItems}
    setOpen={setOpenEscola}
    setValue={(callback) => {
      const v = typeof callback === 'function' ? callback(escola) : callback;
      setEscola(v as string);
    }}
    style={styles.input}
    dropDownContainerStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }}
    placeholder="Instituição de ensino" 
  />
</View>

<View style={{ zIndex: 2000, width: '100%' }}>
  <Text style={styles.label}>Turma *</Text>
  <DropDownPicker
    open={openTurma}
    value={turma}
    items={turmaItems}
    setOpen={setOpenTurma}
    setValue={(callback) => {
      const v = typeof callback === 'function' ? callback(turma) : callback;
      setTurma(v as string);
    }}
    style={styles.input}
    dropDownContainerStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }}
    placeholder="Selecione uma Turma" 
  />
</View>

        {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="exemplo@gmail.com"
              value={email}
              onChangeText={validarEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {erroEmail ? <Text style={styles.erro}>{erroEmail}</Text> : null}

            {/* Matrícula */}
            <Text style={styles.label}>N° da Matrícula *</Text>
            <TextInput
              style={styles.input}
              placeholder="1234567"
              value={matricula}
              onChangeText={validarMatricula}
              keyboardType="numeric"
              maxLength={7}
            />
            {erroMatricula ? <Text style={styles.erro}>{erroMatricula}</Text> : null}

            {/* Responsável */}
            <Text style={styles.label}>Nome do Responsável *</Text>
            <TextInput
              style={styles.input}
              placeholder="Responsável"
              value={responsavel}
              onChangeText={setResponsavel}
              autoCapitalize="words"
            />

            {/* Telefone */}
            <Text style={styles.label}>Telefone do Responsável *</Text>
            <TextInput
              style={styles.input}
              placeholder="(81) 99999-9999"
              value={telefone}
              onChangeText={validarTelefone}
              keyboardType="phone-pad"
              maxLength={15}
            />
            {erroTelefone ? <Text style={styles.erro}>{erroTelefone}</Text> : null}

            {/* Senha */}
            <Text style={styles.label}>Senha *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={validarSenha}
                secureTextEntry={!showSenha}
              />
              <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
                <Ionicons name={showSenha ? "eye-off" : "eye"} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {erroSenha ? <Text style={styles.erro}>{erroSenha}</Text> : null}

            {/* Confirmar Senha */}
            <Text style={styles.label}>Confirmar Senha *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                placeholder="Confirme sua senha"
                value={confirmaSenha}
                onChangeText={validarConfirmaSenha}
                secureTextEntry={!showConfirmaSenha}
              />
              <TouchableOpacity onPress={() => setShowConfirmaSenha(!showConfirmaSenha)}>
                <Ionicons name={showConfirmaSenha ? "eye-off" : "eye"} size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {erroConfirmaSenha ? <Text style={styles.erro}>{erroConfirmaSenha}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
            </TouchableOpacity>
    </>
  )}
  keyExtractor={(_item: unknown, index: number) => index.toString()}
  contentContainerStyle={styles.scroll}
  keyboardShouldPersistTaps="handled"
/>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFBEF' // fundo bege claro
  },
  scroll: { 
    padding: 24, 
    paddingBottom: 40 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#000', 
    textAlign: 'center' 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 4, 
    color: '#6B6B6B' // cinza escuro
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#FFD84D', // borda amarela
    color: '#000', // texto preto
  },
  button: {
    backgroundColor: '#FFB800', // amarelo forte
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    elevation: 4,
  },
  buttonText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000' // preto
  },
  erro: { 
    color: 'red', 
    fontSize: 12, 
    marginBottom: 8 
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#FFD84D", // borda amarela
  },
});
