import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore, type UserRole } from '../store/authStore';
import { GRADIENT, SHADOWS, RADIUS, FONT, useTheme } from '../constants/designTokens';
import { GradientButton, GradientIconCircle, RolePill, StatBadge } from '../components/ui/AetherUI';

const { width } = Dimensions.get('window');

type DemoRole = 'Student' | 'Faculty' | 'Admin';
const DEMO_ROLES: { key: DemoRole; icon: string }[] = [
  { key: 'Student', icon: 'school' },
  { key: 'Faculty', icon: 'book-open-page-variant' },
  { key: 'Admin', icon: 'shield-check' },
];

export default function LandingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [role, setRole] = useState<DemoRole>('Student');
  const [userId, setUserId] = useState('priyank.s');
  const [password, setPassword] = useState('aether');
  const [showPw, setShowPw] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = () => {
    if (!userId || !password) return;
    const roleMap: Record<DemoRole, UserRole> = {
      Student: 'STUDENT',
      Faculty: 'FACULTY',
      Admin: 'ADMIN',
    };
    const authorityMap: Record<DemoRole, number | undefined> = {
      Student: undefined,
      Faculty: 1,
      Admin: undefined,
    };
    setUser({
      id: `demo-${role.toLowerCase()}`,
      name: role === 'Student' ? 'Demo Student' : role === 'Faculty' ? 'Prof. Demo' : 'Admin User',
      email: `${userId}@aether.edu`,
      role: roleMap[role],
      authorityLevel: authorityMap[role],
      token: 'demo-token',
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo & tagline */}
        <View style={styles.logoArea}>
          <LinearGradient
            colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.logoIcon}
          >
            <MaterialCommunityIcons name="shield-check" size={32} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.brand, { color: theme.primary }]}>A E T H E R</Text>
          <Text style={[styles.tagline, { color: theme.muted }]}>YOUR CAMPUS. ONE INTERFACE.</Text>
        </View>

        {/* Sign-in card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 12 }]}>SIGN IN AS</Text>

          {/* Role pills */}
          <View style={styles.roleRow}>
            {DEMO_ROLES.map(({ key, icon }) => (
              <RolePill
                key={key}
                label={key}
                icon={icon}
                active={role === key}
                onPress={() => setRole(key)}
                theme={theme}
              />
            ))}
          </View>

          {/* ID field */}
          <View style={styles.fieldGroup}>
            <Text style={[FONT.tiny, { color: theme.muted }]}>ID</Text>
            <TextInput
              value={userId}
              onChangeText={setUserId}
              style={[styles.input, { color: theme.foreground, borderBottomColor: theme.border }]}
              placeholderTextColor={theme.muted}
              autoCapitalize="none"
            />
          </View>

          {/* Password field */}
          <View style={styles.fieldGroup}>
            <Text style={[FONT.tiny, { color: theme.muted }]}>PASSWORD</Text>
            <View style={[styles.pwRow, { borderBottomColor: theme.border }]}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                style={[styles.pwInput, { color: theme.foreground }]}
                placeholderTextColor={theme.muted}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <MaterialCommunityIcons name={showPw ? 'eye-off' : 'eye'} size={18} color={theme.muted} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>Forgot Credentials?</Text>
          </TouchableOpacity>
        </View>

        {/* Slogan */}
        <Text style={[styles.sloganSub, { color: theme.primary }]}>
          SIMPLIFY YOUR ACADEMIC JOURNEY THROUGH
        </Text>
        <Text style={[styles.sloganMain, { color: theme.foreground }]}>Atmospheric Precision</Text>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <StatBadge value="10M+" label="ATTENDANCE" theme={theme} />
          <StatBadge value="1M+" label="APPROVALS" theme={theme} />
          <StatBadge value="10y" label="EXCELLENCE" theme={theme} />
        </View>

        {/* Feature tiles */}
        <View style={styles.tilesGrid}>
          {[
            { icon: 'calendar-month', label: 'Smart Schedule' },
            { icon: 'robot', label: 'AI Copilot' },
            { icon: 'check-circle-outline', label: 'Approvals' },
            { icon: 'alert-outline', label: 'Issues' },
            { icon: 'bell-outline', label: 'Alerts' },
            { icon: 'shield-check', label: 'Roles' },
          ].map((t) => (
            <View key={t.label} style={[styles.tile, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <GradientIconCircle icon={t.icon} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: theme.foregroundSoft, marginTop: 6 }}>{t.label}</Text>
            </View>
          ))}
        </View>

        {/* GET STARTED */}
        <GradientButton label="GET STARTED" onPress={handleLogin} icon="arrow-right" style={{ marginTop: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 40 },
  logoArea: { alignItems: 'center', marginBottom: 20 },
  logoIcon: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow, marginBottom: 12 },
  brand: { fontSize: 32, fontWeight: '800', letterSpacing: 12 },
  tagline: { fontSize: 10, fontWeight: '700', letterSpacing: 4, marginTop: 4 },
  card: { borderRadius: RADIUS['3xl'], padding: 20, borderWidth: 1, ...SHADOWS.card, marginTop: 16 },
  roleRow: { flexDirection: 'row', gap: 8 },
  fieldGroup: { marginTop: 20 },
  input: { borderBottomWidth: 1, paddingVertical: 8, fontSize: 14, fontWeight: '500' },
  pwRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  pwInput: { flex: 1, paddingVertical: 8, fontSize: 14, fontWeight: '500' },
  forgotRow: { marginTop: 12, alignItems: 'flex-end' },
  sloganSub: { textAlign: 'center', fontSize: 11, letterSpacing: 3, fontWeight: '600', marginTop: 24 },
  sloganMain: { textAlign: 'center', fontSize: 18, fontWeight: '700', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  tile: {
    width: (width - 60) / 3 - 2,
    borderRadius: RADIUS.xl,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    ...SHADOWS.soft,
  },
});
