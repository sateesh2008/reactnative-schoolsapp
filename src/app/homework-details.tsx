import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { homeworkApi } from '../services/homeworkApi';

const colors = { ink: '#17343B', muted: '#6A7F83', line: '#D9E7E4', white: '#FFFFFF', canvas: '#F4F8F6', blue: '#0D8B82', paleBlue: '#E5F4F0', green: '#1E8E5E', paleGreen: '#E8F8F1', orange: '#A76E00', paleOrange: '#FFF7DF', red: '#B94E4E' };

type HomeworkAssignment = {
  id?: number;
  subject?: string;
  topic?: string;
  assignedDate?: string;
  dueDate?: string;
  className?: string;
  schoolName?: string;
  instructor?: string;
  instructions?: string;
  status?: string;
  submissionStatus?: string;
  target_student_id?: number;
  attachment_url?: string | null;
  description?: string;
  teacher?: string;
  title?: string;
};

const parseAssignment = (value: string | string[] | undefined): HomeworkAssignment | null => {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(String(value)));
  } catch {
    return null;
  }
};

const buildShareMessage = (item: HomeworkAssignment) => `${item.subject} - ${item.topic}\nClass: ${item.className}\nAssigned: ${item.assignedDate}\nSubmission due: ${item.dueDate}`;

const displayDate = (value: string | undefined) => {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return value || 'Not available';
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[2]) - 1];
  return `${match[1]} ${month} ${match[3]}`;
};

