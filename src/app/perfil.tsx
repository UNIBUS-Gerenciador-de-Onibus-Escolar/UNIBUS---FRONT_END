import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function Perfil() {
  // Estado para dados do usuário
  const [usuario, setUsuario] = useState({
    nome: 'Perfil teste',
    email: 'teste.unibus@email.com',
    telefone: '(11) 91234-5678',
    tipo: 'Aluno',
    foto: null as string | null,
    onibus: [
      { id: '1', placa: 'ABC-1234', modelo: 'Van Sprinter' },
      { id: '2', placa: 'XYZ-5678', modelo: 'Micro-ônibus' },
    ],
  });

  // Permissão para galeria: boolean ou null (indefinido)
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar a galeria.');
      }
    })();
  }, []);

  async function escolherFoto() {
    if (!hasGalleryPermission) {
      Alert.alert('Sem permissão', 'Permissão para acessar a galeria não concedida.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        setUsuario((prev) => ({ ...prev, foto: result.assets[0].uri }));
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  function handleEditarPerfil() {
    Alert.alert('Editar Perfil', 'Função de editar perfil ainda não implementada.');
  }

  function handleLogout() {
    Alert.alert('Logout', 'Função de sair ainda não implementada.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={escolherFoto} style={styles.photoContainer}>
        {usuario.foto ? (
          <Image source={{ uri: usuario.foto }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="person" size={80} color="#ccc" />
            <Text style={{ color: '#888', marginTop: 8 }}>Clique para adicionar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.name}>{usuario.nome}</Text>
      <Text style={styles.email}>{usuario.email}</Text>

      <View style={styles.infoBox}>
        <Ionicons name="call" size={20} color="#555" />
        <Text style={styles.infoText}>{usuario.telefone}</Text>
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="person-outline" size={20} color="#555" />
        <Text style={styles.infoText}>{usuario.tipo}</Text>
      </View>

      <View style={styles.onibusSection}>
        <Text style={styles.sectionTitle}>Ônibus cadastrados</Text>
        {usuario.onibus.length === 0 ? (
          <Text style={{ color: '#999', fontStyle: 'italic' }}>Nenhum ônibus cadastrado.</Text>
        ) : (
          <FlatList
            data={usuario.onibus}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.onibusItem}>
                <FontAwesome5 name="bus" size={24} color="#f2c200" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.onibusText}>Placa: {item.placa}</Text>
                  <Text style={styles.onibusText}>Modelo: {item.modelo}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleEditarPerfil}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Ionicons name="exit-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFDF5',
    alignItems: 'center',
    paddingBottom: 40,
  },
  photoContainer: {
    marginBottom: 20,
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '80%',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#444',
  },
  onibusSection: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  onibusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fffbea',
    padding: 12,
    borderRadius: 8,
  },
  onibusText: {
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FFD740',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
});
