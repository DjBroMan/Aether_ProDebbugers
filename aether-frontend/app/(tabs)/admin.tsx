import { View, Text } from 'react-native';
import { useTheme } from '../../constants/designTokens';

/**
 * Hidden tab screen — Admin features are rendered via the role-based
 * dashboard at (tabs)/index.tsx → AdminDashboardComponent.
 * This file exists only to satisfy Expo Router's file-based routing.
 */
export default function AdminPlaceholder() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.muted, fontSize: 14 }}>Admin dashboard loaded from Home tab</Text>
    </View>
  );
}
