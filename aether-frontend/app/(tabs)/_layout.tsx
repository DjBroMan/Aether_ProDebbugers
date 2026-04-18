import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';
import { useEffect } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { GRADIENT, useTheme, ThemeProvider } from '../../constants/designTokens';
import { ToastNotification } from '../../components/ui/ToastNotification';

export default function TabLayout() {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const theme = useTheme();

  // Auth guard & Real-time init
  useEffect(() => {
    if (!user) {
      useCampusStore.getState().stopRealTimeSync();
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'index' }] })
      );
    } else {
      useCampusStore.getState().initRealTimeSync(user.role, user.id);
      useCampusStore.getState().fetchDashboardData(user.token, user.role);
    }
  }, [user]);

  return (
    <>
      <ToastNotification />
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          paddingBottom: 8,
          paddingTop: 4,
          height: 64,
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? s.activeIconBg : undefined}>
              <MaterialCommunityIcons name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? s.activeIconBg : undefined}>
              <MaterialCommunityIcons name="calendar-month" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Copilot',
          tabBarIcon: ({ focused }) => (
            <View style={s.centerTab}>
              <LinearGradient
                colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.centerOrb}
              >
                <MaterialCommunityIcons name="creation" size={28} color="#FFF" />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? s.activeIconBg : undefined}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? s.activeIconBg : undefined}>
              <MaterialCommunityIcons name="account" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
    </>
  );
}

const s = StyleSheet.create({
  activeIconBg: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 12,
    padding: 6,
  },
  centerTab: {
    marginTop: -28,
  },
  centerOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
