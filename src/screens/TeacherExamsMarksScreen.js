import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherApi } from '../services/teacherApi';
import TeacherSetExamsScreen from './TeacherSetExamsScreen';
import TeacherTimetableScreen from './TeacherTimetableScreen';

const colors = {
  ink: '#17343B',
  muted: '#6A7F83',
  line: '#D9E7E4',
  canvas: '#F4F8F6',
  white: '#FFFFFF',
  navy: '#123B43',
  blue: '#0D8B82',
  paleBlue: '#E5F4F0',
  teal: '#168A7C',
  paleTeal: '#E2F4EE',
  orange: '#D9822B',
  paleOrange: '#FFF1DF',
  red: '#C65353',
  plum: '#5A4AB6',
  softLilac: '#F5F1FF',
};

const examModules = [
  { label: 'Set Exams', description: 'Create and configure examination sessions, dates, classes and subjects.', icon: 'calendar-outline' },
  { label: 'View Exams', description: 'Browse scheduled examinations and manage examination subjects.', icon: 'documents-outline' },
  { label: 'Teachers Timetable', description: 'View teacher-wise examination schedules and assigned duties.', icon: 'time-outline' },
  { label: 'Exam Attendance', description: 'Record and manage student attendance during examinations.', icon: 'checkmark-done-outline' },
  { label: 'Exam Result', description: 'Enter, review and manage examination marks.', icon: 'clipboard-outline' },
  { label: 'Publish Result', description: 'Review and publish examination results to students and parents.', icon: 'megaphone-outline' },
  { label: 'Class Result', description: 'View class-wise examination performance and results.', icon: 'bar-chart-outline' },
  { label: 'Attendance Result', description: 'View examination attendance and attendance-based reports.', icon: 'stats-chart-outline' },
  { label: 'Hall Ticket', description: 'Create and manage student examination hall tickets.', icon: 'receipt-outline' },
];

const mockAttendanceRecords = [
  { id: 1, rollNo: '01', admissionNo: 'ADM-101', name: 'Aarav Sharma', className: 'Class 1', section: 'A', exam: 'Unit Test', subject: 'Mathematics', status: 'Present' },
  { id: 2, rollNo: '02', admissionNo: 'ADM-102', name: 'Diya Nair', className: 'Class 1', section: 'A', exam: 'Unit Test', subject: 'Mathematics', status: 'Absent' },
  { id: 3, rollNo: '03', admissionNo: 'ADM-103', name: 'Rohan Verma', className: 'Class 1', section: 'A', exam: 'Unit Test', subject: 'Mathematics', status: 'Late' },
  { id: 4, rollNo: '04', admissionNo: 'ADM-104', name: 'Meera Iyer', className: 'Class 1', section: 'A', exam: 'Unit Test', subject: 'Mathematics', status: 'Present' },
  { id: 5, rollNo: '05', admissionNo: 'ADM-105', name: 'Kabir Sen', className: 'Class 1', section: 'A', exam: 'Unit Test', subject: 'Mathematics', status: 'Not Marked' },
];

const mockmarks = [
  { id: 1, rollNo: '01', name: 'Aarav Sharma', admissionNo: 'ADM-101', className: 'Class 1', section: 'A', subject: 'Mathematics', maximumMarks: 100, obtainedMarks: 92, grade: 'A+', status: 'Submitted' },
  { id: 2, rollNo: '02', name: 'Diya Nair', admissionNo: 'ADM-102', className: 'Class 1', section: 'A', subject: 'Mathematics', maximumMarks: 100, obtainedMarks: 78, grade: 'B+', status: 'Draft' },
  { id: 3, rollNo: '03', name: 'Rohan Verma', admissionNo: 'ADM-103', className: 'Class 1', section: 'A', subject: 'Mathematics', maximumMarks: 100, obtainedMarks: 85, grade: 'A', status: 'Pending' },
  { id: 4, rollNo: '04', name: 'Meera Iyer', admissionNo: 'ADM-104', className: 'Class 1', section: 'A', subject: 'Mathematics', maximumMarks: 100, obtainedMarks: 66, grade: 'B', status: 'Submitted' },
];

const mockResultData = [
  { id: 1, student: 'Aarav Sharma', className: 'Class 1', section: 'A', exam: 'Unit Test', totalMarks: 100, obtainedMarks: 92, percentage: 92, grade: 'A+', resultStatus: 'Pass' },
  { id: 2, student: 'Diya Nair', className: 'Class 1', section: 'A', exam: 'Unit Test', totalMarks: 100, obtainedMarks: 78, percentage: 78, grade: 'B+', resultStatus: 'Pass' },
  { id: 3, student: 'Rohan Verma', className: 'Class 1', section: 'A', exam: 'Unit Test', totalMarks: 100, obtainedMarks: 64, percentage: 64, grade: 'C', resultStatus: 'Pass' },
];

