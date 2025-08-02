import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const { height, width } = Dimensions.get('window');

export default function Index() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.OnibusFundo}
        source={require('../../assets/images/onibus.png')}
        resizeMode="contain"
      />

      <View style={styles.containerLogo}>
        <Image
          style={styles.logoApp}
          source={require('../../assets/images/Logo_App.png')}
        />

        <Text style={styles.title}>BEM-VINDO!</Text>
        <Text style={styles.SubTitle}>---- Quem é você? ----</Text>

        {/* Botão Estudante */}
        <TouchableOpacity
          style={styles.border}
          onPress={() => router.push('/estudante')}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/images/EstudanteIcon.png')}
          />
          <Text style={styles.texto}>ESTUDANTE</Text>
        </TouchableOpacity>

        {/* Botão Motorista */}
        <TouchableOpacity
          style={styles.border}
          onPress={() => router.push('/motorista')}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/images/MotoristaIcon.png')}
          />
          <Text style={styles.texto}>MOTORISTA</Text>
        </TouchableOpacity>

        {/* Botão Gestão Escolar */}
        <TouchableOpacity 
          style={styles.border}
          onPress={() => router.push('/gestao')}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/images/GestaoIcon.png')}
          />
          <Text style={styles.texto}>GESTÃO ESCOLAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    position: 'relative',
  },
  containerLogo: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
  },
  logoApp: {
    width: 350,
    height: 260,
  },
  title: {
    fontSize: 55,
    fontWeight: 'bold',
  },
  SubTitle: {
    fontSize: 40,
    marginTop: 20,
    color: '#FFCF01',
    marginBottom: 15,
  },
  border: {
    marginTop: 30,
    padding: 5,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: 'white',
    shadowColor: '#000',
    elevation: 5,
    width: 350,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
  },
  texto: {
    fontSize: 28,
    marginLeft: 20,
  },
  icon: {
    marginLeft: 10,
    width: 50,
    height: 50,
  },
  OnibusFundo: {
    position: 'absolute',
    width: 400,
    height: 200,
    top: height - 70,
    right: width - 500,
    bottom: 0,
    opacity: 0.8,
    zIndex: -1,
  },
});
