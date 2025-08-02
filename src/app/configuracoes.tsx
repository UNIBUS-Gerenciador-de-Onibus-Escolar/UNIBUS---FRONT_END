import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

export default function Configuracoes() {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [idioma, setIdioma] = useState('Português');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Configurações</Text>

      {/* Seção Conta */}
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
        <MaterialIcons name="timer" size={22} color="#333" />
        <Text style={styles.optionText}>Tempo de uso: 1h 23min</Text>
      </View>

      <View style={styles.option}>
        <FontAwesome name="info-circle" size={22} color="#333" />
        <Text style={styles.optionText}>Versão do App: 1.0.0</Text>
      </View>

      {/* Sair */}
      <TouchableOpacity style={[styles.option, { marginTop: 20 }]} onPress={() => alert('Sair')}>
        <Ionicons name="exit-outline" size={22} color="#d00" />
        <Text style={[styles.optionText, { color: '#d00' }]}>Sair</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.voltar}>
        <Text style={styles.voltarText}>← Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbea',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
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
