// app/PINGestao.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PINGestao() {
  const [pin, setPin] = useState('');
  const router = useRouter();

  const handlePress = (value: string) => {
    if (pin.length < 4) {
      setPin(pin + value);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleValidate = () => {
    const pinCorreto = '1234'; // PIN correto

    if (pin === pinCorreto) {
      Alert.alert('Acesso liberado');
      router.push('/painelAdm'); // ✅ Alterado aqui
    } else {
      Alert.alert('PIN incorreto');
      setPin('');
    }
  };

  const renderPinDots = () => (
    <View style={styles.pinDotsContainer}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i < pin.length ? '#000' : '#eee' },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>PIN de Acesso</Text>
      <Text style={styles.subtitle}>Digite seu PIN</Text>

      {renderPinDots()}

      <View style={styles.keyboard}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.key}
            onPress={() => handlePress(num)}
          >
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.key} onPress={handleBackspace}>
          <Ionicons name="backspace-outline" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.key} onPress={handleValidate}>
          <Ionicons name="checkmark-circle-outline" size={28} color="green" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 30,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 260,
    gap: 15,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  keyText: {
    fontSize: 24,
    color: '#000',
  },
});
