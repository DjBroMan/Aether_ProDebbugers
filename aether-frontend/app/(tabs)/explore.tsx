import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, GRADIENT, SHADOWS, RADIUS, FONT } from '../../constants/designTokens';
import { GradientCard, GradientIconCircle, GlassCard, GradientButton, SectionHeader } from '../../components/ui/AetherUI';
import { useCampusStore } from '../../store/campusStore';

const ICONS: Record<string, string> = {
  coffee: 'coffee',
  'flask-conical': 'flask',
  library: 'book-open-variant',
  bus: 'bus',
  'heart-pulse': 'heart-pulse',
  users: 'account-group',
};

export default function ExploreScreen() {
  const theme = useTheme();
  const { miniApps, toggleMiniApp } = useCampusStore();
  const installedCount = miniApps.filter((a) => a.installed).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <GradientCard>
        <View style={{ zIndex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MaterialCommunityIcons name="creation" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={{ fontSize: 10, letterSpacing: 3, fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>API-FIRST</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 8 }}>One shell.{'\n'}Endless mini-apps.</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>{installedCount} of {miniApps.length} installed · Sandboxed permissions</Text>
        </View>
      </GradientCard>

      {/* App grid */}
      <View style={s.grid}>
        {miniApps.map((app) => {
          const iconName = ICONS[app.icon] ?? 'creation';
          return (
            <View key={app.id} style={[s.appCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <GradientIconCircle icon={iconName} size={44} iconSize={20} />
                {app.installed && (
                  <View style={[s.onBadge, { backgroundColor: theme.accent }]}>
                    <MaterialCommunityIcons name="check-circle" size={10} color={theme.primary} />
                    <Text style={{ fontSize: 9, fontWeight: '700', color: theme.primary }}>ON</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.foreground, marginTop: 12 }}>{app.name}</Text>
              <Text style={{ fontSize: 11, color: theme.muted, marginTop: 2, flex: 1 }}>{app.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <MaterialCommunityIcons name="shield-check" size={10} color={theme.muted} />
                <Text style={{ fontSize: 9, color: theme.muted }} numberOfLines={1}>{app.permissions.join(' · ')}</Text>
              </View>
              {app.installed ? (
                <TouchableOpacity onPress={() => toggleMiniApp(app.id)} style={[s.installBtn, { backgroundColor: theme.secondary }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted }}>Uninstall</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => toggleMiniApp(app.id)} activeOpacity={0.9}>
                  <LinearGradient
                    colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[s.installBtn, SHADOWS.glow]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>Install</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* Build your own */}
      <GlassCard theme={theme} style={{ marginTop: 16, marginBottom: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <GradientIconCircle icon="plus" size={44} iconSize={22} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: theme.foreground }}>Build your own mini-app</Text>
            <Text style={{ fontSize: 11, color: theme.muted }}>REST + webhook bridge · Manifest v1</Text>
          </View>
          <View style={{ backgroundColor: theme.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }}>DEV</Text>
          </View>
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  appCard: { width: '47.5%', borderRadius: RADIUS.xl, padding: 12, borderWidth: 1, ...SHADOWS.soft },
  onBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  installBtn: { borderRadius: RADIUS.full, paddingVertical: 8, alignItems: 'center', marginTop: 12 },
});
