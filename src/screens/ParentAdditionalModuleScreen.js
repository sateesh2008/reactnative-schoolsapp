import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = { ink: '#17343B', muted: '#6A7F83', line: '#D9E7E4', white: '#FFFFFF', canvas: '#F4F8F6', blue: '#0D8B82', paleBlue: '#E5F4F0' };

const moduleContent = {
  'Student Profile': { icon: 'person-circle-outline', empty: 'Student profile information is not available.' },
  Transport: { icon: 'bus-outline', empty: 'Transport details are not currently available.' },
  'Messaging / Notifications': { icon: 'megaphone-outline', empty: 'No messages or notifications available.' },
  Events: { icon: 'school-outline', empty: 'No events available.' },
  Leave: { icon: 'create-outline', empty: 'No leave information available.' },
  Documents: { icon: 'document-text-outline', empty: 'No documents available.' },
};

export default function ParentAdditionalModuleScreen({ title, selectedStudent, onBack }) {
  const content = moduleContent[title] || { icon: 'information-circle-outline', empty: 'Information is not available.' };
  return <View style={styles.container}><Pressable style={styles.back} onPress={onBack}><Ionicons name="arrow-back" size={18} color={colors.blue} /><Text style={styles.backText}>Back Home</Text></Pressable><View style={styles.heading}><Ionicons name={content.icon} size={28} color={colors.blue} /><View style={{ flex: 1 }}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>Parent Mobile View</Text></View></View><View style={styles.studentCard}><Text style={styles.studentLabel}>Selected Student</Text><Text style={styles.studentName}>{selectedStudent?.name || 'Student'}</Text><Text style={styles.studentClass}>{selectedStudent?.className || 'Student information unavailable'}{selectedStudent?.section ? ` · Section ${selectedStudent.section}` : ''}</Text></View><View style={styles.emptyCard}><Text style={styles.emptyTitle}>{content.empty}</Text><Text style={styles.emptyText}>This module is ready for parent-scoped API integration.</Text></View></View>;
}

const styles = StyleSheet.create({ container: { backgroundColor: colors.canvas, paddingBottom: 24 }, back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 }, backText: { color: colors.blue, fontSize: 12, fontWeight: '900' }, heading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }, title: { color: colors.ink, fontSize: 22, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 11, marginTop: 3 }, studentCard: { backgroundColor: colors.navy, borderRadius: 12, padding: 14, marginBottom: 14 }, studentLabel: { color: '#B8D0EC', fontSize: 10, fontWeight: '800' }, studentName: { color: colors.white, fontSize: 17, fontWeight: '900', marginTop: 4 }, studentClass: { color: '#B8D0EC', fontSize: 11, marginTop: 3 }, emptyCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 20 }, emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' }, emptyText: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 7 } });
