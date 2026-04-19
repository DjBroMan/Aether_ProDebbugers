import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Modal, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import {
  GradientCard, GradientIconCircle, QuickTile, GlassCard,
  WelcomeBar, SectionHeader, RolePill, GradientButton,
} from '../ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore, analyticsSummary } from '../../store/campusStore';
import { NotificationsModal } from '../ui/NotificationsModal';

export default function AdminDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const store = useCampusStore();
  const notifications = store.notifications;
  const tickets = store.tickets;
  const approvals = store.approvals;
  const summary = analyticsSummary(store);
  const displayName = user?.name ?? 'Admin';

  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [drillDown, setDrillDown] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Compute real metrics
  const totalRequests = approvals.length;
  const pendingRequests = approvals.filter(a => a.status === 'Pending' || a.status === 'In Review').length;
  const approvedRequests = approvals.filter(a => a.status === 'Approved').length;
  const openIssues = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'RESOLVED').length;

  // Drill-down: HOD breakdown
  const hodBreakdown = () => {
    const map: Record<string, number> = {};
    approvals.filter(a => a.status !== 'Approved' && a.status !== 'Rejected').forEach(a => {
      const cur = a.chain.find(c => c.status === 'current');
      if (cur) map[cur.label] = (map[cur.label] || 0) + 1;
    });
    return Object.entries(map);
  };

  // Issue grouping by location
  const ticketsByLoc = new Map<string, number>();
  tickets.forEach((t) => ticketsByLoc.set(t.location, (ticketsByLoc.get(t.location) ?? 0) + 1));
  const heat = Array.from(ticketsByLoc.entries()).sort((a, b) => b[1] - a[1]);

  // Issue grouping by category
  const itIssues = tickets.filter(t => t.category === 'IT').length;
  const maintIssues = tickets.filter(t => t.category === 'Maintenance').length;
  const facIssues = tickets.filter(t => t.category === 'Facilities').length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Welcome */}
      <WelcomeBar roleLabel="ADMINISTRATOR" name={displayName} initial={displayName[0]} onBell={() => setNotifModalVisible(true)} onLogout={logout} theme={theme}
        unread={notifications.some((n) => !n.read)} />

      {/* Hero */}
      <GradientCard style={{ marginTop: 16 }}>
        <View style={{ zIndex: 1 }}>
          <Text style={{ fontSize: 10, letterSpacing: 3, fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>CONTROL CENTER</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 4 }}>System Overview</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>All nodes synced · 99.98% uptime</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            {[
              { k: 'Students', v: '2,418', icon: 'school' },
              { k: 'Faculty', v: '184', icon: 'book-open-page-variant' },
              { k: 'Active', v: '1.2k', icon: 'pulse' },
            ].map((s) => (
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
        <QuickTile icon="chart-bar" label="Analytics" onPress={() => setDrillDown(drillDown === 'analytics' ? null : 'analytics')} theme={theme} />
        <QuickTile icon="shield-check" label="Approvals" onPress={() => router.push('/(tabs)/approvals')} theme={theme} />
        <QuickTile icon="alert-outline" label="Issues" onPress={() => router.push('/(tabs)/report')} theme={theme} />
        <QuickTile icon="apps" label="Apps" onPress={() => router.push('/(tabs)/explore')} theme={theme} />
      </View>

      {/* ═══ KEY METRICS TILES ═══ */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="chart-box" title="Key Metrics" theme={theme} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <TouchableOpacity onPress={() => setDrillDown(drillDown === 'pending' ? null : 'pending')} style={[sty.metricTile, { backgroundColor: theme.secondary }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={theme.primary} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.primary }}>{pendingRequests}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.muted }}>PENDING</Text>
          </TouchableOpacity>
          <View style={[sty.metricTile, { backgroundColor: theme.secondary }]}>
            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#10B981" />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#10B981' }}>{approvedRequests}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.muted }}>APPROVED</Text>
          </View>
          <View style={[sty.metricTile, { backgroundColor: theme.secondary }]}>
            <MaterialCommunityIcons name="file-document-multiple-outline" size={20} color="#5B7FFF" />
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#5B7FFF' }}>{totalRequests}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.muted }}>TOTAL REQ</Text>
          </View>
          <View style={[sty.metricTile, { backgroundColor: theme.secondary }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.destructive} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.destructive }}>{openIssues}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: theme.muted }}>OPEN ISSUES</Text>
          </View>
        </View>
        {/* Avg resolution */}
        <View style={[sty.avgCard, { backgroundColor: theme.secondary, marginTop: 8 }]}>
          <MaterialCommunityIcons name="timer-outline" size={18} color={theme.primary} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground, flex: 1, marginLeft: 8 }}>Avg Resolution Time</Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: theme.primary }}>2 days</Text>
        </View>
      </GlassCard>

      {/* ═══ DRILL-DOWN: Pending breakdown ═══ */}
      {drillDown === 'pending' && (
        <GlassCard theme={theme} style={{ marginTop: 8 }}>
          <SectionHeader icon="arrow-collapse-down" title="Pending Breakdown" theme={theme} />
          <Text style={{ fontSize: 12, color: theme.muted, marginBottom: 8 }}>
            {pendingRequests} pending approvals at various levels:
          </Text>
          {hodBreakdown().length === 0 ? (
            <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center', paddingVertical: 12 }}>All clear!</Text>
          ) : (
            hodBreakdown().map(([stage, count]) => (
              <View key={stage} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="account-tie" size={16} color={theme.primary} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{stage}</Text>
                </View>
                <View style={{ backgroundColor: theme.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: theme.primary }}>{count}</Text>
                </View>
              </View>
            ))
          )}
        </GlassCard>
      )}

      {/* ═══ Trend Alerts ═══ */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="trending-up" title="Trend Alerts" theme={theme} />
        {[
          { icon: 'clock-alert-outline', text: `Avg resolution time: 2 days`, color: '#F59E0B' },
          { icon: 'wifi-alert', text: `WiFi complaints: ${tickets.filter(t => t.title.toLowerCase().includes('wifi')).length} this week`, color: theme.destructive },
          { icon: 'account-group', text: `${pendingRequests} pending approvals in pipeline`, color: theme.primary },
        ].map((alert, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: theme.border }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${alert.color}15`, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name={alert.icon as any} size={16} color={alert.color} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground, flex: 1 }}>{alert.text}</Text>
          </View>
        ))}
      </GlassCard>

      {/* ═══ Support Heatmap ═══ */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="fire" title="Support Heatmap" theme={theme} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const intensity = [0.1, 0.25, 0.4, 0.6, 0.8, 1][Math.floor(Math.abs(Math.sin(i * 1.7 + tickets.length)) * 6)];
            return <View key={i} style={{ width: '13%', aspectRatio: 1, borderRadius: 6, backgroundColor: theme.primary, opacity: intensity }} />;
          })}
        </View>
        {heat.slice(0, 5).map(([loc, count]) => (
          <View key={loc} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="fire" size={12} color={GRADIENT.end} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.foreground }}>{loc}</Text>
            </View>
            <Text style={{ fontSize: 12, color: theme.muted }}>{count} reports</Text>
          </View>
        ))}
      </GlassCard>

      {/* ═══ Pending Issues - Click to view details ═══ */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="alert-outline" title="Pending Issues" trailing={{ text: 'All →', onPress: () => router.push('/(tabs)/report') }} theme={theme} />
        {tickets.filter(t => t.status !== 'Resolved' && t.status !== 'RESOLVED').length === 0 ? (
          <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center', paddingVertical: 16 }}>No open issues. 🎉</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {tickets.filter(t => t.status !== 'Resolved' && t.status !== 'RESOLVED').slice(0, 5).map((t) => (
              <TouchableOpacity key={t.id} onPress={() => setSelectedTicket(t)} style={[sty.permItem, { backgroundColor: theme.secondary }]}>
                <GradientIconCircle icon="wrench" size={36} iconSize={16} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{t.title}</Text>
                  <Text style={{ fontSize: 11, color: theme.muted }}>{t.location} · {t.priority} Priority</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={theme.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
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

      {/* Ticket Detail Modal */}
      <Modal visible={!!selectedTicket} transparent animationType="slide">
        {selectedTicket && (
          <View style={{ flex: 1, backgroundColor: 'rgba(30,16,64,0.4)', justifyContent: 'flex-end' }}>
            <ScrollView style={{ backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' }}>
              <View style={{ padding: 20 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary, letterSpacing: 1 }}>ISSUE DETAILS</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground, marginTop: 4 }}>{selectedTicket.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedTicket(null)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="close" size={18} color={theme.foreground} />
                  </TouchableOpacity>
                </View>

                {/* Metadata */}
                <View style={{ gap: 10, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.secondary, borderRadius: 12, padding: 10 }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.primary} />
                    <Text style={{ fontSize: 13, color: theme.foreground }}>{selectedTicket.location}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.secondary, borderRadius: 12, padding: 10 }}>
                      <MaterialCommunityIcons name="tag-outline" size={16} color={theme.primary} />
                      <Text style={{ fontSize: 13, color: theme.foreground }}>{selectedTicket.category}</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: selectedTicket.priority === 'High' ? 'rgba(239,68,68,0.15)' : selectedTicket.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', borderRadius: 12, padding: 10 }}>
                      <MaterialCommunityIcons name="alert-circle" size={16} color={selectedTicket.priority === 'High' ? '#EF4444' : selectedTicket.priority === 'Medium' ? '#F59E0B' : '#10B981'} />
                      <Text style={{ fontSize: 13, fontWeight: '600', color: selectedTicket.priority === 'High' ? '#EF4444' : selectedTicket.priority === 'Medium' ? '#F59E0B' : '#10B981' }}>{selectedTicket.priority}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.secondary, borderRadius: 12, padding: 10 }}>
                    <MaterialCommunityIcons name="account-outline" size={16} color={theme.primary} />
                    <Text style={{ fontSize: 13, color: theme.foreground }}>By: {selectedTicket.by}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.secondary, borderRadius: 12, padding: 10 }}>
                    <MaterialCommunityIcons name={selectedTicket.status === 'Open' ? 'clock-outline' : selectedTicket.status === 'In Progress' ? 'progress-clock' : 'check-circle-outline'} size={16} color={selectedTicket.status === 'Open' ? theme.destructive : selectedTicket.status === 'In Progress' ? '#F59E0B' : '#10B981'} />
                    <Text style={{ fontSize: 13, fontWeight: '600', color: selectedTicket.status === 'Open' ? theme.destructive : selectedTicket.status === 'In Progress' ? '#F59E0B' : '#10B981' }}>{selectedTicket.status}</Text>
                  </View>
                </View>

                {/* Photos */}
                {selectedTicket.photos && selectedTicket.photos.length > 0 && (
                  <>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.foreground, marginBottom: 10 }}>ATTACHMENTS</Text>
                    <View style={{ gap: 8, marginBottom: 16 }}>
                      {selectedTicket.photos.map((photo: string, idx: number) => (
                        <Image key={idx} source={{ uri: photo }} style={{ width: '100%', height: 200, borderRadius: 12 }} />
                      ))}
                    </View>
                  </>
                )}

                {/* Actions */}
                {selectedTicket.status !== 'Resolved' && (
                  <View style={{ gap: 8 }}>
                    {selectedTicket.status === 'Open' && (
                      <TouchableOpacity onPress={() => { store.updateTicketStatus(selectedTicket.id, 'In Progress'); setSelectedTicket(null); }} activeOpacity={0.9}>
                        <LinearGradient colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]} style={{ borderRadius: 12, padding: 12, alignItems: 'center' }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF' }}>START INVESTIGATING</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => { store.updateTicketStatus(selectedTicket.id, selectedTicket.status === 'In Progress' ? 'Resolved' : 'In Progress'); setSelectedTicket(null); }} activeOpacity={0.9}>
                      <LinearGradient colors={['#10B981', '#059669']} style={{ borderRadius: 12, padding: 12, alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF' }}>{selectedTicket.status === 'In Progress' ? 'MARK RESOLVED' : 'MARK IN PROGRESS'}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      <NotificationsModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />
    </ScrollView>
  );
}

const sty = StyleSheet.create({
  heroStat: { flex: 1, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  metricTile: { width: '48%', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  avgCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12 },
  permItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 10 },
});
