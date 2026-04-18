import { View, Text } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import StudentDashboard from '../../components/dashboard/StudentDashboard';
import FacultyDashboard from '../../components/dashboard/FacultyDashboard';
import AdminDashboardComponent from '../../components/dashboard/AdminDashboardComponent';

export default function DashboardWrapper() {
  const { user } = useAuthStore();

  if (!user) {
    // Invisible — root layout's useEffect will redirect to '/' momentarily
    return null;
  }

  if (user.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  if (user.role === 'FACULTY') {
    return <FacultyDashboard authorityLevel={user.authorityLevel} />;
  }

  if (user.role === 'ADMIN') {
    return <AdminDashboardComponent />;
  }

  // Fallback
  return (
    <View className="flex-1 bg-aether-bg justify-center items-center">
      <Text className="text-aether-text">Unknown Role: {user.role}</Text>
    </View>
  );
}
