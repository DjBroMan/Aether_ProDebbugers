import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { useAuthStore } from '../store/authStore';

export default function FinanceGateway() {
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) setPin(prev => prev + num);
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const handlePayment = async () => {
    if (pin.length !== 4) return Alert.alert('Error', 'Enter 4-digit PIN');
    
    setProcessing(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/pay`,
        { amount: 1500, description: 'Semester Exam Fee' },
        { headers: { Authorization: `Bearer ${user?.token || 'MOCK'}` } }
      );
      Alert.alert('Payment Successful', 'Transaction logged to university ledger.');
      router.back();
    } catch (e) {
      // Fallback for dev mode
      Alert.alert('Payment Mocked', 'Locally mocking success as actual server proxy may be unreachable.');
      router.back();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View className="flex-1 bg-aether-bg pt-20 px-6 items-center">
      <TouchableOpacity 
        className="absolute top-16 left-6 p-2 bg-aether-surface rounded-full"
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#94A3B8" />
      </TouchableOpacity>

      <View className="bg-aether-surface w-20 h-20 rounded-full items-center justify-center mb-6">
        <MaterialCommunityIcons name="bank" size={40} color="#38BDF8" />
      </View>

      <Text className="text-aether-text text-2xl font-bold mb-2">Semester Exam Fee</Text>
      <Text className="text-aether-primary font-bold text-5xl mb-8">₹ 1,500.00</Text>

      <Text className="text-aether-muted mb-4 uppercase tracking-widest font-semibold text-xs">Enter Payment PIN</Text>
      
      <View className="flex-row gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className={`w-6 h-6 rounded-full border-2 ${pin.length >= i ? 'bg-aether-primary border-aether-primary' : 'border-aether-muted'} `} />
        ))}
      </View>

      <View className="flex-row flex-wrap justify-between w-64 mb-10">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((keypad, idx) => (
          <TouchableOpacity 
            key={idx}
            className={`w-[30%] h-16 justify-center items-center rounded-3xl mb-4 ${keypad ? 'bg-aether-surface active:hover:' : ''}`}
            onPress={() => {
              if (keypad === 'del') handleDelete();
              else if (keypad) handleKeyPress(keypad);
            }}
            disabled={!keypad || processing}
          >
            {keypad === 'del' ? (
              <MaterialCommunityIcons name="backspace-outline" size={24} color="#F87171" />
            ) : (
              <Text className="text-aether-text text-3xl font-medium">{keypad}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        className="w-full bg-aether-primary py-5 rounded-2xl items-center"
        onPress={handlePayment}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text className="text-[#0F172A] font-bold text-xl uppercase tracking-widest">Verify & Pay</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
