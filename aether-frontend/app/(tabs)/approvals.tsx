import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';

export default function ApprovalsScreen() {
  const { user } = useAuthStore();
  const isFaculty = user?.role === 'PROFESSOR' || user?.role === 'HOD' || user?.role === 'PRINCIPAL';
  const [downloading, setDownloading] = useState(false);
  
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/approvals`, {
          headers: { Authorization: `Bearer ${user?.token || 'DEV_TOKEN'}` }
        });
        setApprovals(res.data);
      } catch (err) {
        console.error('Approvals fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, [user]);

  // Backend uses /advance and /reject, not a generic /status
  const advanceApproval = async (id: string) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/approvals/${id}/advance`, {}, {
        headers: { Authorization: `Bearer ${user?.token || 'DEV_TOKEN'}` }
      });
      setApprovals(prev => prev.map(a => a.id === id ? res.data : a));
      Alert.alert('Success', 'Approval advanced to next stage.');
    } catch (err) {
      Alert.alert('Error', 'Could not advance this approval.');
    }
  };

  const rejectApproval = async (id: string) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/approvals/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${user?.token || 'DEV_TOKEN'}` }
      });
      setApprovals(prev => prev.map(a => a.id === id ? res.data : a));
      Alert.alert('Rejected', 'Approval has been rejected.');
    } catch (err) {
      Alert.alert('Error', 'Could not reject this approval.');
    }
  };

  const createApproval = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/approvals`, {
        type: 'LEAVE',
        content: 'Requesting 3 days leave for hackathon in Bangalore.',
      }, {
        headers: { Authorization: `Bearer ${user?.token || 'DEV_TOKEN'}` }
      });
      setApprovals(prev => [res.data, ...prev]);
      Alert.alert('Created', 'Your leave request has been submitted to the Chain.');
    } catch (err) {
      Alert.alert('Error', 'Could not create approval request.');
    }
  };

  const downloadPdf = async (url: string) => {
    try {
      setDownloading(true);
      const filename = `Aether_Certificate_${Date.now()}.pdf`;
      const result = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + filename);
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.uri);
      } else {
        Alert.alert('Downloaded', `Saved to ${result.uri}`);
      }
    } catch (err) {
      Alert.alert('Download Failed', 'Could not fetch the document.');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return '#34D399';
    if (status === 'REJECTED') return '#F87171';
    return '#818CF8';
  };

  return (
    <View className="flex-1 bg-aether-bg">
      <View className="pt-16 pb-4 px-6 border-b border-aether-border bg-aether-surface">
        <Text className="text-aether-text text-3xl font-bold">Chain of Responsibility</Text>
        <Text className="text-aether-muted text-sm tracking-wide mt-1">Multi-stage document clearance</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-aether-text text-xl font-bold">
            {isFaculty ? 'Action Required' : 'Your Requests'}
          </Text>
          {!isFaculty && (
            <TouchableOpacity onPress={createApproval} className="bg-aether-primary px-4 py-2 rounded-xl flex-row items-center">
              <MaterialCommunityIcons name="plus" size={18} color="#0F172A" />
              <Text className="text-[#0F172A] ml-1 font-bold text-sm">New Request</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color="#38BDF8" size="large" className="mt-10" />
        ) : approvals.length === 0 ? (
          <View className="bg-aether-surface p-6 rounded-2xl border border-aether-border mb-6 items-center">
            <MaterialCommunityIcons name="check-all" size={48} color="#34D399" />
            <Text className="text-aether-text font-bold text-lg mt-4">All Clear!</Text>
            <Text className="text-aether-muted text-center mt-2">
              {isFaculty ? 'No pending approvals need your action.' : 'Tap"+ New Request" to submit a leave or certificate request.'}
            </Text>
          </View>
        ) : (
          approvals.map((item) => (
            <View key={item.id} className="bg-aether-surface p-5 rounded-2xl border border-aether-border mb-4">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row gap-3 items-center">
                  <View className="p-2 rounded-lg">
                    <MaterialCommunityIcons name="file-document" size={24} color="#38BDF8" />
                  </View>
                  <View>
                    <Text className="text-aether-text font-bold text-lg">{item.type}</Text>
                    <Text className="text-aether-muted text-sm">{item.requester?.name || user?.name}</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: `${getStatusColor(item.status)}20` }} className="px-3 py-1 rounded-full">
                  <Text style={{ color: getStatusColor(item.status) }} className="font-bold text-xs uppercase tracking-wide">{item.status.replace(/_/g, ' ')}</Text>
                </View>
              </View>

              <Text className="text-aether-muted mb-6 leading-relaxed">
                {item.content || 'No additional details provided.'}
              </Text>

              {isFaculty && !['COMPLETED', 'REJECTED'].includes(item.status) ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity onPress={() => advanceApproval(item.id)} className="flex-1 bg-aether-accent p-4 rounded-xl flex-row justify-center items-center">
                    <MaterialCommunityIcons name="check-circle-outline" size={20} color="#0F172A" />
                    <Text className="text-[#0F172A] ml-2 font-bold text-base">Advance</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => rejectApproval(item.id)} className="flex-1 bg-transparent border border-aether-danger p-4 rounded-xl flex-row justify-center items-center">
                    <MaterialCommunityIcons name="close-circle-outline" size={20} color="#F87171" />
                    <Text className="text-aether-danger ml-2 font-bold text-base">Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : item.status === 'COMPLETED' && item.pdfUrl ? (
                <TouchableOpacity 
                  className="border border-aether-primary p-4 rounded-xl flex-row justify-center items-center"
                  onPress={() => downloadPdf(item.pdfUrl)}
                  disabled={downloading}
                >
                  <MaterialCommunityIcons name="cloud-download-outline" size={20} color="#38BDF8" />
                  <Text className="text-aether-primary ml-2 font-bold text-base">
                    {downloading ? 'Extracting...' : 'Download Certificate'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-aether-bg p-4 rounded-xl border border-aether-border flex-row items-center">
                  <MaterialCommunityIcons 
                    name={item.status === 'COMPLETED' ? 'check-circle' : item.status === 'REJECTED' ? 'close-circle' : 'timeline-clock-outline'} 
                    size={24} 
                    color={getStatusColor(item.status)} 
                  />
                  <Text className="text-aether-text ml-3 font-medium flex-1">
                    {item.status === 'REJECTED' ? 'This request was rejected.' : 'Waiting on clearance...'}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
