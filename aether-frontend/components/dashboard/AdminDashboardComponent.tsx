import { View, Text, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import AnalyticsWidget from './AnalyticsWidget';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminDashboardComponent() {
  const { user } = useAuthStore();

  return (
    <ScrollView className="flex-1 bg-aether-bg p-6">
      <View className="mt-12 mb-8">
        <Text className="text-aether-muted text-lg tracking-wide uppercase font-semibold">
          SYSTEM ADMIN DASHBOARD
        </Text>
        <Text className="text-aether-text text-4xl font-bold mt-2">
          Root Access
        </Text>
      </View>

      <View className="mb-8">
        <Text className="text-aether-text text-xl font-bold mb-4">Infrastructure</Text>
        <AnalyticsWidget title="Server Health" type="campus" />
      </View>

      <View className="mb-8">
        <Text className="text-aether-text text-xl font-bold mb-4">Quick Links</Text>
        <View className="flex-row flex-wrap gap-4">
            <View className="w-[47%] bg-aether-surface p-4 rounded-xl border border-aether-border items-center">
                <MaterialCommunityIcons name="account-group" size={32} color="#38BDF8" />
                <Text className="text-aether-text font-bold mt-2">Manage Users</Text>
            </View>
            <View className="w-[47%] bg-aether-surface p-4 rounded-xl border border-aether-border items-center">
                <MaterialCommunityIcons name="database" size={32} color="#FBBF24" />
                <Text className="text-aether-text font-bold mt-2">Database Config</Text>
            </View>
        </View>
      </View>
    </ScrollView>
  );
}
