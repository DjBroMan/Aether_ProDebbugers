import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Audio } from 'expo-av';
import { API_BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';

type Message = { id: string; text: string; sender: 'user' | 'ai'; source?: string; isVoice?: boolean };

export default function CopilotScreen() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am your Aether AI Campus Copilot. How can I assist you with your schedule, approvals, or tasks today?', sender: 'ai' }
  ]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const { user } = useAuthStore();

  const handleSend = async (forcedText?: string) => {
    const activeText = forcedText || query;
    if (!activeText.trim()) return;
    
    const newMsg: Message = { id: Date.now().toString(), text: activeText, sender: 'user', isVoice: !!forcedText };
    setMessages(prev => [...prev, newMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/ai/query`,
        { prompt: newMsg.text },
        { headers: { Authorization: `Bearer ${user?.token || 'DEV_TOKEN'}` }, timeout: 30000 } 
      );
      setMessages(prev => [...prev, { id: Date.now().toString(), text: res.data.answer, sender: 'ai', source: res.data.source }]);
    } catch (e: any) {
      const errMsg = e?.response?.data?.error || 'AI service is temporarily unreachable. The backend may need a restart.';
      setMessages(prev => [...prev, { id: Date.now().toString(), text: errMsg, sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    // In full prod, we would upload this URI. To mock backend STT here:
    handleSend('When is my next Class? [Parsed via Voice]');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-aether-bg">
      <View className="pt-16 pb-4 px-6 border-b border-aether-border bg-aether-surface">
        <Text className="text-aether-text text-2xl font-bold">Aether Copilot</Text>
        <Text className="text-aether-primary text-sm tracking-wide font-medium">✨ Powered by Triple-Fallback AI</Text>
      </View>

      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map(msg => (
          <View key={msg.id} className={`max-w-[85%] rounded-2xl p-4 mb-4 ${msg.sender === 'user' ? 'bg-aether-primary self-end rounded-tr-sm' : 'bg-aether-surface self-start rounded-tl-sm border border-aether-border'}`}>
            <Text className={`text-base ${msg.sender === 'user' ? 'text-aether-bg font-medium' : 'text-aether-text'}`}>
              {msg.isVoice ? '🎙️ ' : ''}{msg.text}
            </Text>
            {msg.source && (
              <Text className="text-xs text-aether-muted mt-2">
                Processed via: {msg.source}
              </Text>
            )}
          </View>
        ))}
        {loading && (
          <View className="bg-aether-surface self-start rounded-2xl rounded-tl-sm border border-aether-border p-4 mb-4 flex-row items-center">
            <ActivityIndicator color="#38BDF8" size="small" />
            <Text className="text-aether-muted ml-3">Synthesizing context...</Text>
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-aether-surface border-t border-aether-border flex-row items-center gap-3">
        <TextInput
          className="flex-1 bg-aether-bg text-aether-text px-5 py-4 rounded-full border border-aether-border text-base"
          placeholder="Ask about your campus life..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSend()}
        />
        
        {query.trim() === '' ? (
          <TouchableOpacity 
            className={`w-14 h-14 rounded-full items-center justify-center ${recording ? 'bg-aether-danger' : 'bg-aether-surface border border-aether-border'}`}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={loading}
          >
            <MaterialCommunityIcons name="microphone" size={24} color={recording ? '#0F172A' : '#38BDF8'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="bg-aether-primary w-14 h-14 rounded-full items-center justify-center"
            onPress={() => handleSend()}
            disabled={loading}
          >
            <MaterialCommunityIcons name="send" size={24} color="#0F172A" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
