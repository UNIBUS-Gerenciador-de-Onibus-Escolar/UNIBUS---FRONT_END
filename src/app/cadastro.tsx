import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.containerLogo}>
        {/* Logo do app */}
        <Image
          style={styles.logoApp}
          source={require('../../assets/images/Logo_App.png')}
        />

        {/* Título */}
        <Text style={styles.title}>BEM-VINDO!</Text>
        <Text style={styles.subTitle}>Quem é você?</Text>

        {/* Botão Estudante */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/Estudante/cadastroAluno')}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/images/EstudanteIcon.png')}
          />
          <Text style={styles.buttonText}>ESTUDANTE</Text>
        </TouchableOpacity>

        {/* Botão Motorista */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/Motorista/motoristaCadastro')}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/images/MotoristaIcon.png')}
          />
          <Text style={styles.buttonText}>MOTORISTA</Text>
        </TouchableOpacity>

        {/* Botão Gestão Escolar */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push('/GestaoEscolar/cadastroGestao' as any)}
        >
          <Image
            style={styles.icon}
            source={require('../../assets/images/GestaoIcon.png')}
          />
          <Text style={styles.buttonText}>GESTÃO ESCOLAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    alignItems: 'center',
  },
  containerLogo: {
    flex: 1,
    marginTop: 60,
    alignItems: 'center',
  },
  logoApp: {
    width: 180,
    height: 180,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 20,
    color: '#6B6B6B',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 320,
    height: 80,
    backgroundColor: '#FFB800', // amarelo chapado igual ao protótipo
    borderRadius: 12,
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  icon: {
    width: 36,
    height: 36,
    marginRight: 20,
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
});
