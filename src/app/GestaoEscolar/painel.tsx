import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Route, Plus, Bell, BarChart3, Download } from 'lucide-react-native';
import { useRouter } from 'expo-router'; // Import do router (Expo Router)

const AdminPanel = () => {
  const router = useRouter(); // Instancia o router

  return (
    <ScrollView style={styles.container}>
      
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#111111']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <Text style={styles.headerSubtitle}>Gestão Completa do Transporte Escolar</Text>
      </LinearGradient>

      {/* Botões Principais */}
      <View style={styles.menuContainer}>

        {/* Cadastro de Rotas */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/GestaoEscolar/cadastroRotas')}
        >
          <LinearGradient
            colors={['#FFD600', '#FFB300']}
            style={styles.iconContainer}
          >
            <Plus size={28} color="#000" />
          </LinearGradient>
          <Text style={styles.menuText}>Cadastro de Rotas</Text>
        </TouchableOpacity>

        {/* Listagem de Alunos */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/GestaoEscolar/RotasCadastradas')}
        >
          <LinearGradient
            colors={['#FFD600', '#FFB300']}
            style={styles.iconContainer}
          >
               <Ionicons name="list" size={30} color="black" />
          </LinearGradient>
          <Text style={styles.menuText}>Listagem de Alunos</Text>
        </TouchableOpacity>

        {/* Relatórios */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/GestaoEscolar/Relatorios')}
        >
          <LinearGradient
            colors={['#FFD600', '#FFB300']}
            style={styles.iconContainer}
          >
            <BarChart3 size={28} color="#000" />
          </LinearGradient>
          <Text style={styles.menuText}>Relatórios</Text>
        </TouchableOpacity>

        {/* Solicitações de Rotas */}
        <TouchableOpacity
          style={styles.menuButton}
        >
          <LinearGradient
            colors={['#FFD600', '#FFB300']}
            style={styles.iconContainer}
          >
            <Bell size={28} color="#000" />
          </LinearGradient>
          <Text style={styles.menuText}>Solicitações de Rotas</Text>
        </TouchableOpacity>

         {/* Central de avisos */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/GestaoEscolar/CentralDeAvisos')}
        >
          <LinearGradient
            colors={['#FFD600', '#FFB300']}
            style={styles.iconContainer}
          >
           <View>
              <Ionicons name="chatbubble-ellipses" size={25} color="black" />
          </View>
          </LinearGradient>
          <Text style={styles.menuText}>Central de Avisos</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

export default AdminPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD600',
    marginBottom: 5,
    marginTop: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
  },
  menuContainer: {
    padding: 20,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
