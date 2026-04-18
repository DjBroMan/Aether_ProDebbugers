import { View, Text, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      router.replace('/(tabs)');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/tickets`, {
          headers: { Authorization: `Bearer ${user?.token || 'MOCK'}` }
        });
        setTickets(res.data);
      } catch (err) {
        console.error('Failed to fetch admin metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  // Dynamic Chart Generation Logic based on tickets
  const recentLength = tickets.length;
  const analyticsData = {
    labels: ['Wed', 'Thu', 'Fri', 'Sat', 'Today'],
    datasets: [{ data: [12, 19, 15, 22, recentLength > 0 ? recentLength : 30] }] // Mocking history but putting real length on Today
  };

  const chartConfig = {
    backgroundColor: '#1E293B',
    backgroundGradientFrom: '#0F172A',
    backgroundGradientTo: '#1E293B',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '6', strokeWidth: '2', stroke: '#0F172A' }
  };

  if (user?.role === 'STUDENT') return <View className="flex-1 bg-aether-bg" />;

  return (
    <ScrollView className="flex-1 bg-aether-bg">
      <View className="pt-16 pb-6 px-6 border-b border-aether-border bg-aether-surface shadow-2xl">
        <Text className="text-aether-text text-3xl font-bold">Admin Hive</Text>
        <Text className="text-aether-primary text-sm font-medium tracking-wide">Infrastructure & Traffic Heatmaps</Text>
      </View>

      <View className="p-6">
        <Text className="text-aether-text text-xl font-bold mb-4">Infrastructure Tickets Resolved</Text>
        <View className="bg-aether-surface p-4 rounded-2xl border border-aether-border mb-8 shadow-sm">
          {loading ? (
             <ActivityIndicator color="#38BDF8" size="large" className="m-10" />
          ) : (
            <LineChart
              data={analyticsData}
              width={screenWidth - 80}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{ borderRadius: 16 }}
            />
          )}
        </View>

        <Text className="text-aether-text text-xl font-bold mb-4">Department Load Analytics</Text>
        <View className="bg-aether-surface p-4 rounded-2xl border border-aether-border mb-8 shadow-sm">
          <BarChart
            data={{
              labels: ['CSE', 'ECE', 'MECH', 'BIO'],
              datasets: [{ data: [85, 45, 30, 20] }] // Normally this would group users by department metric
            }}
            width={screenWidth - 80}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
            }}
            style={{ borderRadius: 16 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
