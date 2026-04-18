/**
 * Reusable UI primitives for the AETHER design system.
 * Each component accepts the theme object to support light/dark modes.
 */
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, Modal,
  Pressable, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GRADIENT, SHADOWS, RADIUS, FONT, useTheme, type Theme } from '../../constants/designTokens';

/* ── GradientCard ─────────────────────────────────────────── */
export function GradientCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <LinearGradient
      colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{
        borderRadius: RADIUS['3xl'],
        padding: 20,
        overflow: 'hidden',
        ...SHADOWS.glow,
      }, style]}
    >
      {/* Decorative blobs */}
      <View style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' }} />
      <View style={{ position: 'absolute', bottom: -40, left: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(236,72,153,0.25)' }} />
      {children}
    </LinearGradient>
  );
}

/* ── GradientButton ───────────────────────────────────────── */
export function GradientButton({ label, onPress, icon, style }: { label: string; onPress: () => void; icon?: string; style?: any }) {
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress}>
      <LinearGradient
        colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }}
        style={[{
          borderRadius: RADIUS.full,
          paddingVertical: 16,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...SHADOWS.glow,
        }, style]}
      >
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 14, letterSpacing: 3 }}>{label}</Text>
        {icon && (
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name={icon as any} size={16} color={GRADIENT.mid} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ── GradientIconCircle ───────────────────────────────────── */
export function GradientIconCircle({ icon, size = 44, iconSize = 20 }: { icon: string; size?: number; iconSize?: number }) {
  return (
    <LinearGradient
      colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow }}
    >
      <MaterialCommunityIcons name={icon as any} size={iconSize} color="#FFF" />
    </LinearGradient>
  );
}

/* ── QuickTile ────────────────────────────────────────────── */
export function QuickTile({ icon, label, onPress, theme }: { icon: string; label: string; onPress: () => void; theme: Theme }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: RADIUS.xl,
        padding: 12,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: theme.border,
        ...SHADOWS.soft,
      }}
    >
      <GradientIconCircle icon={icon} />
      <Text style={{ fontSize: 11, fontWeight: '600', color: theme.foreground }}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── SectionHeader ────────────────────────────────────────── */
export function SectionHeader({ label, title, trailing, theme, icon }: {
  label?: string; title: string; trailing?: { text: string; onPress: () => void }; theme: Theme; icon?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon && <MaterialCommunityIcons name={icon as any} size={16} color={theme.primary} />}
        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.foreground }}>{title}</Text>
      </View>
      {trailing && (
        <TouchableOpacity onPress={trailing.onPress}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: theme.primary }}>{trailing.text}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ── StatBadge ────────────────────────────────────────────── */
export function StatBadge({ value, label, theme }: { value: string; label: string; theme: Theme }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: RADIUS.xl,
      paddingVertical: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      ...SHADOWS.soft,
    }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: theme.primary }}>{value}</Text>
      <Text style={{ ...FONT.tiny, color: theme.muted, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

/* ── GlassCard ────────────────────────────────────────────── */
export function GlassCard({ children, theme, style }: { children: React.ReactNode; theme: Theme; style?: any }) {
  return (
    <View style={[{
      backgroundColor: theme.card,
      borderRadius: RADIUS['3xl'],
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      ...SHADOWS.card,
    }, style]}>
      {children}
    </View>
  );
}

/* ── BottomSheet ──────────────────────────────────────────── */
export function BottomSheet({ visible, onClose, children, theme }: {
  visible: boolean; onClose: () => void; children: React.ReactNode; theme: Theme;
}) {
  const slide = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }).start();
    } else {
      Animated.timing(slide, { toValue: Dimensions.get('window').height, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: theme.overlay, justifyContent: 'flex-end' }}>
        <Animated.View style={{ transform: [{ translateY: slide }] }}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={{
              backgroundColor: theme.card,
              borderTopLeftRadius: RADIUS['3xl'],
              borderTopRightRadius: RADIUS['3xl'],
              padding: 20,
              ...SHADOWS.glow,
              maxHeight: Dimensions.get('window').height * 0.8,
            }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/* ── RolePill ─────────────────────────────────────────────── */
export function RolePill({ label, icon, active, onPress, theme }: {
  label: string; icon: string; active: boolean; onPress: () => void; theme: Theme;
}) {
  if (active) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={{ flex: 1 }}>
        <LinearGradient
          colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.xl, paddingVertical: 12, alignItems: 'center', gap: 4, ...SHADOWS.glow }}
        >
          <MaterialCommunityIcons name={icon as any} size={16} color="#FFF" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      activeOpacity={0.8} onPress={onPress}
      style={{ flex: 1, backgroundColor: theme.secondary, borderRadius: RADIUS.xl, paddingVertical: 12, alignItems: 'center', gap: 4 }}
    >
      <MaterialCommunityIcons name={icon as any} size={16} color={theme.muted} />
      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.muted }}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── FilterChip ───────────────────────────────────────────── */
export function FilterChip({ label, active, onPress, theme }: { label: string; active: boolean; onPress: () => void; theme: Theme }) {
  if (active) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <LinearGradient
          colors={[GRADIENT.start, GRADIENT.mid, GRADIENT.end]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, ...SHADOWS.glow }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFF' }}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      activeOpacity={0.8} onPress={onPress}
      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: theme.card }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: theme.muted }}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── WelcomeBar ───────────────────────────────────────────── */
export function WelcomeBar({ roleLabel, name, initial, onBell, onLogout, theme, unread }: {
  roleLabel: string; name: string; initial: string; onBell: () => void; onLogout: () => void; theme: Theme; unread?: boolean;
}) {
  return (
    <View style={{
      backgroundColor: theme.card, borderRadius: RADIUS['3xl'], padding: 16,
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderWidth: 1, borderColor: theme.border, ...SHADOWS.card,
    }}>
      <GradientIconCircle icon="account" size={44} iconSize={22} />
      <View style={{ flex: 1 }}>
        <Text style={{ ...FONT.tiny, color: theme.muted }}>{roleLabel}</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.foreground }}>{name}</Text>
      </View>
      <TouchableOpacity onPress={onBell} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="bell-outline" size={16} color={theme.foreground} />
        {unread && <View style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: GRADIENT.end }} />}
      </TouchableOpacity>
      <TouchableOpacity onPress={onLogout} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="logout" size={16} color={theme.foreground} />
      </TouchableOpacity>
    </View>
  );
}
