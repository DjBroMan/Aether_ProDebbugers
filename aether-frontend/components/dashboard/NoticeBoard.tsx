import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NoticeBoard() {
  const notices = [
    { id: '1', title: 'Mid-Sem Exams Rescheduled', date: 'Oct 15', important: true },
    { id: '2', title: 'Faculty Meeting at 4 PM', date: 'Oct 12', important: false },
    { id: '3', title: 'Hackathon Registrations Open', date: 'Oct 10', important: false },
  ];

  return (
    <View className="bg-aether-surface rounded-2xl border border-aether-border p-4">
      {notices.map((notice, index) => (
        <View key={notice.id}>
            <View className="flex-row items-center py-3">
            <MaterialCommunityIcons 
                name={notice.important ? "alert-circle" : "bell"} 
                size={20} 
                color={notice.important ? "#F87171" : "#38BDF8"} 
            />
            <View className="ml-3 flex-1">
                <Text className="text-aether-text font-semibold">{notice.title}</Text>
                <Text className="text-aether-muted text-xs mt-1">{notice.date}</Text>
            </View>
            </View>
            {index < notices.length - 1 && <View className="h-[1px] bg-aether-border" />}
        </View>
      ))}
    </View>
  );
}
