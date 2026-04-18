import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import {
  GradientCard, GradientIconCircle, QuickTile, GlassCard,
  WelcomeBar, SectionHeader, RolePill, GradientButton,
} from '../ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore, analyticsSummary } from '../../store/campusStore';

const systemStats = [
  { k: 'Students', v: '2,418', icon: 'school' },
  { k: 'Faculty', v: '184', icon: 'book-open-page-variant' },
  { k: 'Active', v: '1.2k', icon: 'pulse' },
];

export default function AdminDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const store = useCampusStore();
  const notifications = store.notifications;
  const tickets = store.tickets;
  const summary = analyticsSummary(store);
  const displayName = user?.name ?? 'Admin';

  const ticketsByLoc = new Map<string, number>();
  tickets.forEach((t) => ticketsByLoc.set(t.location, (ticketsByLoc.get(t.location) ?? 0) + 1));
  const heat = Array.from(ticketsByLoc.entries()).sort((a, b) => b[1] - a[1]);

  const facPerms = [
    { name: 'M. Rao', role: 'CSE', on: true },
    { name: 'S. Khanna', role: 'ECE', on: true },
    { name: 'P. Verma', role: 'MECH', on: false },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Welcome */}
      <WelcomeBar roleLabel="ADMINISTRATOR" name={displayName} initial={displayName[0]} onBell={() => {}} onLogout={logout} theme={theme}
        unread={notifications.some((n) => !n.read)} />

      {/* Hero */}
      <GradientCard style={{ marginTop: 16 }}>
        <View style={{ zIndex: 1 }}>
          <Text style={{ fontSize: 10, letterSpacing: 3, fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>CONTROL CENTER</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 4 }}>System Overview</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>All nodes synced · 99.98% uptime</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            {systemStats.map((s) => (
              <View key={s.k} style={sty.heroStat}>
                <MaterialCommunityIcons name={s.icon as any} size={16} color="#FFF" />
                <Text style={{ fontSize: 10, letterSpacing: 2, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{s.k.toUpperCase()}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>{s.v}</Text>
              </View>
            ))}
          </View>
        </View>
      </GradientCard>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <QuickTile icon="chart-bar" label="Analytics" onPress={() => {}} theme={theme} />
        <QuickTile icon="shield-check" label="Approvals" onPress={() => router.push('/(tabs)/approvals')} theme={theme} />
        <QuickTile icon="alert-outline" label="Issues" onPress={() => router.push('/(tabs)/report')} theme={theme} />
        <QuickTile icon="apps" label="Apps" onPress={() => router.push('/(tabs)/explore')} theme={theme} />
      </View>

      {/* Live Operations */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="pulse" title="Live Operations" trailing={{ text: 'Detailed →', onPress: () => {} }} theme={theme} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {[
            { k: 'PENDING', v: summary.pending },
            { k: 'OPEN TICKETS', v: summary.openTickets },
            { k: 'HIGH-PRI', v: summary.highPri },
          ].map((s) => (
            <View key={s.k} style={[sty.kpiCard, { backgroundColor: theme.secondary }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.primary }}>{s.v}</Text>
              <Text style={{ fontSize: 9, letterSpacing: 2, fontWeight: '700', color: theme.muted }}>{s.k}</Text>
            </View>
          ))}
        </View>
        {/* Progress bars */}
        {[
          { name: 'Approvals', val: Math.min(100, summary.approved * 12 + 40), tag: summary.pending > 5 ? 'Backlog' : 'OK' },
          { name: 'Tickets', val: Math.max(20, 100 - summary.openTickets * 12), tag: summary.highPri > 0 ? 'Hot' : 'OK' },
          { name: 'Payments', val: Math.min(100, summary.totalPaid / 50), tag: 'OK' },
        ].map((b) => (
          <View key={b.name} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.foreground }}>{b.name}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: b.tag === 'Backlog' ? GRADIENT.end : b.tag === 'Hot' ? theme.destructive : theme.primary }}>{b.tag}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: theme.secondary, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${b.val}%`, backgroundColor: theme.primary, borderRadius: 3 }} />
            </View>
          </View>
        ))}
      </GlassCard>

      {/* Faculty Permissions */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="lock-outline" title="Faculty Permissions" trailing={{ text: 'Edit →', onPress: () => {} }} theme={theme} />
        <View style={{ gap: 8 }}>
          {facPerms.map((f) => (
            <View key={f.name} style={[sty.permItem, { backgroundColor: theme.secondary }]}>
              <GradientIconCircle icon="account" size={36} iconSize={16} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{f.name}</Text>
                <Text style={{ fontSize: 11, color: theme.muted }}>{f.role} · Approvals & Notify</Text>
              </View>
              <Text style={{
                fontSize: 10, letterSpacing: 2, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
                color: f.on ? theme.primary : theme.destructive,
                backgroundColor: f.on ? theme.accent : 'rgba(239,68,68,0.1)',
              }}>{f.on ? 'ACTIVE' : 'RESTRICTED'}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* System Activity */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader title="System Activity" trailing={{ text: 'All →', onPress: () => {} }} theme={theme} />
        {notifications.slice(0, 4).map((a) => (
          <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="bell-outline" size={16} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }} numberOfLines={1}>{a.title}</Text>
              <Text style={{ fontSize: 11, color: theme.muted }} numberOfLines={1}>{a.body}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={theme.muted} />
          </View>
        ))}
      </GlassCard>

      {/* Support Heatmap */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="fire" title="Support Heatmap" theme={theme} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const intensity = [0.1, 0.25, 0.4, 0.6, 0.8, 1][Math.floor(Math.abs(Math.sin(i * 1.7 + tickets.length)) * 6)];
            return (
              <View key={i} style={{ width: '13%', aspectRatio: 1, borderRadius: 6, backgroundColor: theme.primary, opacity: intensity }} />
            );
          })}
        </View>
        {heat.slice(0, 3).map(([loc, count]) => (
          <View key={loc} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="fire" size={12} color={GRADIENT.end} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.foreground }}>{loc}</Text>
            </View>
            <Text style={{ fontSize: 12, color: theme.muted }}>{count} reports</Text>
          </View>
        ))}
      </GlassCard>

      {/* Create Account */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="account-plus" title="Create Account" theme={theme} />
        <TextInput placeholder="Full name" placeholderTextColor={theme.muted}
          style={{ backgroundColor: theme.inputBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: theme.foreground, marginBottom: 8 }} />
        <TextInput placeholder="Email / ID" placeholderTextColor={theme.muted}
          style={{ backgroundColor: theme.inputBg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: theme.foreground, marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {(['Student', 'Faculty', 'Admin'] as const).map((r) => (
            <TouchableOpacity key={r} style={{ flex: 1, backgroundColor: theme.secondary, borderRadius: 12, paddingVertical: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <GradientButton label="PROVISION IN DB" onPress={() => {}} icon="check-circle" />
      </GlassCard>

      {/* Bottleneck alert */}
      {summary.bottleneck && (
        <GradientCard style={{ marginTop: 16, marginBottom: 20 }}>
          <View style={{ zIndex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFF" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>Decision Intelligence</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                Bottleneck detected at "{summary.bottleneck.stage}" with {summary.bottleneck.count} pending requests.
              </Text>
            </View>
          </View>
        </GradientCard>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const sty = StyleSheet.create({
  heroStat: { flex: 1, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  kpiCard: { flex: 1, borderRadius: 16, padding: 10, alignItems: 'center' },
  permItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 10 },
});
