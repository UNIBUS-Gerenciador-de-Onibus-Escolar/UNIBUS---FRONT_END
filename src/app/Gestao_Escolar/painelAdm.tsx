import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function PainelAdmin() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel{'\n'}Admin</Text>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="person-outline" size={20} />
        <Text style={styles.buttonText}>Alunos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="add-outline" size={20} />
        <Text style={styles.buttonText}>Cadastro de Rotas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Ionicons name="list-outline" size={20} />
        <Text style={styles.buttonText}>Listagem de Alunos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <MaterialIcons name="file-download" size={20} />
        <Text style={styles.buttonText}>Exportação de Dados</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <FontAwesome5 name="chart-bar" size={20} />
        <Text style={styles.buttonText}>Relatórios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
