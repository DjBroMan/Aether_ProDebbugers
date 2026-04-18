import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import { GradientIconCircle } from '../../components/ui/AetherUI';

type Msg = { role: 'user' | 'bot'; text: string; cta?: { label: string; icon: string } };
const seed: Msg[] = [
  { role: 'bot', text: "Hi! I'm your Campus Copilot. Ask me about your schedule, dues, or approvals." },
];

export default function CopilotScreen() {
  const theme = useTheme();
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs, typing]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const lower = q.toLowerCase();
      let reply: Msg = { role: 'bot', text: 'I can help with schedule, dues, approvals or rooms. Try one of those!' };
      if (lower.includes('schedule') || lower.includes('class')) {
        reply = {
          role: 'bot',
          text: 'You have 3 classes today: Calculus II at 9:00 (B-201), Quantum Physics at 10:30 (A-104), and Lab — Circuits at 13:00 (Lab-3).',
          cta: { label: 'Open Schedule', icon: 'calendar' },
        };
      } else if (lower.includes('due') || lower.includes('pay') || lower.includes('fee')) {
        reply = { role: 'bot', text: 'You have ₹1,250 in pending dues across 3 items. Want to settle now?', cta: { label: 'Pay Dues', icon: 'credit-card' } };
      } else if (lower.includes('leave') || lower.includes('approval')) {
        reply = { role: 'bot', text: 'Your leave from Apr 16 was approved. 1 request still in review.', cta: { label: 'View Approvals', icon: 'file-document' } };
      }
      setMsgs((m) => [...m, reply]);
      setTyping(false);
    }, 900);
  };

  const suggestions = ["What's my schedule today?", 'Any pending dues?', 'Status of my leave?'];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <GradientIconCircle icon="creation" size={36} iconSize={18} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>Campus Copilot</Text>
          <Text style={{ fontSize: 11, color: theme.muted }}>Powered by AETHER AI</Text>
        </View>
      </View>

      {/* Hero orb (only when few messages) */}
      {msgs.length <= 1 && (
        <View style={s.orbArea}>
          <LinearGradient
            colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
            style={s.orb}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
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
              <LinearGradient
                colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.bubble, s.userBubble, SHADOWS.glow]}
              >
                <Text style={{ fontSize: 14, color: '#FFF' }}>{m.text}</Text>
              </LinearGradient>
            ) : (
              <View style={[s.bubble, s.botBubble, { backgroundColor: theme.card, ...SHADOWS.soft, borderWidth: 1, borderColor: theme.border }]}>
                <Text style={{ fontSize: 14, color: theme.foreground }}>{m.text}</Text>
                {m.cta && (
                  <TouchableOpacity style={[s.ctaBtn, { backgroundColor: theme.accent }]}>
                    <MaterialCommunityIcons name={m.cta.icon as any} size={14} color={theme.primary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primary }}>{m.cta.label}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
        {typing && (
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
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {suggestions.map((q) => (
            <TouchableOpacity key={q} onPress={() => send(q)}
              style={[s.suggestionChip, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.foregroundSoft }}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[s.inputBar, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
          <TouchableOpacity style={[s.micBtn, { backgroundColor: theme.secondary }]}>
            <MaterialCommunityIcons name="microphone" size={16} color={theme.primary} />
          </TouchableOpacity>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            placeholder="Ask Copilot anything…"
            placeholderTextColor={theme.muted}
            style={{ flex: 1, fontSize: 14, color: theme.foreground, paddingHorizontal: 8 }}
          />
          <TouchableOpacity onPress={() => send()}>
            <LinearGradient
              colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
              style={s.sendBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="send" size={16} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  orbArea: { alignItems: 'center', paddingVertical: 16 },
  orb: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow },
  msgRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  userBubble: { borderBottomRightRadius: 6 },
  botBubble: { borderBottomLeftRadius: 6 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  suggestionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  inputBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 28, paddingHorizontal: 6, paddingVertical: 6, ...SHADOWS.card },
  micBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow },
});
