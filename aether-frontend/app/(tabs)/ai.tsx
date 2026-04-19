import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import { GradientIconCircle } from '../../components/ui/AetherUI';
import { useAuthStore } from '../../store/authStore';
import { useCampusStore } from '../../store/campusStore';
import { API_BASE_URL } from '../../constants/api';
import axios from 'axios';

type Msg = { role: 'user' | 'bot'; text: string; cta?: { label: string; route: string; icon: string } };

export default function CopilotScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const store = useCampusStore();
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'bot', text: "Hi! I'm your Campus Copilot. Ask me about your schedule, pending requests, dues, or anything campus-related. I can also help you navigate workflows." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs, loading]);

  // ─── Local context-aware responses (fast, no API needed) ────
  const tryLocalAnswer = (q: string): Msg | null => {
    const lower = q.toLowerCase();

    // Schedule queries
    if (lower.includes('schedule') || lower.includes('class') || lower.includes('timetable') || lower.includes('lecture')) {
      const todayEvents = store.schedule.filter(e => e.day === 0);
      if (todayEvents.length === 0) return { role: 'bot', text: "You don't have any classes scheduled for today." };
      const list = todayEvents.sort((a, b) => a.startHour - b.startHour)
        .map(e => `• ${e.title} at ${e.startHour}:00 in ${e.room}`).join('\n');
      return { role: 'bot', text: `Here's your schedule for today:\n${list}`, cta: { label: 'Open Schedule', route: '/(tabs)/schedule', icon: 'calendar' } };
    }

    // Pending requests / approvals
    if (lower.includes('pending') || lower.includes('request') || lower.includes('approval') || lower.includes('status')) {
      const pending = store.approvals.filter(a => a.status === 'Pending' || a.status === 'In Review');
      const approved = store.approvals.filter(a => a.status === 'Approved');
      return {
        role: 'bot',
        text: `You have ${pending.length} pending request${pending.length !== 1 ? 's' : ''} and ${approved.length} approved.\n${pending.map(a => `• ${a.title} — ${a.status}`).join('\n') || 'No pending requests.'}`,
        cta: { label: 'View Approvals', route: '/(tabs)/approvals', icon: 'file-document' }
      };
    }

    // Dues / Pay
    if (lower.includes('due') || lower.includes('pay') || lower.includes('fee') || lower.includes('owe')) {
      return { role: 'bot', text: 'You have ₹1,250 in pending dues:\n• Library fine: ₹250\n• Lab fee: ₹800\n• Canteen tab: ₹200\n\nWant to settle now?', cta: { label: 'Pay Dues', route: '/(tabs)/pay', icon: 'credit-card' } };
    }

    // Leave application workflow
    if (lower.includes('apply for leave') || lower.includes('leave request') || lower.includes('want leave')) {
      return { role: 'bot', text: "Here's how to apply for leave:\n1. Go to Approvals\n2. Tap the '+' button\n3. Select 'Leave' as the type\n4. Fill in the reason and dates\n5. Hit 'Submit to Chain'\n\nYour request goes through: Faculty → HOD → Office.", cta: { label: 'Open Approvals', route: '/(tabs)/approvals', icon: 'file-document' } };
    }

    // Book a room
    if (lower.includes('book a room') || lower.includes('room booking') || lower.includes('room available')) {
      const freeRooms = store.roomAvailability().filter(r => r.status === 'Free');
      const suggestions = freeRooms.slice(0, 3).map(r => `• ${r.room} — Free until ${r.until}`).join('\n');
      return { role: 'bot', text: `Available rooms right now:\n${suggestions || 'No rooms are free at this moment.'}\n\nTo book, go to Schedule and tap '+' to create an event.`, cta: { label: 'Open Schedule', route: '/(tabs)/schedule', icon: 'calendar' } };
    }

    // Notifications / updates
    if (lower.includes('update') || lower.includes('notification') || lower.includes('what\'s new') || lower.includes('any news')) {
      const unread = store.notifications.filter(n => !n.read);
      const notices = store.notices.slice(0, 3);
      let text = `🔔 Updates:\n`;
      if (unread.length > 0) text += unread.slice(0, 5).map(n => `• ${n.title}: ${n.body}`).join('\n');
      else text += '• No unread notifications.\n';
      if (notices.length > 0) text += `\n\n📢 Recent Notices:\n` + notices.map(n => `• ${n.title} (${n.by})`).join('\n');
      return { role: 'bot', text };
    }

    // Issues
    if (lower.includes('report') || lower.includes('issue') || lower.includes('complaint') || lower.includes('broken')) {
      return { role: 'bot', text: "To report a campus issue:\n1. Go to 'Issues' tab\n2. Tap 'Report Issue'\n3. Take a photo of the problem\n4. Fill in the title and location\n5. Submit — it gets auto-prioritized!\n\nSupport teams receive prioritized tickets.", cta: { label: 'Report Issue', route: '/(tabs)/report', icon: 'alert-circle' } };
    }

    return null;
  };

  // ─── Send message ──────────────────────────
  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    // 1. Try local context-aware answer first (instant)
    const local = tryLocalAnswer(q);
    if (local) {
      setTimeout(() => {
        setMsgs(m => [...m, local]);
        setLoading(false);
      }, 400);
      return;
    }

    // 2. Fallback to backend AI (Gemini → xAI → Groq)
    try {
      const res = await axios.post(`${API_BASE_URL}/api/ai/query`, { prompt: q }, {
        headers: { Authorization: `Bearer ${user?.token}`, 'x-mock-role': user?.role || 'STUDENT' },
        timeout: 20000,
      });
      setMsgs(m => [...m, { role: 'bot', text: res.data.answer || 'I couldn\'t find a specific answer. Try asking about your schedule, approvals, or dues.' }]);
    } catch (err) {
      console.warn('[Copilot] AI query failed:', (err as Error).message);
      setMsgs(m => [...m, { role: 'bot', text: 'I can help with schedule, approvals, dues, room bookings, and issue reporting. Try asking about one of those!' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ["What's my schedule?", 'Pending requests?', 'How to apply for leave?', 'Book a room', 'Any updates?'];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <GradientIconCircle icon="creation" size={36} iconSize={18} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>Campus Copilot</Text>
          <Text style={{ fontSize: 11, color: theme.muted }}>Powered by AETHER AI · Context-Aware</Text>
        </View>
      </View>

      {/* Hero orb (only when few messages) */}
      {msgs.length <= 1 && (
        <View style={s.orbArea}>
          <LinearGradient colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]} style={s.orb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <MaterialCommunityIcons name="creation" size={40} color="#FFF" />
          </LinearGradient>
          <Text style={[FONT.tiny, { color: theme.muted, marginTop: 8 }]}>YOUR PERSONAL AI</Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        {msgs.map((m, i) => (
          <View key={i} style={[s.msgRow, m.role === 'user' && { justifyContent: 'flex-end' }]}>
            {m.role === 'bot' && <GradientIconCircle icon="creation" size={32} iconSize={16} />}
            {m.role === 'user' ? (
              <LinearGradient colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.bubble, s.userBubble, SHADOWS.glow]}>
                <Text style={{ fontSize: 14, color: '#FFF' }}>{m.text}</Text>
              </LinearGradient>
            ) : (
              <View style={[s.bubble, s.botBubble, { backgroundColor: theme.card, ...SHADOWS.soft, borderWidth: 1, borderColor: theme.border }]}>
                <Text style={{ fontSize: 14, color: theme.foreground, lineHeight: 20 }}>{m.text}</Text>
                {m.cta && (
                  <TouchableOpacity onPress={() => router.push(m.cta!.route as any)} style={[s.ctaBtn, { backgroundColor: theme.accent }]}>
                    <MaterialCommunityIcons name={m.cta.icon as any} size={14} color={theme.primary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>{m.cta.label}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
        {loading && (
          <View style={s.msgRow}>
            <GradientIconCircle icon="creation" size={32} iconSize={16} />
            <View style={[s.bubble, s.botBubble, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', gap: 6, paddingVertical: 12 }]}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary, opacity: 0.5 + i * 0.2 }} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggestions + Input */}
      <View style={{ paddingHorizontal: 16, paddingBottom: Platform.OS === 'web' ? 16 : 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {suggestions.map((q) => (
            <TouchableOpacity key={q} onPress={() => send(q)} style={[s.suggestionChip, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.foregroundSoft }}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[s.inputBar, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            placeholder="Ask Copilot anything…"
            placeholderTextColor={theme.muted}
            style={{ flex: 1, fontSize: 14, color: theme.foreground, paddingHorizontal: 12 }}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={() => send()} disabled={loading}>
            <LinearGradient colors={loading ? ['#999', '#999'] : [GRADIENT.start, GRADIENT.mid, GRADIENT.end]} style={s.sendBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {loading ? <ActivityIndicator size="small" color="#FFF" /> : <MaterialCommunityIcons name="send" size={16} color="#FFF" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 1 },
  orbArea: { alignItems: 'center', paddingVertical: 16 },
  orb: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow },
  msgRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  userBubble: { borderBottomRightRadius: 6 },
  botBubble: { borderBottomLeftRadius: 6 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  suggestionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  inputBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, paddingHorizontal: 6, paddingVertical: 6, ...SHADOWS.card },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow },
});
