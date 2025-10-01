import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Route, Plus, Bell, BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const AdminPanel = () => {
  const router = useRouter();
   
useEffect(() => {
    const backAction = () => {
      // Aqui você pode até mostrar um alerta se quiser
      return true; // true = bloqueia o botão voltar
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // remove ao desmontar
  }, []);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    }
  };

  const topLineRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  const middleLineOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const bottomLineRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });
  const sidebarLeft = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 0],
  });
  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3], // menos opaco para ver o conteúdo atrás
  });

  const showMessage = (action: string) => {
    alert(`Acessando: ${action}`);
    closeSidebar();
  };

  const logout = async () => {
  Alert.alert(
    "Confirmação",
    "Deseja sair do sistema?",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            // limpa dados de autenticação (se houver)
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('usuario'); 
            
            // fecha sidebar
            closeSidebar();

            // redireciona para tela de login
            router.replace("/"); // "/" aponta para index.tsx (login)
          } catch (error) {
            console.log("Erro ao deslogar:", error);
          }
        }
      }
    ]
  );
};

  const closeSidebar = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start(() => setSidebarVisible(false));
  };

  return (
    <>
      {/* Modal para sidebar e overlay */}
      <Modal
        transparent
        visible={sidebarVisible}
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <Pressable style={styles.pressableOverlay} onPress={closeSidebar}>
          <Animated.View
            style={[styles.overlay, { opacity: overlayOpacity }]}
          />
        </Pressable>

        <Animated.View style={[styles.sidebar, { left: sidebarLeft }]}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.schoolName}>ETE Ministro Fernando Lyra</Text>
            <Text style={styles.schoolSubtitle}>- Gestão Escolar -</Text>
          </View>
          <View style={styles.sidebarContent}>
            <TouchableOpacity
              style={styles.sidebarLink}
              onPress={() => showMessage('Editar Perfil')}
            >
              <Text style={styles.sidebarLinkText}>Editar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarLink}
              onPress={() => showMessage('Configurações')}
            >
              <Text style={styles.sidebarLinkText}>Configurações</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarLink}
              onPress={() => showMessage('Notificações')}
            >
              <Text style={styles.sidebarLinkText}>Notificações</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarLink}
              onPress={() => showMessage('Ajuda')}
            >
              <Text style={styles.sidebarLinkText}>Ajuda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarLink}
              onPress={() => showMessage('Sobre')}
            >
              <Text style={styles.sidebarLinkText}>Sobre</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutBtnText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      <ScrollView style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#000000', '#111111']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuToggle}>
              <View style={styles.hamburger}>
                <Animated.View
                  style={[
                    styles.hamburgerLine,
                    {
                      transform: [
                        { rotate: topLineRotate },
                        {
                          translateX: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 5],
                          }),
                        },
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 5],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Animated.View
                  style={[styles.hamburgerLine, { opacity: middleLineOpacity }]}
                />
                <Animated.View
                  style={[
                    styles.hamburgerLine,
                    {
                      transform: [
                        { rotate: bottomLineRotate },
                        {
                          translateX: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 7],
                          }),
                        },
                        {
                          translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -6],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Painel Administrativo</Text>
            <Text style={styles.headerSubtitle}>
              Gestão Completa do Transporte Escolar
            </Text>
          </View>
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
          <TouchableOpacity style={styles.menuButton}>
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
              <Ionicons name="chatbubble-ellipses" size={25} color="black" />
            </LinearGradient>
            <Text style={styles.menuText}>Central de Avisos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
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
  headerTop: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start', // só o botão do menu
  },
  menuToggle: {
    padding: 10,
    marginRight: 20,
  },
  hamburger: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 2,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFD600',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '400',
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
    backgroundColor: '#FFD600',
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: '#333',
    zIndex: 1000,
  },
  sidebarHeader: {
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD600',
    marginBottom: 5,
  },
  schoolSubtitle: {
    fontSize: 14,
    color: 'white',
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarLink: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sidebarLinkText: {
    color: 'white',
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  logoutBtnText: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  pressableOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});
