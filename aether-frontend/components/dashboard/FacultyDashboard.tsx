import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import {
  GradientCard, GradientIconCircle, QuickTile, GlassCard,
  WelcomeBar, SectionHeader, RolePill, BottomSheet, GradientButton,
} from '../ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore, type FacultyTier } from '../../store/campusStore';
import { ReportIssueModal } from '../ui/ReportIssueModal';
import { NotificationsModal } from '../ui/NotificationsModal';

const tiers: { key: FacultyTier; icon: string }[] = [
  { key: 'Teacher', icon: 'school' },
  { key: 'HOD', icon: 'shield-check' },
  { key: 'Principal', icon: 'crown' },
];

const trend = [62, 70, 65, 78, 74, 82, 88];
const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const advisees = [
  { name: 'Aarav Mehta', note: 'Below 75% attendance', warn: true },
  { name: 'Sara Iyer', note: 'Project review pending', warn: false },
  { name: 'Rohit K.', note: 'Follow-up: lab safety', warn: false },
];

export default function FacultyDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { approvals, notices, actOnApproval, createNotice } = useCampusStore();
  const notifications = useCampusStore((s) => s.notifications);

  const [tier, setTier] = useState<FacultyTier>('Teacher');
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<'All' | 'CSE' | 'ECE' | 'MECH'>('CSE');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const displayName = user?.name ?? 'Professor';
  const myQueue = approvals.filter((a) => {
    const cur = a.chain.find((c) => c.status === 'current');
    const matches = cur?.by === tier;
    console.log('[FacultyDashboard] Approval:', a.title, 'Current stage by:', cur?.by, 'Tier:', tier, 'Matches:', matches);
    return matches;
  });
  console.log('[FacultyDashboard] Total approvals:', approvals.length, 'Matching queue:', myQueue.length, 'Tier:', tier);

  const handlePublishNotice = () => {
    if (!noticeTitle.trim()) return;
    createNotice({ title: noticeTitle.trim(), body: noticeBody.trim(), audience: noticeAudience, by: displayName });
    setNoticeTitle(''); setNoticeBody('');
    setNoticeOpen(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Welcome */}
      <WelcomeBar
        roleLabel={`FACULTY · ${tier.toUpperCase()}`}
        name={displayName}
        initial={displayName[0]}
        onBell={() => setNotifModalVisible(true)} onLogout={logout} theme={theme}
        unread={notifications.some((n) => !n.read)}
      />

      {/* Authority level selector */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>AUTHORITY LEVEL</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {tiers.map((t) => (
            <RolePill key={t.key} label={t.key} icon={t.icon} active={tier === t.key} onPress={() => setTier(t.key)} theme={theme} />
          ))}
        </View>
      </GlassCard>

      {/* Hero */}
      <GradientCard style={{ marginTop: 16 }}>
        <View style={{ zIndex: 1 }}>
          <Text style={{ fontSize: 10, letterSpacing: 3, fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>DEPT · COMPUTER SCIENCE</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 4 }}>
            Good morning, <Text style={{ textDecorationLine: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)' }}>{displayName.split(' ').pop()}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>3 lectures today · {myQueue.length} requests in your queue</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            {[
              { icon: 'account-group', label: 'STUDENTS', val: '128' },
              { icon: 'clipboard-check', label: 'QUEUE', val: String(myQueue.length) },
              { icon: 'trending-up', label: 'ATT %', val: '88' },
            ].map((s) => (
              <View key={s.label} style={sty.heroStat}>
                <MaterialCommunityIcons name={s.icon as any} size={16} color="#FFF" />
                <Text style={{ fontSize: 10, letterSpacing: 2, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{s.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF' }}>{s.val}</Text>
              </View>
            ))}
          </View>
        </View>
      </GradientCard>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <QuickTile icon="bell-plus" label="Notice" onPress={() => setNoticeOpen(true)} theme={theme} />
        <QuickTile icon="clipboard-check" label="Requests" onPress={() => router.push('/(tabs)/approvals')} theme={theme} />
        <QuickTile icon="alert-outline" label="Report Issue" onPress={() => setReportModalVisible(true)} theme={theme} />
        <QuickTile icon="chart-bar" label="Insights" onPress={() => {}} theme={theme} />
      </View>

      {/* Attendance trend */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="trending-up" title="Attendance Trend" trailing={{ text: '7d', onPress: () => {} }} theme={theme} />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {trend.map((v, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <View style={{ width: '100%', height: `${v}%`, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: theme.primary, ...SHADOWS.glow }} />
              <Text style={{ fontSize: 9, fontWeight: '600', color: theme.muted }}>{dayLabels[i]}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Approval queue */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader title={`My Queue · ${tier}`} trailing={{ text: 'All →', onPress: () => router.push('/(tabs)/approvals') }} theme={theme} />
        {myQueue.length === 0 ? (
          <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center', paddingVertical: 16 }}>All clear. Nothing waiting on you.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {myQueue.slice(0, 4).map((r) => (
              <View key={r.id} style={[sty.queueItem, { backgroundColor: theme.secondary }]}>
                <GradientIconCircle icon="account" size={40} iconSize={18} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }} numberOfLines={1}>{r.title}</Text>
                  <Text style={{ fontSize: 11, color: theme.muted }} numberOfLines={1}>{r.kind} · by {r.by}</Text>
                </View>
                <TouchableOpacity onPress={() => actOnApproval(r.id, 'approve', tier)} style={[sty.queueBtn, { backgroundColor: 'rgba(124,58,237,0.15)' }]}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => actOnApproval(r.id, 'reject', tier)} style={[sty.queueBtn, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={theme.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      {/* Recent notices */}
      <GlassCard theme={theme} style={{ marginTop: 16 }}>
        <SectionHeader icon="bell" title="My Notices" trailing={{ text: '+ New', onPress: () => setNoticeOpen(true) }} theme={theme} />
        {notices.length === 0 ? (
          <Text style={{ fontSize: 12, color: theme.muted, textAlign: 'center', paddingVertical: 16 }}>No notices yet.</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {notices.slice(0, 3).map((n) => (
              <View key={n.id} style={[sty.noticeItem, { backgroundColor: theme.secondary }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{n.title}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: theme.primary, backgroundColor: theme.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>{n.audience}</Text>
                </View>
                <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2 }} numberOfLines={2}>{n.body}</Text>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      {/* Advising */}
      <GlassCard theme={theme} style={{ marginTop: 16, marginBottom: 20 }}>
        <SectionHeader icon="account-check" title="Advising & Follow-ups" trailing={{ text: String(advisees.length), onPress: () => {} }} theme={theme} />
        <View style={{ gap: 8 }}>
          {advisees.map((a) => (
            <View key={a.name} style={[sty.queueItem, { backgroundColor: theme.secondary }]}>
              <GradientIconCircle icon="account" size={36} iconSize={16} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{a.name}</Text>
                <Text style={{ fontSize: 11, color: a.warn ? GRADIENT.end : theme.muted }}>{a.note}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/ai')} style={[sty.queueBtn, { backgroundColor: 'rgba(124,58,237,0.15)' }]}>
                <MaterialCommunityIcons name="message-outline" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Notice modal */}
      <BottomSheet visible={noticeOpen} onClose={() => setNoticeOpen(false)} theme={theme}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={[FONT.tiny, { color: theme.muted }]}>PUBLISH NOTICE</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>Broadcast to students</Text>
          </View>
          <TouchableOpacity onPress={() => setNoticeOpen(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="close" size={16} color={theme.foreground} />
          </TouchableOpacity>
        </View>
        <TextInput value={noticeTitle} onChangeText={setNoticeTitle} placeholder="Title" placeholderTextColor={theme.muted}
          style={{ backgroundColor: theme.inputBg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.foreground, marginBottom: 8 }} />
        <TextInput value={noticeBody} onChangeText={setNoticeBody} placeholder="Notice body" placeholderTextColor={theme.muted} multiline numberOfLines={3}
          style={{ backgroundColor: theme.inputBg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: theme.foreground, marginBottom: 12, textAlignVertical: 'top', minHeight: 80 }} />
        <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>AUDIENCE</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['All', 'CSE', 'ECE', 'MECH'] as const).map((a) => (
            <RolePill key={a} label={a} icon="account-group" active={noticeAudience === a} onPress={() => setNoticeAudience(a)} theme={theme} />
          ))}
        </View>
        <GradientButton label="PUBLISH" onPress={handlePublishNotice} icon="send" />
      </BottomSheet>

      <ReportIssueModal visible={reportModalVisible} onClose={() => setReportModalVisible(false)} />
      <NotificationsModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />
    </ScrollView>
  );
}

const sty = StyleSheet.create({
  heroStat: { flex: 1, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  queueItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 10, gap: 4 },
  queueBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  noticeItem: { borderRadius: 16, padding: 10 },
});
