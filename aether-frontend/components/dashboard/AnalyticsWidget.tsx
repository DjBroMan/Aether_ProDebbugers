import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnalyticsWidget({ title, type }: { title: string, type: 'department' | 'campus' }) {
  const stats = type === 'department' ? [
    { label: 'Attendance', value: '87%', icon: 'account-check', color: '#34D399' },
    { label: 'Pending Leaves', value: '14', icon: 'clock-outline', color: '#FBBF24' },
  ] : [
    { label: 'Active Users', value: '1,204', icon: 'account-group', color: '#38BDF8' },
    { label: 'Server Load', value: '42%', icon: 'server-network', color: '#818CF8' },
  ];

  return (
    <View className="bg-aether-surface p-4 rounded-2xl border border-aether-border">
      <Text className="text-aether-muted font-bold uppercase tracking-wider mb-4">{title}</Text>
      <View className="flex-row gap-4">
        {stats.map((stat, i) => (
          <View key={i} className="flex-1 bg-aether-bg p-3 rounded-xl border border-aether-border items-center">
            <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
            <Text className="text-aether-text font-bold text-xl mt-2">{stat.value}</Text>
            <Text className="text-aether-muted text-xs mt-1">{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
