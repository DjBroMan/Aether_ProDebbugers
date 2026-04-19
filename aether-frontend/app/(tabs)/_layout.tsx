import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';
import { useEffect } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';

export default function TabLayout() {
  const { user } = useAuthStore();
  const navigation = useNavigation();

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 1,
          borderTopColor: '#E4DCF0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          elevation: 0,
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#A394C0',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? s.activeIconBg : undefined}>
              <MaterialCommunityIcons name="view-dashboard-outline" size={focused ? 24 : 22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? s.activeIconBg : undefined}>
              <MaterialCommunityIcons name="calendar-month" size={focused ? 24 : 22} color={color} />
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
                colors={['#5B7FFF', '#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.centerOrb}
              >
                <MaterialCommunityIcons name="robot-outline" size={28} color="#FFF" />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Issues',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? s.activeIconBg : undefined}>
              <MaterialCommunityIcons name="alert-circle-outline" size={focused ? 24 : 22} color={color} />
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
              <MaterialCommunityIcons name="account-circle-outline" size={focused ? 24 : 22} color={color} />
            </View>
          ),
        }}
      />
      {/* Hidden screens — accessible via router.push */}
      <Tabs.Screen name="admin" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="approvals" options={{ href: null }} />
      <Tabs.Screen name="pay" options={{ href: null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  activeIconBg: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 16,
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
    borderWidth: 4,
    borderColor: '#F8F5FF'
  },
});
