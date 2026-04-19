import { View, Text } from 'react-native';

/**
 * Hidden tab screen — Admin features are rendered via the role-based
 * dashboard at (tabs)/index.tsx → AdminDashboardComponent.
 * This file exists only to satisfy Expo Router's file-based routing.
 */
export default function AdminPlaceholder() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F5FF', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#A394C0', fontSize: 14 }}>Admin dashboard loaded from Home tab</Text>
    </View>
  );
}
