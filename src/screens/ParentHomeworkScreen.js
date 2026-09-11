import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { ApiError } from '../services/api';
import { homeworkApi } from '../services/homeworkApi';

const colors = {
  ink: Colors.light.text,
  muted: Colors.light.textSecondary,
  line: '#D9E7E4',
  white: '#FFFFFF',
  canvas: '#F4F8F6',
  blue: '#0D8B82',
  paleBlue: '#E5F4F0',
  green: '#1E8E5E',
  paleGreen: '#E8F8F1',
  orange: '#A76E00',
  paleOrange: '#FFF7DF',
  red: '#B94E4E',
};

const filters = ['All', 'Active', 'Overdue'];

function Icon({ name, size = 18, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function HomeworkCard({ assignment }) {
  const router = useRouter();
  const params = encodeURIComponent(JSON.stringify(assignment));
  const isOverdue = assignment.status === 'Overdue';
  return <View style={styles.card}>
    <View style={styles.cardHeader}><View style={styles.subjectWrap}><View style={styles.subjectIcon}><Icon name="book-outline" size={16} color={colors.blue} /></View><View style={styles.subjectCopy}><Text style={styles.subject}>{assignment.subject}</Text><Text style={styles.topic}>{assignment.topic}</Text></View></View><View style={[styles.statusBadge, isOverdue ? styles.overdueBadge : styles.activeBadge]}><Text style={[styles.statusText, isOverdue ? styles.overdueText : styles.activeText]}>{assignment.status}</Text></View></View>
    <View style={styles.dateRow}><View><Text style={styles.label}>Assigned</Text><Text style={styles.value}>{assignment.assignedDate}</Text></View><View><Text style={styles.label}>Due Date</Text><Text style={styles.value}>{assignment.dueDate}</Text></View></View>
    <View style={styles.actionRow}><Text style={styles.label}>Material</Text><Pressable style={styles.outlineButton} onPress={() => router.push(`/homework-details?assignment=${params}`)}><Text style={styles.outlineButtonText}>Details</Text></Pressable><Text style={[styles.label, styles.actionLabel]}>Status / Action</Text><Pressable style={styles.primaryButton} onPress={() => router.push(`/homework-submission?assignment=${params}`)}><Text style={styles.primaryButtonText}>Submit</Text></Pressable></View>
  </View>;
}

export default function ParentHomeworkScreen({ session, onSessionExpired }) {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAssignments = () => {
    setLoading(true);
    setError('');
    return homeworkApi.getAssignments(session).then(setAssignments).catch((requestError) => {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to load homework. Please try again later.');
      if (requestError.status === 401) onSessionExpired?.();
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAssignments(); }, [session, onSessionExpired]);

  const visibleAssignments = useMemo(() => filter === 'All' ? assignments : assignments.filter((assignment) => assignment.status === filter), [assignments, filter]);

  return <View style={styles.container}>
    <View style={styles.heading}><Text style={styles.title}>Homework</Text><Text style={styles.subtitle}>Parent Mobile View</Text></View>
    <View style={styles.intro}><Text style={styles.introTitle}>Homework & Assignments</Text><Text style={styles.introText}>Track, preview and submit active homework</Text></View>
    <View style={styles.filters}>{filters.map((item) => <Pressable key={item} style={[styles.filter, filter === item && styles.filterActive]} onPress={() => setFilter(item)}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>
    {loading ? <View style={styles.loading}><ActivityIndicator color={colors.blue} /><Text style={styles.loadingText}>Loading homework...</Text></View> : error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={loadAssignments}><Text style={styles.retryText}>Try again</Text></Pressable></View> : visibleAssignments.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No homework found</Text><Text style={styles.emptyText}>There are no records for this filter.</Text></View> : visibleAssignments.map((assignment) => <HomeworkCard key={assignment.id} assignment={assignment} />)}
  </View>;
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.canvas, paddingBottom: 20 }, heading: { marginBottom: 16 }, title: { color: colors.ink, fontSize: 22, fontWeight: '900' }, subtitle: { color: colors.muted, fontSize: 12, marginTop: 4 }, intro: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, marginBottom: 12 }, introTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' }, introText: { color: colors.muted, fontSize: 12, marginTop: 5 }, filters: { flexDirection: 'row', gap: 8, marginBottom: 14 }, filter: { flex: 1, minHeight: 40, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 9, justifyContent: 'center', alignItems: 'center' }, filterActive: { backgroundColor: colors.blue, borderColor: colors.blue }, filterText: { color: colors.muted, fontSize: 12, fontWeight: '800' }, filterTextActive: { color: colors.white }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 13, marginBottom: 10 }, cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, subjectWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 }, subjectIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' }, subjectCopy: { flex: 1 }, subject: { color: colors.blue, fontSize: 11, fontWeight: '900' }, topic: { color: colors.ink, fontSize: 14, fontWeight: '900', marginTop: 3 }, statusBadge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 }, statusText: { fontSize: 9, fontWeight: '900' }, activeBadge: { backgroundColor: colors.paleGreen, borderColor: '#B6E7D0' }, activeText: { color: colors.green }, overdueBadge: { backgroundColor: colors.paleOrange, borderColor: '#F5D98B' }, overdueText: { color: colors.orange }, dateRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line, marginTop: 13, paddingTop: 11 }, label: { color: colors.muted, fontSize: 10, fontWeight: '700' }, value: { color: colors.ink, fontSize: 12, fontWeight: '800', marginTop: 3 }, actionRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 11, paddingTop: 11 }, actionLabel: { marginLeft: 'auto' }, outlineButton: { borderWidth: 1, borderColor: colors.blue, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }, outlineButtonText: { color: colors.blue, fontSize: 10, fontWeight: '900' }, primaryButton: { backgroundColor: colors.blue, borderRadius: 8, paddingHorizontal: 11, paddingVertical: 8 }, primaryButtonText: { color: colors.white, fontSize: 10, fontWeight: '900' }, loading: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 8 }, loadingText: { color: colors.muted, fontSize: 12 }, errorBox: { backgroundColor: '#FDECEC', borderRadius: 10, padding: 14, alignItems: 'center' }, errorText: { color: colors.red, fontSize: 11, textAlign: 'center' }, retryText: { color: colors.blue, fontSize: 12, fontWeight: '900', marginTop: 8 }, empty: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 22, alignItems: 'center' }, emptyTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' }, emptyText: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
