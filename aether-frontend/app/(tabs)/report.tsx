import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import { GlassCard, GradientIconCircle, FilterChip, GradientButton, SectionHeader } from '../../components/ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore, type Ticket } from '../../store/campusStore';

const filterTabs = ['All', 'Open', 'In Progress', 'Resolved'] as const;

export default function ReportScreen() {
  const theme = { background: '#F8F5FF', card: '#FFFFFF', foreground: '#1E1040', muted: '#A394C0', border: '#E4DCF0', primary: '#7C3AED', accent: '#EDE6FA', secondary: '#F0ECF6', destructive: '#EF4444', inputBg: 'rgba(240,236,246,0.6)' };
  const { user } = useAuthStore();
  const { tickets, createTicket, updateTicketStatus } = useCampusStore();
  const role = user?.role ?? 'STUDENT';

  const [tab, setTab] = useState<typeof filterTabs[number]>('All');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Ticket['category']>('IT');

  const filtered = tab === 'All' ? tickets : tickets.filter((t) => t.status === tab);
  const open = tickets.filter((t) => t.status === 'Open').length;
  const resolved = tickets.filter((t) => t.status === 'Resolved').length;
  const hotspot = (() => {
    const map = new Map<string, number>();
    tickets.forEach((t) => map.set(t.location, (map.get(t.location) ?? 0) + 1));
    const top = Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0];
    return top?.[0] ?? '—';
  })();

  const submit = () => {
    if (!title.trim() || !location.trim()) return;
    createTicket({ title: title.trim(), location: location.trim(), category, by: user?.email ?? 'user', photos: [] });
    setTitle(''); setLocation('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Report form */}
      <GlassCard theme={theme}>
        <SectionHeader icon="camera" title="Report new issue" theme={theme} />
        <TextInput value={title} onChangeText={setTitle} placeholder="Describe the issue (e.g. projector flicker)" placeholderTextColor={theme.muted}
          style={[s.input, { backgroundColor: theme.inputBg, color: theme.foreground }]} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TextInput value={location} onChangeText={setLocation} placeholder="Location (e.g. B-201)" placeholderTextColor={theme.muted}
            style={[s.input, { flex: 1, backgroundColor: theme.inputBg, color: theme.foreground }]} />
          <View style={[s.input, { backgroundColor: theme.inputBg, justifyContent: 'center' }]}>
            <TouchableOpacity onPress={() => setCategory(category === 'IT' ? 'Maintenance' : category === 'Maintenance' ? 'Facilities' : 'IT')}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: theme.foreground }}>{category}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Text style={{ fontSize: 10, color: theme.muted }}>Tap to attach photos</Text>
          <TouchableOpacity onPress={submit} activeOpacity={0.9}>
            <LinearGradient colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]} style={s.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <MaterialCommunityIcons name="send" size={12} color="#FFF" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        {[
          { icon: 'clock-outline', k: 'OPEN', v: open, color: GRADIENT.end },
          { icon: 'check-circle-outline', k: 'RESOLVED', v: resolved, color: theme.primary },
          { icon: 'alert-outline', k: 'HOTSPOT', v: hotspot, color: GRADIENT.start },
        ].map(({ icon, k, v, color }) => (
          <View key={k} style={[s.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <MaterialCommunityIcons name={icon as any} size={16} color={color} />
            <Text style={{ fontSize: 20, fontWeight: '800', color: theme.foreground, marginTop: 4 }}>{v}</Text>
            <Text style={[FONT.tiny, { color: theme.muted }]}>{k}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 16 }}>
        {filterTabs.map((t) => (
          <FilterChip key={t} label={t} active={tab === t} onPress={() => setTab(t)} theme={theme} />
        ))}
      </ScrollView>

      {/* Ticket cards */}
      <View style={{ gap: 12, marginTop: 16, marginBottom: 30 }}>
        {filtered.map((it) => {
          const priColor = it.priority === 'High' ? theme.destructive : it.priority === 'Medium' ? GRADIENT.start : theme.primary;
          const stColor = it.status === 'Open' ? GRADIENT.end : it.status === 'In Progress' ? GRADIENT.start : theme.primary;
          return (
            <View key={it.id} style={[s.ticketCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[s.priIcon, { backgroundColor: `${priColor}15` }]}>
                  <MaterialCommunityIcons name="alert" size={16} color={priColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.foreground }} numberOfLines={1}>{it.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={12} color={theme.muted} />
                    <Text style={{ fontSize: 11, color: theme.muted }}>{it.location} · {it.category} · {it.priority}</Text>
                  </View>
                </View>
                <Text style={[s.statusBadge, { color: stColor, backgroundColor: `${stColor}15` }]}>{it.status}</Text>
              </View>
              {role === 'ADMIN' && it.status !== 'Resolved' && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  {it.status === 'Open' && (
                    <TouchableOpacity onPress={() => updateTicketStatus(it.id, 'In Progress')}
                      style={[s.tktBtn, { backgroundColor: `${GRADIENT.start}15` }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: GRADIENT.start }}>Start</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => updateTicketStatus(it.id, 'Resolved')} activeOpacity={0.9} style={{ flex: 1 }}>
                    <LinearGradient colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]} style={s.tktBtn}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>Resolve</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  input: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 8, ...SHADOWS.glow },
  statCard: { flex: 1, borderRadius: RADIUS.xl, padding: 12, borderWidth: 1, ...SHADOWS.soft },
  ticketCard: { borderRadius: RADIUS.xl, padding: 12, borderWidth: 1, ...SHADOWS.soft },
  priIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tktBtn: { flex: 1, borderRadius: RADIUS.full, paddingVertical: 8, alignItems: 'center' },
});
