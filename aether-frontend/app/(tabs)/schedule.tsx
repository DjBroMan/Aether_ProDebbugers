import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCampusStore } from '../../store/campusStore';

const days = [
  { d: 'MON', n: 18 }, { d: 'TUE', n: 19 }, { d: 'WED', n: 20 },
  { d: 'THU', n: 21 }, { d: 'FRI', n: 22 }, { d: 'SAT', n: 23 },
];
const hours = Array.from({ length: 11 }, (_, i) => 8 + i);
const ROOMS = ['A-104', 'A-201', 'B-105', 'B-201', 'Lab-2', 'Lab-3', 'C-310', 'Auditorium'];

export default function ScheduleScreen() {
  const [active, setActive] = useState(0);
  const [creating, setCreating] = useState(false);
  const { schedule, addScheduleEvent, detectClashes, suggestFreeSlot, roomAvailability } = useCampusStore();

  const events = useMemo(() => schedule.filter((e) => e.day === active), [schedule, active]);
  const clashes = useMemo(() => detectClashes(active), [schedule, active]);
  const rooms = useMemo(() => roomAvailability(), [schedule]);

  const firstClash = events.find((e) => clashes.has(e.id));
  const suggestion = firstClash ? suggestFreeSlot(active, firstClash.room, firstClash.span) : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F5FF' }}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E1040' }}>Schedule</Text>
          <Text style={{ fontSize: 11, color: '#A394C0' }}>Conflict-aware timetable</Text>
        </View>
        <TouchableOpacity onPress={() => setCreating(true)}>
          <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} style={s.addBtn}>
            <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Day selector */}
        <View style={s.dayRow}>
          <TouchableOpacity style={s.navBtn}>
            <MaterialCommunityIcons name="chevron-left" size={18} color="#A394C0" />
          </TouchableOpacity>
          {days.map((d, i) => (
            <TouchableOpacity key={d.d} onPress={() => setActive(i)} style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 16, overflow: 'hidden' }}>
              {active === i ? (
                <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} style={{ ...StyleSheet.absoluteFillObject, borderRadius: 16 }} />
              ) : null}
              <Text style={{ fontSize: 10, fontWeight: '700', color: active === i ? '#FFF' : '#6B5B8A', letterSpacing: 1 }}>{d.d}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: active === i ? '#FFF' : '#1E1040' }}>{d.n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.navBtn}>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#A394C0" />
          </TouchableOpacity>
        </View>

        {/* Clash banner */}
        {clashes.size > 0 && (
          <View style={s.clashBanner}>
            <MaterialCommunityIcons name="alert" size={20} color="#EC4899" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E1040' }}>{clashes.size} clash{clashes.size === 1 ? '' : 'es'} detected</Text>
              <Text style={{ fontSize: 11, color: '#6B5B8A' }}>Same room booked in overlapping slots.</Text>
            </View>
          </View>
        )}

        {/* Timetable */}
        <View style={s.timetable}>
          {hours.map((h) => (
            <View key={h} style={s.hourRow}>
              <Text style={{ width: 44, fontSize: 11, color: '#A394C0', fontWeight: '600' }}>{h}:00</Text>
              <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: '#E4DCF0' }} />
            </View>
          ))}
          {events.map((e) => {
            const isClash = clashes.has(e.id);
            const isPending = e.status === 'pending';
            return (
              <View key={e.id} style={[s.eventBlock, { top: (e.startHour - 8 + 1) * 56 - 4, height: e.span * 56 - 8, left: 50, right: 8, opacity: isPending ? 0.6 : 1 }]}>
                <LinearGradient
                  colors={isPending ? ['#CCCCCC', '#AAAAAA'] : isClash ? ['#EC4899', '#EF4444'] : ['#5B7FFF', '#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF' }}>{e.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MaterialCommunityIcons name="map-marker-outline" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{e.room}</Text>
                    </View>
                  </View>
                  {isPending && (
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#FFF' }}>PENDING</Text>
                    </View>
                  )}
                  {isClash && !isPending && (
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#FFF' }}>CLASH</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Smart suggestion */}
        {firstClash && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="creation" size={22} color="#FFF" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E1040' }}>Suggested resolution</Text>
                <Text style={{ fontSize: 12, color: '#6B5B8A' }}>
                  Move "{firstClash.title}" to {suggestion ? `${suggestion}:00` : 'another room'} · {suggestion ? 'zero conflicts.' : 'try a different room.'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Live Room Status */}
        <View style={s.card}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E1040', marginBottom: 12 }}>Live Room Status</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {rooms.map((x) => (
              <View key={x.room} style={[s.roomCard, { backgroundColor: '#F0ECF6' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E1040' }}>{x.room}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: x.status === 'Free' ? 'rgba(124,58,237,0.15)' : 'rgba(236,72,153,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                    <MaterialCommunityIcons name="circle" size={6} color={x.status === 'Free' ? '#7C3AED' : '#EC4899'} />
                    <Text style={{ fontSize: 9, fontWeight: '700', color: x.status === 'Free' ? '#7C3AED' : '#EC4899' }}>{x.status}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#6B5B8A', marginTop: 4 }}>
                  {x.status === 'Occupied' ? `Free at ${x.freeAt}` : `Until ${x.until}`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Event Modal */}
      <Modal visible={creating} transparent animationType="slide">
        <NewEventModal day={active} onClose={() => setCreating(false)} />
      </Modal>
    </View>
  );
}

function NewEventModal({ day, onClose }: { day: number; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('A-104');
  const [startHour, setStartHour] = useState(14);
  const [span, setSpan] = useState(1);
  const { addScheduleEvent, suggestFreeSlot, schedule } = useCampusStore();

  // Find booked times for the selected room on this day
  const approvedHours = new Set<number>();
  const pendingHours = new Set<number>();
  
  const filteredEvents = schedule.filter((e) => e.day === day && e.room === room);
  
  filteredEvents.forEach((e) => {
    for (let i = e.startHour; i < e.startHour + e.span; i++) {
      if (e.status === 'approved') {
        approvedHours.add(i);
      } else if (e.status === 'pending') {
        pendingHours.add(i);
      }
    }
  });

  const bookedHours = new Set([...approvedHours, ...pendingHours]);

  // Check if a time slot with span would conflict
  const isTimeAvailable = (hour: number, duration: number) => {
    for (let i = hour; i < hour + duration; i++) {
      if (bookedHours.has(i)) return false;
    }
    return true;
  };

  const canSelectTime = isTimeAvailable(startHour, span);

  const submit = () => {
    if (!title.trim() || !canSelectTime) return;
    addScheduleEvent({ title: title.trim(), room, day, startHour, span, kind: 'event' });
    onClose();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(30,16,64,0.4)', justifyContent: 'flex-end' }}>
      <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, elevation: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#A394C0', letterSpacing: 2 }}>NEW EVENT</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E1040' }}>Book a room / add to timetable</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0ECF6', alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="close" size={18} color="#1E1040" />
          </TouchableOpacity>
        </View>

        <TextInput value={title} onChangeText={setTitle} placeholder="Event title" placeholderTextColor="#A394C0"
          style={{ backgroundColor: '#F0ECF6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1E1040', marginBottom: 8 }} />

        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {ROOMS.map((r) => (
              <TouchableOpacity key={r} onPress={() => setRoom(r)}>
                {room === r ? (
                  <LinearGradient colors={['#5B7FFF', '#8B5CF6', '#EC4899']} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>{r}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F0ECF6' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B5B8A' }}>{r}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {hours.map((h) => {
              const isApproved = approvedHours.has(h);
              const isPending = pendingHours.has(h);
              const isBooked = isApproved || isPending;
              return (
                <TouchableOpacity 
                  key={h} 
                  onPress={() => !isBooked && setStartHour(h)}
                  disabled={isBooked}
                  activeOpacity={isBooked ? 1 : 0.7}
                >
                  {isApproved ? (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: '#EF4444' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF4444' }}>{h}:00</Text>
                    </View>
                  ) : isPending ? (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(169,169,169,0.2)', borderWidth: 1, borderColor: '#A9A9A9' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#A9A9A9' }}>{h}:00</Text>
                    </View>
                  ) : startHour === h ? (
                    <LinearGradient colors={['#5B7FFF', '#8B5CF6']} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>{h}:00</Text>
                    </LinearGradient>
                  ) : (
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F0ECF6' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B5B8A' }}>{h}:00</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3].map((h) => (
            <TouchableOpacity key={h} onPress={() => setSpan(h)} style={{ flex: 1 }}>
              {span === h ? (
                <LinearGradient colors={['#5B7FFF', '#8B5CF6']} style={{ paddingVertical: 8, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFF' }}>{h}h</Text>
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 8, borderRadius: 12, alignItems: 'center', backgroundColor: '#F0ECF6' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B5B8A' }}>{h}h</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Status indicator */}
        <View style={{ backgroundColor: canSelectTime ? '#EDE6FA' : 'rgba(239,68,68,0.1)', borderRadius: 16, padding: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="circle" size={8} color={canSelectTime ? '#7C3AED' : '#EF4444'} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: canSelectTime ? '#7C3AED' : '#EF4444' }}>
            {canSelectTime ? `${room} is free at ${startHour}:00 for ${span}h` : 'This time slot is booked'}
          </Text>
        </View>

        <TouchableOpacity onPress={submit} activeOpacity={0.9}>
          <LinearGradient 
            colors={canSelectTime && title.trim() ? ['#5B7FFF', '#8B5CF6', '#EC4899'] : ['#CCCCCC', '#AAAAAA']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }} 
            style={s.submitFull}
          >
            <MaterialCommunityIcons name="send" size={18} color="#FFF" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFF', letterSpacing: 1 }}>ADD EVENT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E4DCF0' },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 8, elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, marginBottom: 16 },
  navBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  clashBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(236,72,153,0.1)', borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)', borderRadius: 16, padding: 12, marginBottom: 16 },
  timetable: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 12, elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, marginBottom: 16, position: 'relative' as const },
  hourRow: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, height: 56 },
  eventBlock: { position: 'absolute' as const, borderRadius: 16, padding: 10, overflow: 'hidden', elevation: 4, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, marginBottom: 16, elevation: 4, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  roomCard: { width: '47%' as any, borderRadius: 16, padding: 12 },
  submitFull: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, borderRadius: 28, paddingVertical: 14, elevation: 4 },
});