export default function HomeworkDetailsRoute() {
  const router = useRouter();
  const { assignment } = useLocalSearchParams<{ assignment?: string }>();
  const item = parseAssignment(assignment);
  const [homework, setHomework] = useState<HomeworkAssignment | null>(item);
  const [loading, setLoading] = useState(Boolean(item?.id));
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    let active = true;
    const loadHomework = async () => {
      const authenticated = await homeworkApi.fetchHomeworkById(item.id);
      const result = authenticated.success ? authenticated : await homeworkApi.fetchPublicHomework(item.id);
      if (!active) return;
      if (result.success) setHomework(result.data as HomeworkAssignment);
      else setError(result.error || 'Unable to load homework details.');
      setLoading(false);
    };
    void loadHomework();
    return () => { active = false; };
  }, [item?.id]);

  if (!item) {
    return <SafeAreaView style={styles.safe}><View style={styles.notFound}><Text style={styles.notFoundTitle}>Homework not found</Text><Pressable style={styles.primaryButton} onPress={() => router.back()}><Text style={styles.primaryButtonText}>Return to Homework</Text></Pressable></View></SafeAreaView>;
  }

  const source = homework || item;
  if (loading) return <SafeAreaView style={styles.safe}><View style={styles.notFound}><ActivityIndicator color={colors.blue} /><Text style={styles.body}>Loading homework details...</Text></View></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.safe}><View style={styles.notFound}><Text style={styles.notFoundTitle}>{error}</Text><Pressable style={styles.primaryButton} onPress={() => router.back()}><Text style={styles.primaryButtonText}>Return to Homework</Text></Pressable></View></SafeAreaView>;
  const assignmentDetails = { ...source, className: source.className || 'N/A', schoolName: source.schoolName || 'N/A', assignedDate: displayDate(source.assignedDate), dueDate: displayDate(source.dueDate), instructor: source.instructor || source.teacher || 'N/A', instructions: source.instructions || source.description || source.topic || 'No description provided.', status: source.status || 'Pending', submissionStatus: source.submissionStatus || 'Pending Submission' };
  const message = buildShareMessage(assignmentDetails);
  const shareLink = `educampus360://share/homework/${assignmentDetails.id}`;

  const copyLink = async () => {
    setCopying(true);
    await Clipboard.setStringAsync(shareLink);
    setCopying(false);
    Alert.alert('Link copied', 'The homework link is ready to share.');
  };

  const shareNative = async () => {
    await Share.share({ message, title: assignmentDetails.topic });
  };

  const shareWhatsApp = async () => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (canOpen) await Linking.openURL(whatsappUrl);
    else await shareNative();
  };

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Pressable style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={18} color={colors.blue} /><Text style={styles.backText}>Back</Text></Pressable><View style={styles.heading}><Text style={styles.title}>Homework</Text><Text style={styles.subtitle}>{assignmentDetails.subject}</Text><Text style={styles.headingTopic}>{assignmentDetails.topic}</Text></View><View style={styles.topActions}><Pressable style={styles.actionButton} onPress={shareWhatsApp}><Ionicons name="logo-whatsapp" size={16} color={colors.green} /><Text style={styles.actionText}>WhatsApp</Text></Pressable><Pressable style={styles.actionButton} onPress={copyLink}><Ionicons name="copy-outline" size={16} color={colors.blue} /><Text style={styles.actionText}>{copying ? 'Copying...' : 'Copy Link'}</Text></Pressable></View><View style={styles.card}><Text style={styles.subject}>{assignmentDetails.subject}</Text><Text style={styles.className}>Class {assignmentDetails.className.replace(/^Class\s*/i, '')}</Text><View style={styles.statusRow}><Text style={styles.topic}>{assignmentDetails.topic}</Text><Text style={styles.status}>{assignmentDetails.status || 'Overdue'}</Text></View><Text style={styles.school}>{assignmentDetails.schoolName}</Text><View style={styles.info}><Text style={styles.label}>Assigned</Text><Text style={styles.value}>{assignmentDetails.assignedDate}</Text><Text style={styles.label}>Submission Due</Text><Text style={styles.value}>{assignmentDetails.dueDate}</Text><Text style={styles.label}>Instructor</Text><Text style={styles.value}>{assignmentDetails.instructor}</Text></View><Text style={styles.sectionTitle}>Instructions & Assignment Details</Text><Text style={styles.body}>{assignmentDetails.instructions}</Text><Text style={styles.sectionTitle}>Worksheet & Reference Material</Text><View style={styles.placeholder}><Ionicons name="document-outline" size={24} color={colors.blue} /><Text style={styles.placeholderTitle}>No Attachment File Attached</Text><Text style={styles.body}>This assignment only contains textual instructions.</Text></View><Text style={styles.sectionTitle}>Your Submission Status</Text><View style={styles.submissionCard}><Text style={styles.submissionStatus}>{assignmentDetails.submissionStatus}</Text><Text style={styles.body}>Please complete your assignment and submit before the deadline.</Text></View><Pressable style={styles.primaryButton} onPress={() => router.push(`/homework-submission?assignment=${encodeURIComponent(JSON.stringify(item))}`)}><Text style={styles.primaryButtonText}>Submit Homework</Text></Pressable></View><View style={styles.shareSection}><Text style={styles.shareTitle}>Share this assignment with students, parents, or teachers:</Text><View style={styles.shareActions}><Pressable style={styles.shareButton} onPress={shareWhatsApp}><Text style={styles.shareButtonText}>WhatsApp</Text></Pressable><Pressable style={styles.shareButton} onPress={copyLink}><Text style={styles.shareButtonText}>Copy Link</Text></Pressable><Pressable style={styles.shareButton} onPress={shareNative}><Text style={styles.shareButtonText}>Share</Text></Pressable></View></View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.canvas }, content: { padding: 20, paddingBottom: 30 }, back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 }, backText: { color: colors.blue, fontSize: 13, fontWeight: '800' }, heading: { marginBottom: 16 }, title: { color: colors.ink, fontSize: 25, fontWeight: '900' }, subtitle: { color: colors.blue, fontSize: 14, fontWeight: '900', marginTop: 8 }, headingTopic: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: 4 }, topActions: { flexDirection: 'row', gap: 8, marginBottom: 14 }, actionButton: { flex: 1, minHeight: 40, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }, actionText: { color: colors.ink, fontSize: 11, fontWeight: '800' }, card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16 }, subject: { color: colors.blue, fontSize: 12, fontWeight: '900' }, className: { color: colors.muted, fontSize: 12, marginTop: 5 }, statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12 }, topic: { color: colors.ink, fontSize: 20, fontWeight: '900' }, status: { color: colors.orange, backgroundColor: colors.paleOrange, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6, fontSize: 10, fontWeight: '900' }, school: { color: colors.muted, fontSize: 12, marginTop: 7 }, info: { borderTopWidth: 1, borderTopColor: colors.line, borderBottomWidth: 1, borderBottomColor: colors.line, marginVertical: 16, paddingVertical: 12, gap: 4 }, label: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 5 }, value: { color: colors.ink, fontSize: 13, fontWeight: '800' }, sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 18, marginBottom: 7 }, body: { color: colors.muted, fontSize: 12, lineHeight: 18 }, placeholder: { backgroundColor: colors.paleBlue, borderRadius: 10, padding: 16, alignItems: 'center', gap: 7 }, placeholderTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', textAlign: 'center' }, submissionCard: { backgroundColor: colors.paleOrange, borderRadius: 10, padding: 14, gap: 5 }, submissionStatus: { color: colors.orange, fontSize: 14, fontWeight: '900' }, primaryButton: { backgroundColor: colors.blue, minHeight: 46, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 18 }, primaryButtonText: { color: colors.white, fontSize: 13, fontWeight: '900' }, shareSection: { marginTop: 16 }, shareTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', lineHeight: 19 }, shareActions: { flexDirection: 'row', gap: 8, marginTop: 10 }, shareButton: { flex: 1, borderWidth: 1, borderColor: colors.blue, borderRadius: 9, minHeight: 40, justifyContent: 'center', alignItems: 'center' }, shareButtonText: { color: colors.blue, fontSize: 10, fontWeight: '900' }, notFound: { flex: 1, padding: 20, justifyContent: 'center' }, notFoundTitle: { color: colors.ink, fontSize: 20, fontWeight: '900', textAlign: 'center' } });
