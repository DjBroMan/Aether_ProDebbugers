import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCampusStore } from '../../store/campusStore';
import { useTheme, RADIUS, SHADOWS, GRADIENT } from '../../constants/designTokens';
import { LinearGradient } from 'expo-linear-gradient';

export function ToastNotification() {
  const { activePopup, setActivePopup } = useCampusStore();
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (activePopup) {
      Animated.spring(slideAnim, {
        toValue: 50, // slide down to 50px from top
        useNativeDriver: true,
        damping: 15,
        stiffness: 150
      }).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [activePopup]);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setActivePopup(null);
    });
  };

  if (!activePopup) return null;

  const iconName = activePopup.kind === 'approval' ? 'check-decagram' : 
                   activePopup.kind === 'ticket' ? 'wrench' : 'bell';

  return (
    <Animated.View style={{
      position: 'absolute',
      top: 0,
      left: 20,
      right: 20,
      transform: [{ translateY: slideAnim }],
      zIndex: 9999,
      ...SHADOWS.glow,
    }}>
      <LinearGradient
        colors={[GRADIENT.start, GRADIENT.mid]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{
          borderRadius: RADIUS.xl,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <MaterialCommunityIcons name={iconName as any} size={20} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 15 }}>{activePopup.title}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>{activePopup.body}</Text>
        </View>
        <TouchableOpacity onPress={dismiss} style={{ padding: 4 }}>
          <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}
