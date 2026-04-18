import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-aether-bg">
      <View className="pt-20 pb-10 px-6 items-center flex-1">
        
        {/* Mock Avatar or real */}
        <View className="relative mb-6">
          {user?.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              className="w-32 h-32 rounded-full border-4 border-aether-primary"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-aether-surface border-4 border-aether-primary items-center justify-center shadow-lg shadow-aether-primary/20">
              <MaterialCommunityIcons name="account" size={64} color="#38BDF8" />
            </View>
          )}
          <View className="absolute bottom-0 right-0 bg-aether-accent w-8 h-8 rounded-full border-4 border-aether-bg items-center justify-center">
             <MaterialCommunityIcons name="check" size={12} color="#0F172A" />
          </View>
        </View>

        <Text className="text-aether-text text-3xl font-bold mb-1">{user?.name || 'Aether Engineer'}</Text>
        <Text className="text-aether-primary font-semibold uppercase tracking-widest">{user?.role || 'Developer Mode'}</Text>
        
        <View className="w-full mt-12 bg-aether-surface rounded-3xl p-6 border border-aether-border shadow-md">
          
          <SettingItem icon="bell-ring-outline" title="Notifications" value="Enabled" />
          <View className="h-[1px] bg-aether-border my-4" />
          <SettingItem icon="security" title="Privacy Settings" value="Strict" />
          <View className="h-[1px] bg-aether-border my-4" />
          <SettingItem icon="cog-outline" title="App Preferences" value="Dark Mode" />

        </View>

        <TouchableOpacity 
          className="mt-auto w-full bg-aether-surface border border-aether-danger p-5 rounded-2xl flex-row justify-center items-center mb-6"
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout-variant" size={24} color="#F87171" />
          <Text className="text-aether-danger ml-3 font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SettingItem({ icon, title, value }: { icon: any, title: string, value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <View className="bg-aether-bg p-2 rounded-lg border border-aether-border">
          <MaterialCommunityIcons name={icon} size={24} color="#94A3B8" />
        </View>
        <Text className="text-aether-text text-lg font-medium">{title}</Text>
      </View>
      <Text className="text-aether-muted">{value}</Text>
    </View>
  );
}
