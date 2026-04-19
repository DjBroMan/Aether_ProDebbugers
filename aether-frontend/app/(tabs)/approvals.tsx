import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import {
  GlassCard, GradientIconCircle, SectionHeader, FilterChip,
  BottomSheet, GradientButton, RolePill,
} from '../../components/ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore, type ApprovalKind, type FacultyTier, type Approval } from '../../store/campusStore';

const tabs = ['All', 'Pending', 'Approved', 'Rejected'] as const;
const KINDS: ApprovalKind[] = ['Leave', 'Room Booking', 'Bonafide', 'Event', 'Fee Waiver', 'Reschedule'];

function statusColor(s: Approval['status'], theme: any) {
  switch (s) {
    case 'Approved': return { color: theme.primary, bg: theme.accent };
    case 'Pending': return { color: GRADIENT.start, bg: 'rgba(91,127,255,0.1)' };
    case 'In Review': return { color: GRADIENT.end, bg: 'rgba(236,72,153,0.1)' };
    case 'Rejected': return { color: theme.destructive, bg: 'rgba(239,68,68,0.1)' };
  }
}

export default function ApprovalsScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { approvals, createApproval, actOnApproval } = useCampusStore();
  const role = user?.role ?? 'STUDENT';

  const [tab, setTab] = useState<typeof tabs[number]>('All');
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<ApprovalKind>('Leave');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [actorTier, setActorTier] = useState<FacultyTier>('Teacher');
  const [viewingTimeline, setViewingTimeline] = useState<Approval | null>(null);

  const filtered = tab === 'All' ? approvals :
    approvals.filter((a) => tab === 'Pending' ? (a.status === 'Pending' || a.status === 'In Review') : a.status === tab);

  const stats = {
    pending: approvals.filter((a) => a.status === 'Pending' || a.status === 'In Review').length,
    approved: approvals.filter((a) => a.status === 'Approved').length,
    total: approvals.length,
  };

  const handleCreate = async () => {
    setCreating(false);
    const finalTitle = title.trim() || kind;
    await createApproval({ title: finalTitle, kind, by: user?.email ?? 'student', details: details.trim() ? { reason: details.trim() } : undefined });
    setTitle(''); setDetails('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.foreground }}>Approvals</Text>
          <Text style={{ fontSize: 11, color: theme.muted }}>{role === 'FACULTY' ? 'Chain of Responsibility queue' : 'Track your requests'}</Text>
        </View>
        {role === 'STUDENT' && (
          <TouchableOpacity onPress={() => setCreating(true)}>
            <LinearGradient colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]} style={s.addBtn}>
              <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { icon: 'clock-outline', k: 'PENDING', v: stats.pending },
            { icon: 'check-circle-outline', k: 'APPROVED', v: stats.approved },
            { icon: 'file-document-outline', k: 'TOTAL', v: stats.total },
          ].map(({ icon, k, v }) => (
            <View key={k} style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <MaterialCommunityIcons name={icon as any} size={16} color={theme.primary} />
              <Text style={{ fontSize: 20, fontWeight: '800', color: theme.foreground, marginTop: 4 }}>{v}</Text>
              <Text style={[FONT.tiny, { color: theme.muted }]}>{k}</Text>
            </View>
          ))}
        </View>

        {/* Faculty tier selector */}
        {role === 'FACULTY' && (
          <GlassCard theme={theme} style={{ marginTop: 16 }}>
            <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>ACTING AS</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Teacher', 'HOD', 'Principal'] as FacultyTier[]).map((t) => (
                <RolePill key={t} label={t} icon="shield-check" active={actorTier === t} onPress={() => setActorTier(t)} theme={theme} />
              ))}
            </View>
          </GlassCard>
        )}

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 16 }}>
          {tabs.map((t) => (
            <FilterChip key={t} label={t} active={tab === t} onPress={() => setTab(t)} theme={theme} />
          ))}
        </ScrollView>

        {/* Approval cards */}
        <View style={{ gap: 12, marginTop: 16, marginBottom: 30 }}>
          {filtered.length === 0 && (
            <Text style={{ textAlign: 'center', fontSize: 12, color: theme.muted, paddingVertical: 32 }}>No requests in this view.</Text>
          )}
          {filtered.map((it) => {
            const stage = it.chain.find((c) => c.status === 'current');
            const canAct = role === 'FACULTY' && stage && stage.by === actorTier;
            const sc = statusColor(it.status, theme);
            return (
              <View key={it.id} style={[s.approvalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[s.approvalIcon, { backgroundColor: theme.accent }]}>
                    <MaterialCommunityIcons name="file-document-outline" size={16} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.foreground }} numberOfLines={1}>{it.title}</Text>
                    <Text style={{ fontSize: 11, color: theme.muted }} numberOfLines={1}>
                      {it.kind} · {new Date(it.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {stage ? ` · awaits ${stage.by}` : ''}
                    </Text>
                  </View>
                  <Text style={[s.statusBadge, { color: sc.color, backgroundColor: sc.bg }]}>● {it.status}</Text>
                </View>
                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  {canAct && (
                    <>
                      <TouchableOpacity onPress={() => actOnApproval(it.id, 'approve', actorTier)} activeOpacity={0.9} style={{ flex: 1 }}>
                        <LinearGradient colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]} style={s.actionBtn}>
                          <MaterialCommunityIcons name="check-circle" size={14} color="#FFF" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>Approve</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => actOnApproval(it.id, 'reject', actorTier)}
                        style={[s.actionBtn, { flex: 1, backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                        <MaterialCommunityIcons name="close-circle" size={14} color={theme.destructive} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.destructive }}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {!canAct && (
                    <TouchableOpacity onPress={() => setViewingTimeline(it)} style={[s.actionBtn, { flex: 1, backgroundColor: theme.secondary }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted }}>View timeline</Text>
                      <MaterialCommunityIcons name="chevron-right" size={14} color={theme.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Create modal */}
      <BottomSheet visible={creating} onClose={() => setCreating(false)} theme={theme}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={[FONT.tiny, { color: theme.muted }]}>NEW REQUEST</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>Smart Workflow</Text>
          </View>
          <TouchableOpacity onPress={() => setCreating(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="close" size={16} color={theme.foreground} />
          </TouchableOpacity>
        </View>
        <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>TYPE</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {KINDS.map((k) => (
            <RolePill key={k} label={k} icon="file-document" active={kind === k} onPress={() => setKind(k)} theme={theme} />
          ))}
        </View>
        <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>TITLE</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder={kind} placeholderTextColor={theme.muted}
          style={{ backgroundColor: theme.inputBg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.foreground, marginBottom: 16 }} />
        <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>REASON / DETAILS</Text>
        <TextInput value={details} onChangeText={setDetails} placeholder="Brief context (optional)" placeholderTextColor={theme.muted} multiline numberOfLines={3}
          style={{ backgroundColor: theme.inputBg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.foreground, marginBottom: 16, textAlignVertical: 'top', minHeight: 80 }} />
        <GradientButton label="SUBMIT TO CHAIN" onPress={handleCreate} icon="send" />
      </BottomSheet>

      {/* Timeline modal */}
      <BottomSheet visible={!!viewingTimeline} onClose={() => setViewingTimeline(null)} theme={theme}>
        {viewingTimeline && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <View>
                <Text style={[FONT.tiny, { color: theme.muted }]}>REQUEST TIMELINE</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>{viewingTimeline.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setViewingTimeline(null)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="close" size={16} color={theme.foreground} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {viewingTimeline.chain.map((stage, idx) => {
                const isLast = idx === viewingTimeline.chain.length - 1;
                const statusIcon = stage.status === 'done' ? 'check-circle' : stage.status === 'current' ? 'clock-outline' : stage.status === 'rejected' ? 'close-circle' : 'circle-outline';
                const statusColor = stage.status === 'done' ? theme.primary : stage.status === 'current' ? GRADIENT.start : stage.status === 'rejected' ? theme.destructive : theme.muted;
                
                return (
                  <View key={idx} style={{ flexDirection: 'row', marginBottom: isLast ? 0 : 20 }}>
                    <View style={{ alignItems: 'center', marginRight: 12 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${statusColor}20`, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name={statusIcon as any} size={16} color={statusColor} />
                      </View>
                      {!isLast && <View style={{ width: 2, height: 32, backgroundColor: `${statusColor}40`, marginTop: 8 }} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.foreground }}>{stage.label}</Text>
                      <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>Awaits {stage.by}</Text>
                      {stage.at && (
                        <Text style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>{stage.at}</Text>
                      )}
                      {stage.note && (
                        <View style={{ backgroundColor: theme.card, borderRadius: 8, padding: 8, marginTop: 8, borderLeftWidth: 3, borderLeftColor: statusColor }}>
                          <Text style={{ fontSize: 11, color: theme.foreground, fontStyle: 'italic' }}>"{stage.note}"</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow },
  statCard: { flex: 1, borderRadius: RADIUS.xl, padding: 12, borderWidth: 1, ...SHADOWS.soft },
  approvalCard: { borderRadius: RADIUS.xl, padding: 12, borderWidth: 1, ...SHADOWS.soft },
  approvalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: RADIUS.full, paddingVertical: 8, ...SHADOWS.glow },
});
