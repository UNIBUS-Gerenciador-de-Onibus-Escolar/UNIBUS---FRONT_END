import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Onibus() {
  const [search, setSearch] = useState('');

  const busList = [
    { id: '1', plate: 'DEF3DAS', driver: 'Pedro Lima' },
    { id: '2', plate: 'CBA2C34', driver: 'Ana Souza' },
    { id: '3', plate: 'BAZ1B23', driver: 'Carlos Lima' },
  ];

  const filteredList = busList.filter(
    (bus) =>
      bus.plate.toLowerCase().includes(search.toLowerCase()) ||
      bus.driver.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>UniBus🚌</Text>
      <Text style={styles.header}>Ônibus</Text>

      <View style={styles.main}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#aaa" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Pesquisar"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.busItem}
              onPress={() =>
                router.push({
                  pathname: '/Estudante/telaTransporte',
                  params: {
                    id: item.id,
                    plate: item.plate,
                    driver: item.driver,
                  },
                })
              }
            >
              <FontAwesome name="bus" size={40} color="#f2c200" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.busPlate}>{item.plate}</Text>
                <Text>{item.driver}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <View style={styles.subscribeSection}>
                <Entypo name="grid" size={30} color="#f2c200" />
                <Text style={styles.subscribeText}>Inscrever-se no ônibus</Text>
              </View>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => alert('Função para inscrever um novo ônibus')}
              >
                <Text style={styles.subscribeButtonText}>Ver Ônibus Disponíveis</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbea',
    paddingTop: 70,
    margin: 0,
    padding: 0,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  main: {
    padding: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  busPlate: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subscribeText: {
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  subscribeButton: {
    backgroundColor: '#f2c200',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  subscribeButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  
});
