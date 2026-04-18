import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ApprovalList({ level }: { level: number }) {
  // Mock data for approvals based on level
  const approvals = [
    { id: '1', type: 'Leave Request', student: 'John Doe', status: 'Pending L1' },
    { id: '2', type: 'Event Budget', student: 'CS Club', status: 'Pending L2' },
    { id: '3', type: 'Campus Drive', student: 'Placement Cell', status: 'Pending L3' },
  ].filter(a => {
      if (level === 1) return a.status === 'Pending L1';
      if (level === 2) return a.status === 'Pending L2';
      if (level === 3) return a.status === 'Pending L3';
      return false;
  });

  if (approvals.length === 0) {
      return (
          <View className="bg-aether-surface p-4 rounded-xl border border-aether-border items-center">
              <Text className="text-aether-muted italic">No pending approvals for your level.</Text>
          </View>
      );
  }

  return (
    <View className="gap-3">
        {approvals.map(approval => (
            <View key={approval.id} className="bg-aether-surface p-4 rounded-xl border border-aether-border flex-row justify-between items-center">
                <View>
                    <Text className="text-aether-text font-bold text-lg">{approval.type}</Text>
                    <Text className="text-aether-muted">{approval.student}</Text>
                </View>
                <TouchableOpacity className="bg-aether-primary px-4 py-2 rounded-lg">
                    <Text className="text-white font-bold">Review</Text>
                </TouchableOpacity>
            </View>
        ))}
    </View>
  );
}
