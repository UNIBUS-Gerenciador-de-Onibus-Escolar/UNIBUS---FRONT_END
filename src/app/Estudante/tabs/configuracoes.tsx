import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch ,BackHandler, Alert} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Configuracoes() {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [idioma, setIdioma] = useState('Português');
  const router = useRouter();

  // Bloquear botão físico de voltar
  useEffect(() => {
    const backAction = () => {
      return true; // bloqueia o back
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Função de logout
  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            router.replace("/"); // volta para tela de login (index.tsx)
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Ionicons name="settings-outline" size={28} color="#000000ff" />
      <Text style={styles.title}> Configurações</Text>
      </View>
      {/* Seção Conta */}

    <View style={styles.mainContainer}>

      <Text style={styles.sectionTitle}>Conta</Text>

      <TouchableOpacity style={styles.option} onPress={() => alert('Editar perfil')}>
        <Ionicons name="person-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => alert('Alterar senha')}>
        <Ionicons name="key-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Alterar Senha</Text>
      </TouchableOpacity>

      {/* Seção Preferências */}
      <Text style={styles.sectionTitle}>Preferências</Text>

      <View style={styles.option}>
        <Ionicons name="notifications-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Notificações</Text>
        <Switch
          value={notificacoesAtivas}

          onValueChange={setNotificacoesAtivas}
          style={{ marginLeft: 'auto' }}
        />
      </View>

      <TouchableOpacity style={styles.option} onPress={() => alert('Selecionar idioma')}>
        <Ionicons name="language-outline" size={22} color="#333" />
        <Text style={styles.optionText}>Idioma: {idioma}</Text>
      </TouchableOpacity>

      {/* Seção Sistema */}
      <Text style={styles.sectionTitle}>Sistema</Text>


      <View style={styles.option}>
        <FontAwesome name="info-circle" size={22} color="#333" />
        <Text style={styles.optionText}>Versão do App: 1.0.0</Text>
      </View>

      {/* Sair */}
      <TouchableOpacity style={[styles.option, { marginTop: 20 }]} onPress={handleLogout}>
        <Ionicons name="exit-outline" size={22} color="#d00" />
        <Text style={[styles.optionText, { color: '#d00' }]}>Sair</Text>
      </TouchableOpacity>

      

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    padding: 0,
  },
  header: {
    backgroundColor: '#FFD600',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 0,
    padding: 15,
    paddingTop: 70,
  },

  mainContainer: {
    padding: 25,
    margin:'auto',
    width: 380,
    height: 600,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFD600',
    borderRadius: 10, 
    backgroundColor: '#ffffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000ff',
    marginTop: 25,
    marginBottom: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  voltar: {
    marginTop: 40,
    alignSelf: 'center',
  },
  voltarText: {
    fontSize: 16,
    color: '#555',
  },
});
