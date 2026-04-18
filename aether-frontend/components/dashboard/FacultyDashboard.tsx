import { View, Text, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import ApprovalList from './ApprovalList';
import NoticeBoard from './NoticeBoard';
import AnalyticsWidget from './AnalyticsWidget';

export default function FacultyDashboard({ authorityLevel }: { authorityLevel?: number }) {
  const { user } = useAuthStore();
  const level = authorityLevel || 1;

  return (
    <ScrollView className="flex-1 bg-aether-bg p-6">
      <View className="mt-12 mb-8">
        <Text className="text-aether-muted text-lg tracking-wide uppercase font-semibold">
          {level === 1 ? 'TEACHER' : level === 2 ? 'HOD' : 'PRINCIPAL'} DASHBOARD
        </Text>
        <Text className="text-aether-text text-4xl font-bold mt-2">
          Welcome, {user?.name?.split(' ')[0] || 'Faculty'}
        </Text>
      </View>

      {/* Level 3: Principal gets Campus Analytics */}
      {level === 3 && (
        <View className="mb-8">
          <Text className="text-aether-text text-xl font-bold mb-4">Campus Overview</Text>
          <AnalyticsWidget title="Campus Health" type="campus" />
        </View>
      )}

      {/* Level 2: HOD gets Department Analytics */}
      {level === 2 && (
        <View className="mb-8">
          <Text className="text-aether-text text-xl font-bold mb-4">Department Overview</Text>
          <AnalyticsWidget title="Department Health" type="department" />
        </View>
      )}

      {/* All Faculty: Notice Board */}
      <View className="mb-8">
        <Text className="text-aether-text text-xl font-bold mb-4">Recent Notices</Text>
        <NoticeBoard />
      </View>

      {/* All Faculty: Approvals (Filtered by Level) */}
      <View className="mb-12">
        <Text className="text-aether-text text-xl font-bold mb-4">Pending Approvals</Text>
        <ApprovalList level={level} />
      </View>
    </ScrollView>
  );
}
