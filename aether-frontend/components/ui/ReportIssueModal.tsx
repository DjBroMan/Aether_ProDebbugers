import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheet, GradientButton, GlassCard } from './AetherUI';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, RADIUS, FONT } from '../../constants/designTokens';
import { useCampusStore } from '../../store/campusStore';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';

export function ReportIssueModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const pushNotification = useCampusStore((s) => s.pushNotification);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const submitIssue = async () => {
    if (!title || !location) {
      alert("Title and Location are required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('location', location);
      
      if (image) {
        // @ts-ignore
        formData.append('image', {
          uri: image.uri,
          name: 'issue.jpg',
          type: 'image/jpeg',
        });
      }

      await axios.post(`${API_BASE_URL}/api/tickets`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
          'x-mock-role': user?.role,
        },
      });

      pushNotification({ title: 'Issue Reported', body: title, to: 'me', kind: 'ticket' });
      setTitle('');
      setDescription('');
      setLocation('');
      setImage(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to report issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} theme={theme}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.foreground, marginBottom: 16 }}>Report an Issue</Text>
      
      <GlassCard theme={theme} style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
        <TouchableOpacity onPress={pickImage} style={{ height: 120, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' }}>
          {image ? (
            <Image source={{ uri: image.uri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <>
              <MaterialCommunityIcons name="camera-plus" size={32} color={theme.muted} />
              <Text style={{ ...FONT.tiny, color: theme.muted, marginTop: 8 }}>Add Photo Evidence</Text>
            </>
          )}
        </TouchableOpacity>
      </GlassCard>

      <Text style={{ ...FONT.tiny, color: theme.primary, marginBottom: 4 }}>ISSUE TITLE *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.secondary, color: theme.foreground, borderColor: theme.border }]}
        placeholder="e.g. Broken Projector"
        placeholderTextColor={theme.muted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={{ ...FONT.tiny, color: theme.primary, marginBottom: 4, marginTop: 12 }}>LOCATION *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.secondary, color: theme.foreground, borderColor: theme.border }]}
        placeholder="e.g. Room A-104"
        placeholderTextColor={theme.muted}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={{ ...FONT.tiny, color: theme.primary, marginBottom: 4, marginTop: 12 }}>DESCRIPTION</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.secondary, color: theme.foreground, borderColor: theme.border, height: 80 }]}
        placeholder="Provide additional details..."
        placeholderTextColor={theme.muted}
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />

      <View style={{ marginTop: 24 }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <GradientButton label="SUBMIT REPORT" onPress={submitIssue} icon="send" />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: 12,
    fontSize: 15,
  }
});
