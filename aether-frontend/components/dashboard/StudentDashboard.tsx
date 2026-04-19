import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import {
  GradientCard, GradientIconCircle, QuickTile, GlassCard,
  WelcomeBar, SectionHeader,
} from '../ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';
import { ReportIssueModal } from '../ui/ReportIssueModal';
import { NotificationsModal } from '../ui/NotificationsModal';

const classes = [
  { time: '09:00', name: 'Calculus II', room: 'B-201' },
  { time: '10:30', name: 'Quantum Physics', room: 'A-104' },
  { time: '13:00', name: 'Lab — Circuits', room: 'Lab-3' },
];

export default function StudentDashboard() {
  const theme = { background: '#F8F5FF', card: '#FFFFFF', foreground: '#1E1040', muted: '#A394C0', border: '#E4DCF0', primary: '#7C3AED', accent: '#EDE6FA', secondary: '#F0ECF6', destructive: '#EF4444', inputBg: 'rgba(240,236,246,0.6)', foregroundSoft: '#6B5B8A' };
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const notifications = useCampusStore((s) => s.notifications);
  const notices = useCampusStore((s) => s.notices);
  const approvals = useCampusStore((s) => s.approvals);
  const displayName = user?.name ?? 'Student';
  const initial = displayName[0]?.toUpperCase() ?? 'S';
  const unread = notifications.some((n) => !n.read);

  const pendingCount = approvals.filter(a => a.status === 'Pending' || a.status === 'In Review').length;

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome bar with WORKING bell */}
      <WelcomeBar
        roleLabel="WELCOME"
        name={displayName}
        initial={initial}
        onBell={() => setNotifModalVisible(true)}
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
          <Text style={styles.heroSubtitle}>{classes.length} classes today · {pendingCount} pending tasks</Text>

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
              <Text style={styles.heroStatValue}>{pendingCount}</Text>
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
        <QuickTile icon="alert-outline" label="Report Issue" onPress={() => setReportModalVisible(true)} theme={theme} />
        <QuickTile icon="credit-card-outline" label="Pay Dues" onPress={() => router.push('/(tabs)/pay')} theme={theme} />
        <QuickTile icon="apps" label="Super App" onPress={() => router.push('/(tabs)/explore')} theme={theme} />
      </View>

      {/* Faculty Notices Banner */}
      {notices.length > 0 && (
        <GlassCard theme={theme} style={{ marginTop: 16 }}>
          <SectionHeader icon="bullhorn" title="Campus Notices" theme={theme} />
          {notices.slice(0, 3).map((n) => (
            <View key={n.id} style={[styles.noticeCard, { borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.foreground }}>{n.title}</Text>
                <Text style={{ fontSize: 9, fontWeight: '700', color: theme.primary, backgroundColor: theme.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>{n.audience}</Text>
              </View>
              <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }} numberOfLines={2}>{n.body}</Text>
              <Text style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>— {n.by}</Text>
            </View>
          ))}
        </GlassCard>
      )}

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
        </View>
      </GlassCard>

      {/* Today's schedule */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="calendar" title="Today" trailing={{ text: 'Week →', onPress: () => router.push('/(tabs)/schedule') }} theme={theme} />
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
            <Text style={{ fontSize: 12, color: theme.muted }}>"How do I apply for leave?"</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={theme.muted} />
        </TouchableOpacity>
      </GlassCard>

      {/* Recent notifications (from live store) */}
      <GlassCard theme={theme} style={{ marginTop: 16, marginBottom: 20 }}>
        <SectionHeader title="Recent Activity" trailing={{ text: 'All →', onPress: () => setNotifModalVisible(true) }} theme={theme} />
        {notifications.length > 0 ? (
          notifications.slice(0, 4).map((n) => (
            <View key={n.id} style={[styles.notifItem, { marginBottom: 12 }]}>
              <View style={[styles.notifIcon, { backgroundColor: theme.accent }]}>
                <MaterialCommunityIcons name={n.kind === 'approval' ? 'check-decagram' : n.kind === 'ticket' ? 'wrench' : 'bell-outline'} size={16} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: n.read ? '500' : '700', color: theme.foreground }} numberOfLines={1}>{n.title}</Text>
                <Text style={{ fontSize: 11, color: theme.muted }} numberOfLines={1}>{n.body}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ paddingVertical: 16, gap: 8 }}>
            {[
              { icon: 'bell-outline', text: 'Assignment due tomorrow', sub: '2h ago' },
              { icon: 'clock-outline', text: 'Leave request approved', sub: '5h ago' },
              { icon: 'alert-outline', text: 'Lab venue changed → Lab-3', sub: '1d ago' },
            ].map((n) => (
              <View key={n.text} style={[styles.notifItem]}>
                <View style={[styles.notifIcon, { backgroundColor: theme.accent }]}>
                  <MaterialCommunityIcons name={n.icon as any} size={16} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{n.text}</Text>
                  <Text style={{ fontSize: 11, color: theme.muted }}>{n.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      <ReportIssueModal visible={reportModalVisible} onClose={() => setReportModalVisible(false)} />
      <NotificationsModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />
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
  noticeCard: { borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, backgroundColor: 'rgba(124,58,237,0.04)' },
});
