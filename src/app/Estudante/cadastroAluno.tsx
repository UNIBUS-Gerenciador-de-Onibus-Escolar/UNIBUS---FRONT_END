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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../BackEnd/IPconfig';

export default function Estudante() {
  const router = useRouter();

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

  const escolasDisponiveis: string[] = ['ETE - Ministro Fernando Lyra', 'Escola teste A', 'Escola teste B'];
  const escolaItems = escolasDisponiveis.map(e => ({ label: e, value: e }));

  // Validações (mantidas iguais)

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
      const response = await fetch(`${API_URL}/api/estudantes/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const resultado = await response.json();

      if (response.ok) {
        Alert.alert('Sucesso', resultado.mensagem || 'Cadastro realizado!');
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
      {/* Header com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastro de Estudante</Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <FlatList
            data={[0]} // Dummy data para renderizar todo o formulário
            renderItem={() => (
              <View style={styles.Main}>
                <Text style={styles.label}>Nome Completo *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Fulano de Tal"
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                  />
                </View>

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
                    style={[styles.input, { paddingLeft: 16 }]} // remove paddingLeft for no icon space
                    dropDownContainerStyle={{ backgroundColor: '#fff', borderColor: '#ccc', maxHeight: 200 }}
                    placeholder="Instituição de ensino"
                    listMode="SCROLLVIEW"
                    scrollViewProps={{ nestedScrollEnabled: true }}
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
                    style={[styles.input, { paddingLeft: 16 }]} // remove paddingLeft for no icon space
                    dropDownContainerStyle={{ backgroundColor: '#fff', borderColor: '#ccc' }}
                    placeholder="Selecione uma Turma"
                    listMode="SCROLLVIEW"
                    scrollViewProps={{ nestedScrollEnabled: true }}
                  />
                </View>

                <Text style={styles.label}>Email *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="exemplo@gmail.com"
                    value={email}
                    onChangeText={validarEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {erroEmail ? <Text style={styles.erro}>{erroEmail}</Text> : null}

                <Text style={styles.label}>N° da Matrícula *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="card-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="1234567"
                    value={matricula}
                    onChangeText={validarMatricula}
                    keyboardType="numeric"
                    maxLength={7}
                  />
                </View>
                {erroMatricula ? <Text style={styles.erro}>{erroMatricula}</Text> : null}

                <Text style={styles.label}>Nome do Responsável *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Responsável"
                    value={responsavel}
                    onChangeText={setResponsavel}
                    autoCapitalize="words"
                  />
                </View>

                <Text style={styles.label}>Telefone do Responsável *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="(81) 99999-9999"
                    value={telefone}
                    onChangeText={validarTelefone}
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                </View>
                {erroTelefone ? <Text style={styles.erro}>{erroTelefone}</Text> : null}

                <Text style={styles.label}>Senha *</Text>
                <View style={styles.passwordContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIconPassword} />
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, paddingLeft: 40 }]}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChangeText={validarSenha}
                    secureTextEntry={!showSenha}
                  />
                  <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={styles.eyeButton}>
                    <Ionicons name={showSenha ? "eye-off" : "eye"} size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                {erroSenha ? <Text style={styles.erro}>{erroSenha}</Text> : null}

                <Text style={styles.label}>Confirmar Senha *</Text>
                <View style={styles.passwordContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIconPassword} />
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0, paddingLeft: 40 }]}
                    placeholder="Confirme sua senha"
                    value={confirmaSenha}
                    onChangeText={validarConfirmaSenha}
                    secureTextEntry={!showConfirmaSenha}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmaSenha(!showConfirmaSenha)} style={styles.eyeButton}>
                    <Ionicons name={showConfirmaSenha ? "eye-off" : "eye"} size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                {erroConfirmaSenha ? <Text style={styles.erro}>{erroConfirmaSenha}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
                  {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#ffffffff' // fundo bege claro
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24, // margem maior no topo
    backgroundColor: '#ffc400ff',
  },
  backButton: {
    marginRight: 12,
    marginTop: 60,
  },
  headerTitle: {
    fontSize: 26,
    marginTop: 60,
    fontWeight: 'bold',
    color: '#000',
  },
  Main: {
    padding: 26,
  },
  scroll: { 
    padding: 0, 
    paddingBottom: 40 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    marginBottom: 4, 
    color: '#6B6B6B' // cinza escuro
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  inputIcon: {
    position: 'absolute',
    top: 14,
    left: 12,
    zIndex: 10,
  },
  inputIconPassword: {
    position: 'absolute',
    top: 18,
    left: 12,
    zIndex: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 40, // padding para ícones nos inputs com ícone
    paddingVertical: 14,
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
  eyeButton: {
    paddingHorizontal: 8,
  },
});
