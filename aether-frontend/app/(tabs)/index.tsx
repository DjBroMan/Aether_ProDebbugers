import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import StudentDashboard from '../../components/dashboard/StudentDashboard';
import FacultyDashboard from '../../components/dashboard/FacultyDashboard';
import AdminDashboard from '../../components/dashboard/AdminDashboardComponent';
import { useTheme } from '../../constants/designTokens';

export default function DashboardTab() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  switch (user.role) {
    case 'FACULTY':
      return <FacultyDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <StudentDashboard />;
  }
}
