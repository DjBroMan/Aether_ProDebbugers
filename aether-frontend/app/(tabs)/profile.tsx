import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import { GradientIconCircle, GlassCard, StatBadge } from '../../components/ui/AetherUI';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { icon: 'file-document-outline', title: 'Document Vault', desc: 'Marksheets, ID, certs' },
  { icon: 'bell-outline', title: 'Notifications', desc: 'Alerts & reminders' },
  { icon: 'shield-outline', title: 'Privacy & Security', desc: 'Sessions, devices' },
  { icon: 'weather-night', title: 'Appearance', desc: 'Theme & accent' },
  { icon: 'help-circle-outline', title: 'Help & Support', desc: 'FAQ, contact' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const displayName = user?.name ?? 'User';
  const initial = displayName[0]?.toUpperCase() ?? 'U';
  const roleLabel = user?.role === 'FACULTY' ? 'Faculty' : user?.role === 'ADMIN' ? 'Admin' : 'Student';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <GradientIconCircle icon="account" size={64} iconSize={30} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>{displayName}</Text>
          <Text style={{ fontSize: 12, color: theme.muted }}>{user?.email ?? 'user@aether.edu'}</Text>
          <View style={[s.roleBadge, { backgroundColor: theme.accent }]}>
            <MaterialCommunityIcons name="medal" size={12} color={theme.primary} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }}>{roleLabel}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <StatBadge value="92%" label="ATTEND." theme={theme} />
        <StatBadge value="8.7" label="GPA" theme={theme} />
        <StatBadge value="#12" label="RANK" theme={theme} />
      </View>

      {/* Menu */}
      <View style={[s.menu, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity key={item.title} style={[s.menuItem, idx < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]} activeOpacity={0.7}>
            <View style={[s.menuIcon, { backgroundColor: theme.accent }]}>
              <MaterialCommunityIcons name={item.icon as any} size={16} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.foreground }}>{item.title}</Text>
              <Text style={{ fontSize: 11, color: theme.muted }}>{item.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color={theme.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={logout} style={[s.logoutBtn, { backgroundColor: theme.card, borderColor: theme.border }]} activeOpacity={0.85}>
        <MaterialCommunityIcons name="logout" size={16} color={theme.destructive} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.destructive }}>Log out</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', fontSize: 10, letterSpacing: 3, fontWeight: '600', color: theme.muted, marginTop: 16, marginBottom: 30 }}>
        AETHER · v1.0 · Atmospheric Precision
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { borderRadius: RADIUS['3xl'], padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, ...SHADOWS.card },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  menu: { borderRadius: RADIUS['3xl'], overflow: 'hidden', borderWidth: 1, ...SHADOWS.card, marginTop: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutBtn: { borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderWidth: 1, ...SHADOWS.card, marginTop: 16 },
});
