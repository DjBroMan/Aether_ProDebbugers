import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../constants/designTokens';
import { GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import {
  GradientCard, GradientIconCircle, QuickTile, GlassCard,
  WelcomeBar, SectionHeader,
} from '../ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';

const classes = [
  { time: '09:00', name: 'Calculus II', room: 'B-201' },
  { time: '10:30', name: 'Quantum Physics', room: 'A-104' },
  { time: '13:00', name: 'Lab — Circuits', room: 'Lab-3' },
];

export default function StudentDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const notifications = useCampusStore((s) => s.notifications);
  const displayName = user?.name ?? 'Student';
  const initial = displayName[0]?.toUpperCase() ?? 'S';
  const unread = notifications.some((n) => !n.read);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome bar */}
      <WelcomeBar
        roleLabel="WELCOME"
        name={displayName}
        initial={initial}
        onBell={() => {}}
        onLogout={logout}
        theme={theme}
        unread={unread}
      />

      {/* Hero greeting card */}
      <GradientCard style={{ marginTop: 16 }}>
        <View style={{ position: 'relative', zIndex: 1 }}>
          <Text style={styles.heroLabel}>B.TECH FY-A</Text>
          <Text style={styles.heroTitle}>
            Good morning,{' '}
            <Text style={{ textDecorationLine: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)' }}>
              {displayName.split(' ')[0]}
            </Text>
          </Text>
          <Text style={styles.heroSubtitle}>4 classes today · 2 pending tasks</Text>

          {/* Stats row */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#FFF" />
              <Text style={styles.heroStatLabel}>NEXT</Text>
              <Text style={styles.heroStatValue}>10:30</Text>
            </View>
            <View style={styles.heroStat}>
              <MaterialCommunityIcons name="format-list-checks" size={16} color="#FFF" />
              <Text style={styles.heroStatLabel}>TASKS</Text>
              <Text style={styles.heroStatValue}>2</Text>
            </View>
            <View style={styles.heroStat}>
              <MaterialCommunityIcons name="wallet-outline" size={16} color="#FFF" />
              <Text style={styles.heroStatLabel}>DUES</Text>
              <Text style={styles.heroStatValue}>₹1,250</Text>
            </View>
          </View>
        </View>
      </GradientCard>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        <QuickTile icon="file-document-outline" label="Approvals" onPress={() => router.push('/(tabs)/approvals')} theme={theme} />
        <QuickTile icon="alert-outline" label="Issues" onPress={() => router.push('/(tabs)/report')} theme={theme} />
        <QuickTile icon="credit-card-outline" label="Pay Dues" onPress={() => {}} theme={theme} />
        <QuickTile icon="apps" label="Super App" onPress={() => router.push('/(tabs)/explore')} theme={theme} />
      </View>

      {/* Next class card */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <Text style={[FONT.tiny, { color: theme.primary }]}>NEXT CLASS</Text>
        <View style={styles.nextClassRow}>
          <GradientIconCircle icon="clock-outline" size={48} iconSize={22} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: theme.foreground }}>Quantum Physics · 10:30</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <MaterialCommunityIcons name="map-marker-outline" size={12} color={theme.muted} />
              <Text style={{ fontSize: 12, color: theme.muted }}>A-104</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={theme.muted} />
        </View>
      </GlassCard>

      {/* Today's schedule */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="calendar" title="Today" trailing={{ text: 'Week →', onPress: () => {} }} theme={theme} />
        <View style={{ gap: 8 }}>
          {classes.map((c) => (
            <View key={c.time} style={[styles.classItem, { backgroundColor: theme.secondary }]}>
              <GradientIconCircle icon="clock-outline" size={44} iconSize={18} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.foreground }}>{c.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <MaterialCommunityIcons name="map-marker-outline" size={12} color={theme.muted} />
                  <Text style={{ fontSize: 11, color: theme.muted }}>{c.room} · {c.time}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={theme.muted} />
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Copilot CTA */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/ai')} style={styles.copilotRow} activeOpacity={0.8}>
          <GradientIconCircle icon="creation" size={44} iconSize={22} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.foreground }}>Ask Campus Copilot</Text>
            <Text style={{ fontSize: 12, color: theme.muted }}>"What's my schedule today?"</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={theme.muted} />
        </TouchableOpacity>
      </GlassCard>

      {/* Recent notifications */}
      <GlassCard theme={theme} style={{ marginTop: 16, marginBottom: 20 }}>
        <SectionHeader title="Recent" trailing={{ text: 'All →', onPress: () => {} }} theme={theme} />
        {[
          { icon: 'bell-outline', text: 'Assignment due tomorrow', sub: '2h ago' },
          { icon: 'clock-outline', text: 'Leave request approved', sub: '5h ago' },
          { icon: 'alert-outline', text: 'Lab venue → Lab-3', sub: '1d ago' },
        ].map((n) => (
          <View key={n.text} style={[styles.notifItem, { marginBottom: 12 }]}>
            <View style={[styles.notifIcon, { backgroundColor: theme.accent }]}>
              <MaterialCommunityIcons name={n.icon as any} size={16} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{n.text}</Text>
              <Text style={{ fontSize: 11, color: theme.muted }}>{n.sub}</Text>
            </View>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  heroLabel: { fontSize: 10, letterSpacing: 3, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 4 },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroStatsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  heroStat: {
    flex: 1, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroStatLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  heroStatValue: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  nextClassRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  classItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 10 },
  copilotRow: { flexDirection: 'row', alignItems: 'center' },
  notifItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
