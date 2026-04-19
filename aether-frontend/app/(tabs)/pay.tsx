import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';

const breakdown = [
  { label: 'Library fine', amount: 250 },
  { label: 'Lab fee', amount: 800 },
  { label: 'Canteen tab', amount: 200 },
];

type Receipt = { transactionId: string; amount: number; method: string; clearedAt: string };

export default function PayScreen() {
  const [method, setMethod] = useState<'UPI' | 'Card'>('UPI');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const { createPayment } = useCampusStore();

  const total = breakdown.reduce((s, b) => s + b.amount, 0);

  const onPay = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/pay`, {
        amount: total, method, description: 'Campus dues clearance', items: breakdown,
      }, {
        headers: { Authorization: `Bearer ${user?.token}`, 'x-mock-role': user?.role || 'STUDENT', 'Content-Type': 'application/json' }
      });
      setReceipt(res.data);
      createPayment({ amount: total, method, items: breakdown });
    } catch (err) {
      console.warn('[Pay] Backend failed, using local store:', (err as Error).message);
      const p = createPayment({ amount: total, method, items: breakdown });
      setReceipt({ transactionId: p.txn, amount: p.amount, method: p.method, clearedAt: new Date().toISOString() });
    } finally { setLoading(false); }
  };

  if (receipt) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F5FF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} style={s.successOrb}>
          <MaterialCommunityIcons name="check-circle" size={48} color="#FFF" />
        </LinearGradient>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1E1040', marginTop: 24 }}>Payment Successful</Text>
        <Text style={{ fontSize: 14, color: '#6B5B8A', marginTop: 8 }}>₹{receipt.amount} paid via {receipt.method}</Text>
        <Text style={{ fontSize: 12, color: '#A394C0', marginTop: 4 }}>Txn · {receipt.transactionId}</Text>

        <TouchableOpacity style={s.downloadBtn}>
          <MaterialCommunityIcons name="download" size={18} color="#1E1040" />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E1040' }}>Download Receipt (PDF)</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.9}>
          <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.homeBtn}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Back to Home</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F5FF' }}>
      <View style={s.header}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E1040' }}>Payments</Text>
        <Text style={{ fontSize: 11, color: '#A394C0' }}>Settle your dues instantly</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Total dues hero */}
        <View style={s.heroBanner}>
          <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
          <Text style={{ fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>TOTAL DUES</Text>
          <Text style={{ fontSize: 36, fontWeight: '800', color: '#FFF', marginTop: 4 }}>₹{total}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{breakdown.length} outstanding items</Text>

          <View style={s.walletRow}>
            <MaterialCommunityIcons name="wallet-outline" size={18} color="#FFF" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFF', marginLeft: 8 }}>AETHER Wallet</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginLeft: 'auto' }}>Mock Clearinghouse</Text>
          </View>
        </View>

        {/* Breakdown */}
        <View style={s.card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1040', marginBottom: 12 }}>Breakdown</Text>
          {breakdown.map((b) => (
            <View key={b.label} style={s.breakdownItem}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E1040' }}>{b.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E1040' }}>₹{b.amount}</Text>
            </View>
          ))}
        </View>

        {/* Payment method */}
        <View style={s.card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1040', marginBottom: 12 }}>Payment Method</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {(['UPI', 'Card'] as const).map((m) => {
              const iconName = m === 'UPI' ? 'cellphone' : 'credit-card-outline';
              return (
                <TouchableOpacity key={m} onPress={() => setMethod(m)} style={{ flex: 1 }} activeOpacity={0.9}>
                  {method === m ? (
                    <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} style={s.methodBtn}>
                      <MaterialCommunityIcons name={iconName} size={22} color="#FFF" />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF', marginTop: 4 }}>{m}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[s.methodBtn, { backgroundColor: '#F0ECF6' }]}>
                      <MaterialCommunityIcons name={iconName} size={22} color="#A394C0" />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#A394C0', marginTop: 4 }}>{m}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pay button */}
        <TouchableOpacity onPress={onPay} disabled={loading} activeOpacity={0.9}>
          <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.payBtn}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: 2 }}>PAY ₹{total}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E4DCF0' },
  heroBanner: { borderRadius: 24, padding: 20, overflow: 'hidden', marginBottom: 16, elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 20 },
  walletRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 16, elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  breakdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0ECF6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  methodBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  payBtn: { borderRadius: 28, paddingVertical: 16, alignItems: 'center', elevation: 6, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16 },
  successOrb: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 20 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 28, paddingHorizontal: 24, paddingVertical: 14, marginTop: 24, elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  homeBtn: { borderRadius: 28, paddingHorizontal: 32, paddingVertical: 14, marginTop: 12, elevation: 4 },
});