const mockHallTickets = [
  { id: 'HT-1001', student: 'Aarav Sharma', admissionNo: 'ADM-101', rollNo: '01', className: 'Class 1', section: 'A', exam: 'Unit Test', examDate: '24 Sep 2026', examCentre: 'Main Hall', roomNo: 'Room 11' },
  { id: 'HT-1002', student: 'Diya Nair', admissionNo: 'ADM-102', rollNo: '02', className: 'Class 1', section: 'A', exam: 'Unit Test', examDate: '24 Sep 2026', examCentre: 'Main Hall', roomNo: 'Room 12' },
];

function Icon({ name, size = 18, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function ScreenHeader({ title, subtitle, onBack, backLabel = 'Back to Exams / Marks' }) {
  return (
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        {onBack ? (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Icon name="arrow-back" size={16} color={colors.blue} />
            <Text style={styles.backText}>{backLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageSubtitle}>{subtitle}</Text>
    </View>
  );
}

function SummaryCard({ title, value, label, tint, accent, icon }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: tint, borderColor: accent }]}> 
      <View style={[styles.summaryIcon, { backgroundColor: tint, borderColor: accent }]}> 
        <Icon name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function LandingCard({ item, index, onPress }) {
  const colorsList = [
    [colors.paleBlue, colors.blue],
    [colors.paleTeal, colors.teal],
    [colors.paleOrange, colors.orange],
    [colors.softLilac, colors.plum],
  ];
  const [bg, accent] = colorsList[index % colorsList.length];

  return (
    <Pressable onPress={() => onPress(item.label)} style={({ pressed }) => [styles.moduleCard, { backgroundColor: bg, borderColor: accent }, pressed && styles.pressed]}>
      <View style={[styles.moduleIcon, { backgroundColor: bg, borderColor: accent }]}> 
        <Icon name={item.icon} size={20} color={accent} />
      </View>
      <View style={styles.moduleCopy}>
        <Text style={styles.moduleTitle}>{item.label}</Text>
        <Text style={styles.moduleDescription}>{item.description}</Text>
      </View>
      <Icon name="chevron-forward" size={18} color={accent} />
    </Pressable>
  );
}

function getExamReference(exam) {
  return `#${exam?.id ?? 'N/A'}`;
}

function formatExamTarget(exam) {
  const target = exam?.targetClass || 'Global (All Classes)';
  const section = exam?.section ? ` • ${exam.section}` : '';
  return `${target}${section}`;
}

function normalizeExamValue(value) {
  return String(value || '').trim().toLowerCase();
}

function ViewExamsScreen({ session, onBack, onSelectModule }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [detailsExam, setDetailsExam] = useState(null);
  const [subjectsExam, setSubjectsExam] = useState(null);
  const [subjectDraft, setSubjectDraft] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const exams = await teacherApi.getExams(session);
        if (active) setRecords(Array.isArray(exams) ? exams : []);
      } catch {
        if (active) setRecords([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [session]);

  const classOptions = useMemo(() => {
    const values = records
      .map((exam) => exam?.targetClass || 'Global (All Classes)')
      .filter((value, index, arr) => value && arr.indexOf(value) === index)
      .sort((a, b) => a.localeCompare(b));

    return ['All Classes', ...values];
  }, [records]);

  const summary = useMemo(() => {
    const total = records.length;
    const active = records.filter((item) => item.status === 'Scheduled').length;
    const done = records.filter((item) => item.status === 'Completed').length;
    return { total, active, done };
  }, [records]);

  const filtered = useMemo(() => {
    const query = normalizeExamValue(search);

    return records.filter((exam) => {
      const matchesQuery = !query || [
        exam?.name,
        getExamReference(exam),
        exam?.targetClass,
        exam?.section,
        formatExamTarget(exam),
      ].some((value) => normalizeExamValue(value).includes(query));

      const matchesClass = classFilter === 'All Classes' || normalizeExamValue(exam?.targetClass).includes(normalizeExamValue(classFilter)) || normalizeExamValue(formatExamTarget(exam)).includes(normalizeExamValue(classFilter));
      const matchesStatus = statusFilter === 'All Statuses' || exam?.status === statusFilter;

      return matchesQuery && matchesClass && matchesStatus;
    });
  }, [records, search, classFilter, statusFilter]);

  const handleSaveSubjects = () => {
    if (!subjectsExam) return;
    setRecords((current) => current.map((exam) => (Number(exam.id) === Number(subjectsExam.id) ? { ...exam, subjects: [...subjectDraft] } : exam)));
    setSubjectsExam(null);
    setSubjectDraft([]);
  };

  const handleAddSubject = () => {
    setSubjectDraft((current) => [...current, `Subject ${current.length + 1}`]);
  };

  const handleRemoveSubject = (subject) => {
    setSubjectDraft((current) => current.filter((item) => item !== subject));
  };

  return (
    <View style={styles.screenWrap}>
      <ScreenHeader title="Examination Schedules & Subject Timetable" subtitle="Exam Suite" onBack={onBack} />
      <Text style={styles.pageDescription}>Browse, filter and manage all school examinations, paper timeframes and subject configurations</Text>

      <View style={styles.tabRow}>
        {['Overview', 'Schedule Exam', 'Exam Schedules', 'Attendance', 'Attendance History', 'Marks Entry', 'Publish Results', 'Class Reports', 'Hall Tickets'].map((tab) => (
          <View key={tab} style={[styles.tabPill, tab === 'Exam Schedules' && styles.tabPillActive]}>
            <Text style={[styles.tabText, tab === 'Exam Schedules' && styles.tabTextActive]}>{tab}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard title="Total" value={String(summary.total || 19)} label="Total" tint={colors.paleBlue} accent={colors.blue} icon="document-text-outline" />
        <SummaryCard title="Active" value={String(summary.active || 19)} label="Active" tint={colors.paleTeal} accent={colors.teal} icon="calendar-outline" />
        <SummaryCard title="Done" value={String(summary.done || 0)} label="Done" tint={colors.paleOrange} accent={colors.orange} icon="checkmark-done-outline" />
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => onSelectModule ? onSelectModule('Set Exams') : Alert.alert('Schedule Exam', 'Open the existing Set Exams flow.')}
        >
          <Text style={styles.primaryButtonText}>Schedule Exam</Text>
        </Pressable>
      </View>

      <View style={styles.filterPanel}>
        <View style={styles.searchField}>
          <Icon name="search-outline" size={16} color={colors.muted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search exam name or class..." placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>

        <View style={styles.filterGrid}>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Class</Text>
            <View style={styles.selectWrap}>
              {classOptions.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.filterOption, option === classFilter && styles.filterOptionSelected]}
                  onPress={() => setClassFilter(option)}
                >
                  <Text style={[styles.filterText, option === classFilter && styles.filterTextSelected]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.selectWrap}>
              {['All Statuses', 'Scheduled', 'Completed'].map((option) => (
                <Pressable
                  key={option}
                  style={[styles.filterOption, option === statusFilter && styles.filterOptionSelected]}
                  onPress={() => setStatusFilter(option)}
                >
                  <Text style={[styles.filterText, option === statusFilter && styles.filterTextSelected]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}><ActivityIndicator color={colors.blue} /><Text style={styles.loadingText}>Loading examinations...</Text></View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No examinations match the current filters.</Text>
          <Text style={styles.emptyText}>Try widening the search or resetting the selected class or status.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {filtered.map((exam) => (
            <Pressable key={exam.id} style={styles.listCard} onPress={() => setDetailsExam(exam)}>
              <View style={styles.examHeaderRow}>
                <View style={styles.examIdentity}>
                  <Text style={styles.listTitle}>{exam.name}</Text>
                  <Text style={styles.listText}>Exam Ref: {getExamReference(exam)}</Text>
                </View>
                <View style={[styles.statusBadge, exam.status === 'Completed' ? styles.statusComplete : styles.statusScheduled]}>
                  <Text style={[styles.statusBadgeText, exam.status === 'Completed' ? styles.statusBadgeTextDone : styles.statusBadgeTextScheduled]}>{exam.status || 'Scheduled'}</Text>
                </View>
              </View>

              <View style={styles.recordGrid}>
                <Text style={styles.detailLabel}>Target Scope</Text>
                <Text style={styles.detailValue}>{formatExamTarget(exam)}</Text>
              </View>

              <View style={styles.recordGrid}>
                <Text style={styles.detailLabel}>Schedule Timing</Text>
                <Text style={styles.detailValue}>{exam.startDate || '—'} • {exam.startTime || '—'} - {exam.endTime || '—'}</Text>
              </View>

              <View style={styles.recordGrid}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>{exam.status || 'Scheduled'}</Text>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    setSubjectsExam(exam);
                    setSubjectDraft(exam.subjects || []);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Manage Subjects</Text>
                </Pressable>
                <Pressable
                  style={styles.ghostButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    setDetailsExam(exam);
                  }}
                >
                  <Text style={styles.ghostButtonText}>View Details</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Modal animationType="slide" transparent visible={Boolean(detailsExam)} onRequestClose={() => setDetailsExam(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Examination Details</Text>
            {detailsExam ? (
              <>
                <Text style={styles.modalDescription}>{detailsExam.name}</Text>
                <Text style={styles.modalInfo}>Exam Ref: {getExamReference(detailsExam)}</Text>
                <Text style={styles.modalInfo}>Target: {formatExamTarget(detailsExam)}</Text>
                <Text style={styles.modalInfo}>Date: {detailsExam.startDate || '—'}</Text>
                <Text style={styles.modalInfo}>Start Time: {detailsExam.startTime || '—'}</Text>
                <Text style={styles.modalInfo}>End Time: {detailsExam.endTime || '—'}</Text>
                <Text style={styles.modalInfo}>Status: {detailsExam.status || 'Scheduled'}</Text>
                <Text style={styles.modalInfo}>Assigned Subjects: {(detailsExam.subjects || []).join(', ') || 'No subjects assigned'}</Text>
              </>
            ) : null}
            <Pressable style={styles.primaryButton} onPress={() => setDetailsExam(null)}>
              <Text style={styles.primaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent visible={Boolean(subjectsExam)} onRequestClose={() => setSubjectsExam(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Manage Subjects</Text>
            {subjectsExam ? (
              <>
                <Text style={styles.modalDescription}>{subjectsExam.name}</Text>
                <Text style={styles.modalInfo}>Exam Ref: {getExamReference(subjectsExam)}</Text>
                <Text style={styles.modalInfo}>Target Class: {formatExamTarget(subjectsExam)}</Text>
                <Text style={styles.modalInfo}>Date: {subjectsExam.startDate || '—'}</Text>
                <Text style={styles.modalInfo}>Time: {subjectsExam.startTime || '—'} - {subjectsExam.endTime || '—'}</Text>
                <Text style={styles.modalInfo}>Current subjects:</Text>
                <View style={styles.subjectList}>
                  {subjectDraft.length === 0 ? (
                    <Text style={styles.emptyText}>No subjects assigned.</Text>
                  ) : (
                    subjectDraft.map((subject) => (
                      <View key={subject} style={styles.subjectRow}>
                        <Text style={styles.subjectText}>{subject}</Text>
                        <Pressable onPress={() => handleRemoveSubject(subject)}>
                          <Icon name="trash-outline" size={16} color={colors.red} />
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              </>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButton} onPress={handleAddSubject}>
                <Text style={styles.secondaryButtonText}>Add Subject</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={handleSaveSubjects}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </Pressable>
            </View>
            <Pressable style={styles.linkButton} onPress={() => setSubjectsExam(null)}>
              <Text style={styles.linkButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ExamAttendanceScreen({ session, onBack }) {
  const [selectedExam, setSelectedExam] = useState('Unit Test');
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const totalStudents = mockAttendanceRecords.length;
  const present = mockAttendanceRecords.filter((record) => record.status === 'Present').length;
  const absent = mockAttendanceRecords.filter((record) => record.status === 'Absent').length;
  const notMarked = mockAttendanceRecords.filter((record) => record.status === 'Not Marked').length;

  return (
    <View style={styles.screenWrap}>
      <ScreenHeader title="Exam Attendance" subtitle="Record and monitor student attendance during examinations" onBack={onBack} />
      <View style={styles.filterPanel}>
        <View style={styles.filterGrid}>
          <FilterBadge label="Examination" value={selectedExam} options={['Unit Test', 'Mid Term', 'Quarterly Exam']} onSelect={setSelectedExam} />
          <FilterBadge label="Date" value="24 Sep 2026" options={['24 Sep 2026', '25 Sep 2026']} onSelect={() => {}} />
          <FilterBadge label="Class" value={selectedClass} options={['Class 1', 'Class 2', 'Class 4']} onSelect={setSelectedClass} />
          <FilterBadge label="Section" value={selectedSection} options={['A', 'B', 'C']} onSelect={setSelectedSection} />
          <FilterBadge label="Subject" value={selectedSubject} options={['Mathematics', 'Science', 'English']} onSelect={setSelectedSubject} />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard title="Total Students" value={String(totalStudents)} label="Students" tint={colors.paleBlue} accent={colors.blue} icon="people-outline" />
        <SummaryCard title="Present" value={String(present)} label="Present" tint={colors.paleTeal} accent={colors.teal} icon="checkmark-circle-outline" />
        <SummaryCard title="Absent" value={String(absent)} label="Absent" tint={colors.paleOrange} accent={colors.orange} icon="close-circle-outline" />
        <SummaryCard title="Not Marked" value={String(notMarked)} label="Pending" tint={colors.softLilac} accent={colors.plum} icon="time-outline" />
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert('Attendance', 'All students marked as present.')}> 
          <Text style={styles.secondaryButtonText}>Mark All Present</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => {
          if (!selectedExam || !selectedClass || !selectedSubject) {
            Alert.alert('Validation', 'Please select an examination, class and subject before saving.');
            return;
          }
          Alert.alert('Saved', 'Exam attendance has been saved successfully.');
        }}> 
          <Text style={styles.primaryButtonText}>Save Attendance</Text>
        </Pressable>
      </View>

      <View style={styles.listWrap}>
        {mockAttendanceRecords.map((record) => (
          <View key={record.id} style={styles.resultRow}>
            <Text style={styles.rowLabel}>{record.rollNo}</Text>
            <Text style={styles.rowLabel}>{record.admissionNo}</Text>
            <Text style={styles.rowLabel}>{record.name}</Text>
            <Text style={styles.rowLabel}>{record.className}</Text>
            <Text style={styles.rowLabel}>{record.section}</Text>
            <View style={styles.statusBox}><Text style={styles.statusText}>{record.status}</Text></View>
            <Text style={styles.rowLabel}>{record.exam}</Text>
            <Text style={styles.rowLabel}>{record.subject}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ExamResultScreen({ onBack }) {
  const [selectedExam, setSelectedExam] = useState('Unit Test');
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const totalStudents = mockmarks.length;
  const marksEntered = mockmarks.filter((item) => Number(item.obtainedMarks) >= 0).length;
  const pending = mockmarks.filter((item) => item.status === 'Pending').length;
  const average = (mockmarks.reduce((sum, item) => sum + Number(item.obtainedMarks), 0) / totalStudents).toFixed(1);

  return (
    <View style={styles.screenWrap}>
      <ScreenHeader title="Exam Result" subtitle="Enter, review and manage student examination marks" onBack={onBack} />
      <View style={styles.filterPanel}>
        <View style={styles.filterGrid}>
          <FilterBadge label="Examination" value={selectedExam} options={['Unit Test', 'Mid Term']} onSelect={setSelectedExam} />
          <FilterBadge label="Class" value={selectedClass} options={['Class 1', 'Class 2']} onSelect={setSelectedClass} />
          <FilterBadge label="Section" value={selectedSection} options={['A', 'B']} onSelect={setSelectedSection} />
          <FilterBadge label="Subject" value={selectedSubject} options={['Mathematics', 'Science']} onSelect={setSelectedSubject} />
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard title="Total Students" value={String(totalStudents)} label="Students" tint={colors.paleBlue} accent={colors.blue} icon="people-outline" />
        <SummaryCard title="Marks Entered" value={String(marksEntered)} label="Records" tint={colors.paleTeal} accent={colors.teal} icon="checkmark-done-outline" />
        <SummaryCard title="Pending" value={String(pending)} label="Pending" tint={colors.paleOrange} accent={colors.orange} icon="time-outline" />
        <SummaryCard title="Average Marks" value={`${average}`} label="Average" tint={colors.softLilac} accent={colors.plum} icon="stats-chart-outline" />
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert('Saved draft', 'Marks draft has been saved.')}><Text style={styles.secondaryButtonText}>Save Draft</Text></Pressable>
        <Pressable style={styles.primaryButton} onPress={() => Alert.alert('Submitted', 'Marks submitted successfully.')}><Text style={styles.primaryButtonText}>Submit Marks</Text></Pressable>
      </View>

      <View style={styles.listWrap}>
        {mockmarks.map((record) => (
          <View key={record.id} style={styles.resultRow}>
            <Text style={styles.rowLabel}>{record.rollNo}</Text>
            <Text style={styles.rowLabel}>{record.name}</Text>
            <Text style={styles.rowLabel}>{record.admissionNo}</Text>
            <Text style={styles.rowLabel}>{record.className}</Text>
            <Text style={styles.rowLabel}>{record.section}</Text>
            <Text style={styles.rowLabel}>{record.subject}</Text>
            <Text style={styles.rowLabel}>{record.maximumMarks}</Text>
            <Text style={styles.rowLabel}>{record.obtainedMarks}</Text>
            <Text style={styles.rowLabel}>{record.grade}</Text>
            <Text style={styles.rowLabel}>{record.status}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PublishResultScreen({ onBack }) {
  return (
    <View style={styles.screenWrap}>
      <ScreenHeader title="Publish Examination Results" subtitle="Review and publish finalized examination results" onBack={onBack} />
      <View style={styles.filterPanel}>
        <View style={styles.filterGrid}>
          <FilterBadge label="Examination" value="Unit Test" options={['Unit Test', 'Mid Term']} onSelect={() => {}} />
          <FilterBadge label="Class" value="Class 1" options={['Class 1', 'Class 2']} onSelect={() => {}} />
          <FilterBadge label="Section" value="A" options={['A', 'B']} onSelect={() => {}} />
        </View>
      </View>
      <View style={styles.summaryGrid}>
        <SummaryCard title="Total Students" value="32" label="Students" tint={colors.paleBlue} accent={colors.blue} icon="people-outline" />
        <SummaryCard title="Results Ready" value="28" label="Ready" tint={colors.paleTeal} accent={colors.teal} icon="checkmark-circle-outline" />
        <SummaryCard title="Pending Results" value="4" label="Pending" tint={colors.paleOrange} accent={colors.orange} icon="time-outline" />
        <SummaryCard title="Published" value="18" label="Published" tint={colors.softLilac} accent={colors.plum} icon="megaphone-outline" />
      </View>
      <View style={styles.listWrap}>
        {mockResultData.map((record) => (
          <View key={record.id} style={styles.resultRow}>
            <Text style={styles.rowLabel}>{record.student}</Text>
            <Text style={styles.rowLabel}>{record.className}</Text>
            <Text style={styles.rowLabel}>{record.section}</Text>
            <Text style={styles.rowLabel}>{record.exam}</Text>
            <Text style={styles.rowLabel}>{record.obtainedMarks}/{record.totalMarks}</Text>
            <Text style={styles.rowLabel}>{record.percentage}%</Text>
            <Text style={styles.rowLabel}>{record.grade}</Text>
            <Text style={styles.rowLabel}>{record.resultStatus}</Text>
            <Pressable style={styles.secondaryButton} onPress={() => Alert.alert('Publish Results?', 'Published results will become visible to authorized students and parents. Continue?', [{ text: 'Cancel' }, { text: 'Publish', onPress: () => Alert.alert('Published', 'Results published successfully.') }])}><Text style={styles.secondaryButtonText}>Publish</Text></Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function ClassResultScreen({ onBack }) {
  return (
    <View style={styles.screenWrap}>
      <ScreenHeader title="Class Result" subtitle="View class-wise examination performance" onBack={onBack} />
      <View style={styles.filterPanel}>
        <View style={styles.filterGrid}>
          <FilterBadge label="Examination" value="Unit Test" options={['Unit Test']} onSelect={() => {}} />
          <FilterBadge label="Class" value="Class 1" options={['Class 1']} onSelect={() => {}} />
          <FilterBadge label="Section" value="A" options={['A']} onSelect={() => {}} />
        </View>
      </View>
      <View style={styles.summaryGrid}>
        <SummaryCard title="Total Students" value="32" label="Students" tint={colors.paleBlue} accent={colors.blue} icon="people-outline" />
        <SummaryCard title="Passed" value="26" label="Pass" tint={colors.paleTeal} accent={colors.teal} icon="checkmark-circle-outline" />
        <SummaryCard title="Failed" value="6" label="Fail" tint={colors.paleOrange} accent={colors.orange} icon="close-circle-outline" />
        <SummaryCard title="Average %" value="78.4%" label="Average" tint={colors.softLilac} accent={colors.plum} icon="stats-chart-outline" />
      </View>
      <View style={styles.listWrap}>
        {mockResultData.map((record, index) => (
          <View key={record.id} style={styles.resultRow}>
            <Text style={styles.rowLabel}>{index + 1}</Text>
            <Text style={styles.rowLabel}>{record.student}</Text>
            <Text style={styles.rowLabel}>{record.totalMarks}</Text>
            <Text style={styles.rowLabel}>{record.obtainedMarks}</Text>
            <Text style={styles.rowLabel}>{record.percentage}%</Text>
            <Text style={styles.rowLabel}>{record.grade}</Text>
            <Text style={styles.rowLabel}>{record.resultStatus}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AttendanceResultScreen({ onBack }) {
  return (
    <View style={styles.screenWrap}>
      <ScreenHeader title="Attendance Result" subtitle="Examination attendance and attendance-based reporting" onBack={onBack} />
      <View style={styles.filterPanel}>
        <View style={styles.filterGrid}>
          <FilterBadge label="Examination" value="Unit Test" options={['Unit Test']} onSelect={() => {}} />
          <FilterBadge label="Class" value="Class 1" options={['Class 1']} onSelect={() => {}} />
          <FilterBadge label="Section" value="A" options={['A']} onSelect={() => {}} />
          <FilterBadge label="Subject" value="Mathematics" options={['Mathematics']} onSelect={() => {}} />
          <FilterBadge label="Date" value="24 Sep 2026" options={['24 Sep 2026']} onSelect={() => {}} />
        </View>
      </View>
      <View style={styles.summaryGrid}>
        <SummaryCard title="Total Students" value="32" label="Students" tint={colors.paleBlue} accent={colors.blue} icon="people-outline" />
        <SummaryCard title="Present" value="28" label="Present" tint={colors.paleTeal} accent={colors.teal} icon="checkmark-circle-outline" />
        <SummaryCard title="Absent" value="3" label="Absent" tint={colors.paleOrange} accent={colors.orange} icon="close-circle-outline" />
        <SummaryCard title="Attendance %" value="87.5%" label="Attendance" tint={colors.softLilac} accent={colors.plum} icon="stats-chart-outline" />
      </View>
    </View>
  );
}

function HallTicketScreen({ onBack }) {
  return (
    <View style={styles.screenWrap}>
      <ScreenHeader title="Hall Ticket" subtitle="Generate and manage student examination hall tickets" onBack={onBack} />
      <View style={styles.filterPanel}>
        <View style={styles.filterGrid}>
          <FilterBadge label="Examination" value="Unit Test" options={['Unit Test', 'Mid Term']} onSelect={() => {}} />
          <FilterBadge label="Class" value="Class 1" options={['Class 1', 'Class 2']} onSelect={() => {}} />
          <FilterBadge label="Section" value="A" options={['A', 'B']} onSelect={() => {}} />
        </View>
      </View>
      <View style={styles.listWrap}>
        {mockHallTickets.map((ticket) => (
          <View key={ticket.id} style={styles.listCard}>
            <Text style={styles.listTitle}>{ticket.student}</Text>
            <Text style={styles.listText}>Admission No: {ticket.admissionNo}</Text>
            <Text style={styles.listText}>Roll No: {ticket.rollNo}</Text>
            <Text style={styles.listText}>Class: {ticket.className}</Text>
            <Text style={styles.listText}>Section: {ticket.section}</Text>
            <Text style={styles.listText}>Examination: {ticket.exam}</Text>
            <Text style={styles.listText}>Date: {ticket.examDate}</Text>
            <Text style={styles.listText}>Exam Centre: {ticket.examCentre}</Text>
            <Text style={styles.listText}>Room No: {ticket.roomNo}</Text>
            <Pressable style={styles.primaryButton} onPress={() => Alert.alert('Hall Ticket', 'Hall ticket view is available in the demo flow.')}><Text style={styles.primaryButtonText}>View Hall Ticket</Text></Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function FilterBadge({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.filterField}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Pressable style={styles.filterBox} onPress={() => setOpen((current) => !current)}>
        <Text style={styles.filterText}>{value}</Text>
        <Icon name="chevron-down" size={15} color={colors.muted} />
      </Pressable>
      {open ? (
        <View style={styles.optionBox}>
          {options.map((option) => (
            <Pressable key={option} style={styles.optionRow} onPress={() => { onSelect(option); setOpen(false); }}>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function TeacherExamsMarksScreen({ session, module = 'Exams / Marks', onSelectModule, onBack }) {
  const activeModule = module || 'Exams / Marks';

  if (activeModule === 'Set Exams') {
    return <TeacherSetExamsScreen session={session} />;
  }

  if (activeModule === 'View Exams') {
    return <ViewExamsScreen session={session} onBack={() => onSelectModule && onSelectModule('Exams / Marks')} onSelectModule={onSelectModule} />;
  }

  if (activeModule === 'Teachers Timetable') {
    return <TeacherTimetableScreen session={session} />;
  }

  if (activeModule === 'Exam Attendance') {
    return <ExamAttendanceScreen session={session} onBack={() => onSelectModule && onSelectModule('Exams / Marks')} />;
  }

  if (activeModule === 'Exam Result') {
    return <ExamResultScreen onBack={() => onSelectModule && onSelectModule('Exams / Marks')} />;
  }

  if (activeModule === 'Publish Result') {
    return <PublishResultScreen onBack={() => onSelectModule && onSelectModule('Exams / Marks')} />;
  }

  if (activeModule === 'Class Result') {
    return <ClassResultScreen onBack={() => onSelectModule && onSelectModule('Exams / Marks')} />;
  }

  if (activeModule === 'Attendance Result') {
    return <AttendanceResultScreen onBack={() => onSelectModule && onSelectModule('Exams / Marks')} />;
  }

  if (activeModule === 'Hall Ticket') {
    return <HallTicketScreen onBack={() => onSelectModule && onSelectModule('Exams / Marks')} />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <Text style={styles.pageTitle}>Exams / Marks</Text>
        <Text style={styles.pageSubtitle}>Examination, Marks & Academic Assessment Management</Text>
      </View>

      <View style={styles.gridWrap}>
        {examModules.map((item, index) => (
          <LandingCard key={item.label} item={item} index={index} onPress={(label) => onSelectModule && onSelectModule(label)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 16,
  },
  pageTitle: { fontSize: 22, fontWeight: '900', color: colors.ink },
  pageSubtitle: { color: colors.muted, fontSize: 12, marginTop: 6, lineHeight: 18 },
  gridWrap: { gap: 10 },
  moduleCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  moduleCopy: { flex: 1 },
  moduleTitle: { fontSize: 15, fontWeight: '900', color: colors.ink },
  moduleDescription: { fontSize: 11, color: colors.muted, marginTop: 4, lineHeight: 16 },
  pressed: { opacity: 0.8 },
  screenWrap: { flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 120 },
  headerRow: { marginBottom: 8 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.paleBlue,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backText: { color: colors.blue, fontWeight: '800', fontSize: 11 },
  pageDescription: { color: colors.muted, fontSize: 12, marginTop: 8, lineHeight: 18 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tabPill: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tabPillActive: { backgroundColor: colors.paleBlue, borderColor: colors.blue },
  tabText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  tabTextActive: { color: colors.blue },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  summaryCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    minHeight: 110,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryTitle: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  summaryValue: { color: colors.ink, fontSize: 22, fontWeight: '900', marginTop: 4 },
  summaryLabel: { color: colors.muted, fontSize: 9, marginTop: 4 },
  filterPanel: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 10, marginTop: 14 },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  filterField: { width: '48%' },
  filterLabel: { color: colors.muted, fontSize: 10, fontWeight: '800', marginBottom: 4 },
  selectWrap: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, borderRadius: 8, overflow: 'hidden' },
  filterOption: { paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  filterOptionSelected: { backgroundColor: colors.paleBlue },
  filterText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  filterTextSelected: { color: colors.blue },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 10,
    minHeight: 40,
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: 12, marginLeft: 8 },
  actionRow: { marginTop: 14, alignItems: 'flex-start' },
  listCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  examHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  examIdentity: { flex: 1 },
  listTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  listText: { color: colors.muted, fontSize: 11, marginTop: 4 },
  recordGrid: { marginTop: 8 },
  detailLabel: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  detailValue: { color: colors.ink, fontSize: 11, marginTop: 2, lineHeight: 16 },
  statusBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusScheduled: { backgroundColor: colors.paleBlue, borderColor: colors.blue },
  statusComplete: { backgroundColor: colors.paleTeal, borderColor: colors.teal },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusBadgeTextScheduled: { color: colors.blue },
  statusBadgeTextDone: { color: colors.teal },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'space-between' },
  primaryButton: {
    backgroundColor: colors.blue,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 12 },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: { color: colors.blue, fontWeight: '800', fontSize: 12 },
  ghostButton: {
    backgroundColor: colors.paleBlue,
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: 10,
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  ghostButtonText: { color: colors.blue, fontWeight: '800', fontSize: 12 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 14, justifyContent: 'space-between' },
  listWrap: { marginTop: 14 },
  emptyState: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 18, marginTop: 14 },
  emptyTitle: { color: colors.ink, fontWeight: '800', fontSize: 14 },
  emptyText: { color: colors.muted, fontSize: 11, marginTop: 6, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(10, 20, 22, 0.35)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18 },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  modalDescription: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 10 },
  modalInfo: { color: colors.muted, fontSize: 12, marginTop: 6, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 14, justifyContent: 'space-between' },
  subjectList: { marginTop: 10, gap: 6 },
  subjectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10 },
  subjectText: { color: colors.ink, fontWeight: '700', fontSize: 12 },
  linkButton: { alignItems: 'center', marginTop: 12 },
  linkButtonText: { color: colors.blue, fontWeight: '800', fontSize: 12 },
  resultRow: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    gap: 4,
  },
  rowLabel: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  statusBox: { backgroundColor: colors.paleTeal, borderRadius: 999, borderWidth: 1, borderColor: colors.teal, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { color: colors.teal, fontWeight: '800', fontSize: 10 },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 20 },
  loadingText: { color: colors.muted, fontSize: 12 },
});
