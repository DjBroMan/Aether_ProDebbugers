import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = () => {
    if (isSigningOut) return;
    console.log('[AUTH] handleLogout called. Calling logout()...');
    setIsSigningOut(true);
    // The (tabs) layout's useEffect sees the null user and navigates back to login.
    logout();
    console.log('[AUTH] logout() called. user should now be null.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>

        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <MaterialCommunityIcons name="account" size={64} color="#38BDF8" />
            </View>
          )}
          <View style={styles.badgeDot}>
            <MaterialCommunityIcons name="check" size={12} color="#0F172A" />
          </View>
        </View>

        <Text style={styles.name}>{user?.name || 'Aether User'}</Text>
        <Text style={styles.role}>
          {user?.role === 'FACULTY'
            ? `Faculty (Level ${user.authorityLevel ?? 1})`
            : user?.role ?? 'Unknown'}
        </Text>

        {/* Settings card */}
        <View style={styles.settingsCard}>
          <SettingItem icon="bell-ring-outline" title="Notifications" value="Enabled" />
          <View style={styles.divider} />
          <SettingItem icon="security" title="Privacy Settings" value="Strict" />
          <View style={styles.divider} />
          <SettingItem icon="cog-outline" title="App Preferences" value="Dark Mode" />
        </View>

        {/* Logout button */}
        <TouchableOpacity
          style={[styles.logoutBtn, isSigningOut && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          disabled={isSigningOut}
          activeOpacity={0.7}
        >
          {isSigningOut ? (
            <Text style={styles.logoutText}>Signing out…</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="logout-variant" size={24} color="#F87171" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SettingItem({ icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={24} color="#94A3B8" />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  inner: { flex: 1, paddingTop: 80, paddingHorizontal: 24, alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: 24 },
  avatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: '#38BDF8' },
  avatarFallback: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: '#1E293B', borderWidth: 4, borderColor: '#38BDF8',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#34D399', borderWidth: 4, borderColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 28, fontWeight: 'bold', color: '#F1F5F9', marginBottom: 4 },
  role: { fontSize: 13, fontWeight: '700', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 40 },
  settingsCard: {
    width: '100%', backgroundColor: '#1E293B',
    borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#334155',
  },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { backgroundColor: '#0F172A', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
  settingTitle: { fontSize: 16, color: '#F1F5F9', fontWeight: '500' },
  settingValue: { fontSize: 14, color: '#64748B' },
  logoutBtn: {
    marginTop: 'auto', width: '100%',
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#F87171',
    padding: 20, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 12, marginBottom: 40,
  },
  logoutBtnDisabled: { borderColor: '#475569' },
  logoutText: { color: '#F87171', fontWeight: 'bold', fontSize: 17 },
});
