import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import { useCampusStore } from '../../store/campusStore';

export function NotificationsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const { notifications, notices, markAllRead } = useCampusStore();

  const handleMarkAll = () => { markAllRead(); };
  const unreadCount = notifications.filter(n => !n.read).length;

  const iconForKind = (kind: string) => {
    switch (kind) {
      case 'approval': return 'check-decagram';
      case 'ticket': return 'wrench';
      case 'schedule': return 'calendar';
      case 'payment': return 'credit-card';
      case 'notice': return 'bullhorn';
      default: return 'bell';
    }
  };

  const colorForKind = (kind: string) => {
    switch (kind) {
      case 'approval': return '#7C3AED';
      case 'ticket': return '#EF4444';
      case 'schedule': return '#5B7FFF';
      case 'payment': return '#10B981';
      case 'notice': return '#EC4899';
      default: return '#A394C0';
    }
  };

  const timeAgo = (t: number) => {
    const diff = Date.now() - t;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(30,16,64,0.4)', justifyContent: 'flex-end' }}>
        <View style={[s.container, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={s.headerRow}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.foreground }}>Notifications</Text>
              <Text style={{ fontSize: 11, color: theme.muted }}>{unreadCount} unread</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={handleMarkAll} style={[s.markAllBtn, { backgroundColor: theme.accent }]}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primary }}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: theme.secondary }]}>
                <MaterialCommunityIcons name="close" size={18} color={theme.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            {/* Notices section */}
            {notices.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>📢 NOTICES</Text>
                {notices.slice(0, 5).map(n => (
                  <View key={n.id} style={[s.noticeCard, { backgroundColor: 'rgba(124,58,237,0.08)', borderColor: 'rgba(124,58,237,0.15)' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.foreground }}>{n.title}</Text>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: theme.primary, backgroundColor: theme.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>{n.audience}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: theme.muted, marginTop: 2 }} numberOfLines={2}>{n.body}</Text>
                    <Text style={{ fontSize: 10, color: theme.muted, marginTop: 4 }}>— {n.by} · {timeAgo(n.at)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Personal notifications */}
            <Text style={[FONT.tiny, { color: theme.muted, marginBottom: 8 }]}>🔔 PERSONAL</Text>
            {notifications.length === 0 ? (
              <Text style={{ fontSize: 13, color: theme.muted, textAlign: 'center', paddingVertical: 32 }}>No notifications yet. They'll appear here when things happen!</Text>
            ) : (
              notifications.slice(0, 20).map(n => (
                <View key={n.id} style={[s.notifItem, { backgroundColor: n.read ? 'transparent' : 'rgba(124,58,237,0.05)', borderBottomColor: theme.border }]}>
                  <View style={[s.notifIcon, { backgroundColor: `${colorForKind(n.kind)}15` }]}>
                    <MaterialCommunityIcons name={iconForKind(n.kind) as any} size={16} color={colorForKind(n.kind)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: n.read ? '500' : '700', color: theme.foreground }} numberOfLines={1}>{n.title}</Text>
                    <Text style={{ fontSize: 12, color: theme.muted }} numberOfLines={2}>{n.body}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: theme.muted }}>{timeAgo(n.at)}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '80%', ...SHADOWS.card },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  noticeCard: { borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1 },
  notifItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  notifIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
