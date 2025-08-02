import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, Entypo, Feather } from '@expo/vector-icons';

export default function DetalhesRota() {
  const [inscrito, setInscrito] = useState(false);

  function handleInscrever() {
    if (!inscrito) {
      setInscrito(true);
      Alert.alert('Inscrição', 'Você se inscreveu na rota com sucesso!');
    }
  }

  function handleRemoverInscricao() {
    if (inscrito) {
      setInscrito(false);
      Alert.alert('Inscrição', 'Sua inscrição foi removida com sucesso!');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Rota 501</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.inscreverBtn, inscrito && styles.disabledBtn]}
          onPress={handleInscrever}
          disabled={inscrito}
        >
          <Text style={styles.inscreverText}>{inscrito ? 'Inscrito' : 'Inscrever-se'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.removerBtn, !inscrito && styles.disabledBtn]}
          onPress={handleRemoverInscricao}
          disabled={!inscrito}
        >
          <Text style={styles.removerText}>Remover inscrição</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>[ Mapa da rota será exibido aqui ]</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.item}><Entypo name="location" size={16} /> Origem: Centro</Text>
        <Text style={styles.item}><Entypo name="flag" size={16} /> Destino: Bairro</Text>
        <Text style={styles.item}><Ionicons name="time-outline" size={16} /> Saída: 07:15</Text>
        <Text style={styles.item}><Ionicons name="time-outline" size={16} /> Chegada: 07:45</Text>
        <Text style={styles.item}><Ionicons name="person-outline" size={16} /> João da Silva</Text>
        <Text style={styles.item}><Feather name="phone" size={16} /> (11) 91234-5678</Text>
        <Text style={styles.item}><FontAwesome5 name="car-side" size={16} /> Placa: ABC-1234 | Van Sprinter</Text>
        <Text style={styles.item}><Ionicons name="checkmark-circle-outline" size={16} color="#00B300" /> Em boas condições</Text>

        <TouchableOpacity style={styles.extraBtn}>
          <Ionicons name="notifications-outline" size={16} />
          <Text style={styles.extraText}> Ativar notificações da rota</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.extraBtn}>
          <Ionicons name="map-outline" size={16} />
          <Text style={styles.extraText}> Ver trajeto no mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.extraBtn}>
          <Feather name="edit" size={16} />
          <Text style={styles.extraText}> Editar inscrição</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFDF5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  inscreverBtn: {
    backgroundColor: '#FFD740',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  removerBtn: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  inscreverText: {
    fontWeight: 'bold',
  },
  removerText: {
    fontWeight: 'bold',
    color: '#333',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#ddd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapText: {
    color: '#777',
  },
  info: {
    marginTop: 16,
  },
  item: {
    fontSize: 14,
    marginVertical: 4,
    flexDirection: 'row',
  },
  extraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  extraText: {
    marginLeft: 6,
    fontSize: 14,
  },
});
