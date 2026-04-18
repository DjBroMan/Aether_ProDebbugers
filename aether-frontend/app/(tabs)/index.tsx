import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[TRACE] DashboardScreen mounted. User:', user?.role);
    const fetchData = async () => {
      console.log('[TRACE] Fetching data...');
      try {
        const [taskRes, eventRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/tasks`, { headers: { Authorization: `Bearer ${user?.token || 'DEV_TOKEN'}` } }),
          axios.get(`${API_BASE_URL}/api/schedule`, { headers: { Authorization: `Bearer ${user?.token || 'DEV_TOKEN'}` } })
        ]);
        setTasks(taskRes.data);
        setEvents(eventRes.data);
      } catch (err) {
        console.error('Data sync failed:', err);
      } finally {
        console.log('[TRACE] Setting loading to false');
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const upNext = events.find(e => new Date(e.startTime) > new Date()) || events[0];

  console.log('[TRACE] DashboardScreen rendering. loading:', loading, 'tasks:', activeTasks.length, 'upNext:', !!upNext);

  return (
    <ScrollView className="flex-1 bg-aether-bg p-6">
      <View className="mt-12 mb-8">
        <Text className="text-aether-muted text-lg tracking-wide uppercase font-semibold">
          {user?.role || 'STUDENT'} DASHBOARD
        </Text>
        <Text className="text-aether-text text-4xl font-bold mt-2">
          Hello, {user?.name?.split(' ')[0] || 'Aether'}
        </Text>
      </View>

      {/* Stats Cards */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 bg-aether-surface p-4 rounded-2xl border border-aether-border">
          <MaterialCommunityIcons name="calendar-clock" size={32} color="#38BDF8" />
          <Text className="text-aether-text font-bold text-2xl mt-4">
            {loading ? <ActivityIndicator size="small" color="#38BDF8" /> : events.length}
          </Text>
          <Text className="text-aether-muted font-medium">Classes Today</Text>
        </View>
        <View className="flex-1 bg-aether-surface p-4 rounded-2xl border border-aether-border">
          <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#F87171" />
          <Text className="text-aether-text font-bold text-2xl mt-4">
             {loading ? <ActivityIndicator size="small" color="#F87171" /> : activeTasks.length}
          </Text>
          <Text className="text-aether-muted font-medium">Pending Tasks</Text>
        </View>
      </View>

      {/* Upcoming Class */}
      <Text className="text-aether-text text-xl font-bold mb-4">Up Next</Text>
      {upNext ? (
        <View className="bg-aether-primary p-5 rounded-2xl mb-8">
          <View className="flex-row justify-between items-center bg-aether-secondary px-3 py-1 rounded-full self-start mb-4">
            <Text className="text-white font-bold text-xs uppercase tracking-wider">
               {new Date(upNext.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
          <Text className="text-white text-2xl font-bold">{upNext.title}</Text>
          <View className="flex-row items-center mt-2">
            <MaterialCommunityIcons name="map-marker" size={16} color="white" />
            <Text className="text-white ml-2 font-medium">{upNext.location}</Text>
          </View>
        </View>
      ) : (
        <View className="bg-aether-surface p-5 rounded-2xl border border-aether-border mb-8">
          <Text className="text-aether-muted italic">No upcoming classes fetched.</Text>
        </View>
      )}

      {/* Quick Actions */}
      <Text className="text-aether-text text-xl font-bold mb-4">Quick Actions</Text>
      <View className="flex-row flex-wrap gap-4 mb-12">
        <QuickAction icon="ticket-confirmation-outline" label="Issue Report" color="#FBBF24" onPress={() => router.push('/(tabs)/report')} />
        <QuickAction icon="cash-fast" label="Pay Fees" color="#34D399" onPress={() => router.push('/finance')} />
        {user?.role === 'ADMIN' && (
           <QuickAction icon="shield-check" label="Analytics" color="#818CF8" onPress={() => router.push('/(tabs)/admin')} />
        )}
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap, label: string, color: string, onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="w-[47%] bg-aether-surface p-4 rounded-xl flex-row items-center border border-aether-border">
      <View style={{ backgroundColor: `${color}20` }} className="p-3 rounded-full mr-3">
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text className="text-aether-text font-semibold flex-1">{label}</Text>
    </TouchableOpacity>
  );
}
