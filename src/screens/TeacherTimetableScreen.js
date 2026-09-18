import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../services/api';
import { teacherAttendanceApi, teacherApi } from '../services/teacherApi';

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

const academicSessions = ['2026-2027', '2025-2026'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const classTimetableSeed = [
  { id: 'schedule-001', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Monday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Hindi', teacher: 'vivek N.', room: 'Room 101', type: 'lecture' },
  { id: 'schedule-002', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Monday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'English', teacher: 'ANIL K.', room: 'Room 102', type: 'lecture' },
  { id: 'schedule-003', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Monday', period: 'Period_3', startTime: '10:30', endTime: '11:20', subject: 'Telugu', teacher: 'ANIL K.', room: 'Room 103', type: 'lecture' },
  { id: 'schedule-004', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Monday', period: 'Period_4', startTime: '11:20', endTime: '12:00', subject: 'Science', teacher: 'sameer S.', room: 'Room 104', type: 'lecture' },
  { id: 'schedule-005', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Monday', period: 'Period_5', startTime: '12:00', endTime: '12:55', subject: 'Lunch', teacher: 'Staff', room: 'Cafeteria', type: 'break' },
  { id: 'schedule-006', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Tuesday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Math', teacher: 'Shivapriya R.', room: 'Room 201', type: 'lecture' },
  { id: 'schedule-007', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Tuesday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'English', teacher: 'sameer S.', room: 'Room 202', type: 'lecture' },
  { id: 'schedule-008', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Tuesday', period: 'Period_5', startTime: '12:00', endTime: '12:55', subject: 'Lunch', teacher: 'Staff', room: 'Cafeteria', type: 'break' },
  { id: 'schedule-009', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Wednesday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'Telugu', teacher: 'vivek N.', room: 'Room 203', type: 'lecture' },
  { id: 'schedule-010', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Wednesday', period: 'Period_3', startTime: '10:30', endTime: '11:20', subject: 'English', teacher: 'sudarsan k.', room: 'Room 204', type: 'lecture' },
  { id: 'schedule-011', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Wednesday', period: 'Period_5', startTime: '12:00', endTime: '12:55', subject: 'Lunch', teacher: 'Staff', room: 'Cafeteria', type: 'break' },
  { id: 'schedule-012', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Thursday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Science', teacher: 'sameer S.', room: 'Room 205', type: 'lecture' },
  { id: 'schedule-013', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Thursday', period: 'Period_4', startTime: '11:20', endTime: '12:00', subject: 'Math', teacher: 'Shivapriya R.', room: 'Room 206', type: 'lecture' },
  { id: 'schedule-014', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Thursday', period: 'Period_5', startTime: '12:00', endTime: '12:55', subject: 'Lunch', teacher: 'Staff', room: 'Cafeteria', type: 'break' },
  { id: 'schedule-015', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Friday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Math', teacher: 'Shivapriya R.', room: 'Room 207', type: 'lecture' },
  { id: 'schedule-016', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Friday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'Hindi', teacher: 'vivek N.', room: 'Room 208', type: 'lecture' },
  { id: 'schedule-017', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Friday', period: 'Period_5', startTime: '12:00', endTime: '12:55', subject: 'Lunch', teacher: 'Staff', room: 'Cafeteria', type: 'break' },
  { id: 'schedule-018', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Saturday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Science', teacher: 'Shivapriya R.', room: 'Room 301', type: 'lecture' },
  { id: 'schedule-019', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Saturday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'Math', teacher: 'Shivapriya R.', room: 'Room 302', type: 'lecture' },
  { id: 'schedule-020', academicSession: '2026-2027', className: 'Class_1', section: 'Sec A', day: 'Saturday', period: 'Period_5', startTime: '12:00', endTime: '12:55', subject: 'Lunch', teacher: 'Staff', room: 'Cafeteria', type: 'break' },
  { id: 'schedule-021', academicSession: '2026-2027', className: 'Class_1', section: 'Sec B', day: 'Monday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Telugu', teacher: 'vivek N.', room: 'Room 111', type: 'lecture' },
  { id: 'schedule-022', academicSession: '2026-2027', className: 'Class_1', section: 'Sec B', day: 'Monday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'English', teacher: 'Shivapriya R.', room: 'Room 112', type: 'lecture' },
  { id: 'schedule-023', academicSession: '2026-2027', className: 'Class_1', section: 'Sec B', day: 'Tuesday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Science', teacher: 'sameer S.', room: 'Room 113', type: 'lecture' },
  { id: 'schedule-024', academicSession: '2026-2027', className: 'Class_1', section: 'Sec B', day: 'Wednesday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'Hindi', teacher: 'ANIL K.', room: 'Room 114', type: 'lecture' },
  { id: 'schedule-025', academicSession: '2026-2027', className: 'Class_1', section: 'Sec B', day: 'Friday', period: 'Period_3', startTime: '10:30', endTime: '11:20', subject: 'Telugu', teacher: 'vivek N.', room: 'Room 115', type: 'lecture' },
  { id: 'schedule-026', academicSession: '2026-2027', className: 'Class_1', section: 'Sec C', day: 'Monday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'English', teacher: 'sameer S.', room: 'Room 121', type: 'lecture' },
  { id: 'schedule-027', academicSession: '2026-2027', className: 'Class_1', section: 'Sec C', day: 'Tuesday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'Telugu', teacher: 'vivek N.', room: 'Room 122', type: 'lecture' },
  { id: 'schedule-028', academicSession: '2026-2027', className: 'Class_1', section: 'Sec C', day: 'Wednesday', period: 'Period_1', startTime: '09:00', endTime: '09:40', subject: 'Science', teacher: 'Shivapriya R.', room: 'Room 123', type: 'lecture' },
  { id: 'schedule-029', academicSession: '2026-2027', className: 'Class_1', section: 'Sec C', day: 'Thursday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'Hindi', teacher: 'ANIL K.', room: 'Room 124', type: 'lecture' },
  { id: 'schedule-030', academicSession: '2026-2027', className: 'Class_1', section: 'Sec C', day: 'Saturday', period: 'Period_3', startTime: '10:30', endTime: '11:20', subject: 'Math', teacher: 'Shivapriya R.', room: 'Room 125', type: 'lecture' },
];

const teacherTimetableSeed = [
  { id: 'teacher-schedule-001', academicSession: '2026-2027', facultyId: '324', facultyName: 'sudarsan kumar', day: 'Monday', period: 'period1', startTime: '10:44', endTime: '10:50', subject: 'Science', className: 'Class_2', section: 'A', room: 'Room 15' },
  { id: 'teacher-schedule-002', academicSession: '2026-2027', facultyId: '324', facultyName: 'sudarsan kumar', day: 'Tuesday', period: 'period1', startTime: '10:44', endTime: '10:50', subject: 'Science', className: 'Class_2', section: 'A', room: 'Room 15' },
  { id: 'teacher-schedule-003', academicSession: '2026-2027', facultyId: '324', facultyName: 'sudarsan kumar', day: 'Wednesday', period: 'period1', startTime: '10:44', endTime: '10:50', subject: 'Science', className: 'Class_2', section: 'A', room: 'Room 15' },
  { id: 'teacher-schedule-004', academicSession: '2026-2027', facultyId: '324', facultyName: 'sudarsan kumar', day: 'Monday', period: 'Period_2', startTime: '09:40', endTime: '10:30', subject: 'Englishh', className: 'Class_1', section: 'A', room: '4' },
  { id: 'teacher-schedule-005', academicSession: '2026-2027', facultyId: '324', facultyName: 'sudarsan kumar', day: 'Monday', period: 'Period_3', startTime: '10:30', endTime: '11:20', subject: 'Englishh', className: 'Class_1', section: 'A', room: '4' },
  { id: 'teacher-schedule-006', academicSession: '2026-2027', facultyId: '324', facultyName: 'sudarsan kumar', day: 'Monday', period: 'period', startTime: '22:36', endTime: '00:36', subject: 'English', className: 'class1', section: 'A', room: '12' },
  { id: 'teacher-schedule-007', academicSession: '2026-2027', facultyId: '324', facultyName: 'sudarsan kumar', day: 'Tuesday', period: 'period', startTime: '22:36', endTime: '00:36', subject: 'English', className: 'class1', section: 'C', room: '35' },
];

const teacherPeriods = [
  { id: 'period1', label: 'period1', startTime: '10:44', endTime: '10:50' },
  { id: 'Period_2', label: 'Period_2', startTime: '09:40', endTime: '10:30' },
  { id: 'Period_3', label: 'Period_3', startTime: '10:30', endTime: '11:20' },
  { id: 'period', label: 'period', startTime: '22:36', endTime: '00:36' },
];

const periodTemplates = [
  { id: 'Period_1', name: 'Period_1', startTime: '09:00', endTime: '09:40' },
  { id: 'Period_2', name: 'Period_2', startTime: '09:40', endTime: '10:30' },
  { id: 'Period_3', name: 'Period_3', startTime: '10:30', endTime: '11:20' },
  { id: 'Period_4', name: 'Period_4', startTime: '11:20', endTime: '12:00' },
  { id: 'Period_5', name: 'Period_5', startTime: '12:00', endTime: '12:55' },
  { id: 'Period_6', name: 'Period_6', startTime: '13:00', endTime: '13:50' },
  { id: 'Period_7', name: 'Period_7', startTime: '13:50', endTime: '14:40' },
  { id: 'Period_8', name: 'Period_8', startTime: '14:40', endTime: '15:30' },
];

function Icon({ name, size = 18, color = colors.ink }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function FilterSelect({ label, value, options, onChange, accentColor = colors.blue }) {
  const [open, setOpen] = useState(false);
  const normalizedOptions = Array.isArray(options) ? options : [];
  const optionLabel = (option) => typeof option === 'string' ? option : option?.label || option?.name || option?.id || 'Option';

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={styles.select} onPress={() => setOpen(true)}>
        <Text style={styles.selectText}>{value}</Text>
        <Icon name="chevron-down" size={17} color={accentColor} />
      </Pressable>
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.optionsSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>{label}</Text>
              <Pressable hitSlop={10} onPress={() => setOpen(false)}>
                <Icon name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>
            {normalizedOptions.map((option) => {
              const optionText = optionLabel(option);
              const optionValue = typeof option === 'string' ? option : option?.id || optionText;
              return (
                <Pressable
                  key={optionValue}
                  style={[styles.optionRow, value === optionValue || value === optionText ? styles.optionActive : null]}
                  onPress={() => {
                    onChange(typeof option === 'string' ? option : optionText);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, (value === optionValue || value === optionText) && styles.optionTextActive]}>{optionText}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function SummaryCard({ icon, title, value, label, tint, accent }) {
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

function getDisplayEntries(entries) {
  if (!entries.length) return [];
  return entries.map((entry) => ({
    key: `${entry.id}-${entry.day}-${entry.period}`,
    ...entry,
  }));
}

const normalizeTimetableRecords = (items) => {
  const source = Array.isArray(items) ? items : [];
  return source.map((entry, index) => ({
    ...entry,
    id: entry.id || `timetable-${index}`,
    className: entry.className || entry.class_name || entry.targetClass || 'Class_1',
    section: entry.section || entry.division || entry.division_name || entry.section_name || 'Sec A',
    academicSession: entry.academicSession || entry.academic_session || '2026-2027',
    day: entry.day || entry.day_name || 'Monday',
    period: entry.period || entry.period_name || entry.slot || 'Period_1',
    startTime: entry.startTime || entry.start_time || '09:00',
    endTime: entry.endTime || entry.end_time || '09:40',
    subject: entry.subject || entry.subject_name || 'Subject',
    teacher: entry.teacher || entry.teacher_name || entry.faculty_name || 'Staff',
    room: entry.room || entry.room_no || entry.allocation || entry.roomNumber || 'TBA',
    type: entry.type || (entry.subject === 'Lunch' || entry.subject === 'Break' ? 'break' : 'lecture'),
  }));
};

export default function TeacherTimetableScreen({ session, initialTab = 'Class Timetable' }) {
  const [records, setRecords] = useState(classTimetableSeed);
  const [teacherRecords, setTeacherRecords] = useState(teacherTimetableSeed);
  const [tab, setTab] = useState(() => initialTab || 'Class Timetable');
  const [academicSession, setAcademicSession] = useState('2026-2027');
  const [className, setClassName] = useState('Class_1');
  const [sectionFilter, setSectionFilter] = useState('All Divisions / Sections (Full Class)');
  const [showAllPeriods, setShowAllPeriods] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const [facultyMember, setFacultyMember] = useState('sudarsan kumar (324)');
  const [assignedOnly, setAssignedOnly] = useState(true);
  const [classOptions, setClassOptions] = useState([
    { id: 'Class_1', label: 'Class_1' },
    { id: 'Class_2', label: 'Class_2' },
  ]);
  const [sectionOptions, setSectionOptions] = useState(['All Divisions / Sections (Full Class)']);

  useEffect(() => {
    let active = true;

    const fetchTimetable = async () => {
      if (!session) {
        if (active) {
          setRecords(classTimetableSeed);
          setTeacherRecords(teacherTimetableSeed);
          setClassOptions(Array.from(new Set(classTimetableSeed.map((item) => item.className))).map((item) => ({ id: item, label: item })));
        }
        return;
      }

      if (active) {
        setLoading(true);
        setRefreshError('');
      }

      try {
        const [defaultClasses, liveTimetable] = await Promise.all([
          teacherAttendanceApi.getAcademicClasses(session),
          teacherApi.getTimetable(session),
        ]);

        if (!active) return;

        const nextRecords = normalizeTimetableRecords((Array.isArray(liveTimetable) && liveTimetable.length ? liveTimetable : classTimetableSeed));
        const classList = (defaultClasses.length ? defaultClasses : Array.from(new Set(nextRecords.map((item) => item.className))).map((item) => ({ id: item, label: item })))
          .map((item) => {
            const rawId = item.id ?? item.value ?? item.label ?? item.name ?? item;
            const rawLabel = item.label ?? item.name ?? item.id ?? item.value ?? item;
            return { id: String(rawId), label: String(rawLabel) };
          });

        const selectedClass = classList.find((option) => option.label === className || option.id === className) || classList[0];
        if (selectedClass && session) {
          try {
            const divisions = await teacherAttendanceApi.getAcademicDivisions(session, selectedClass.id);
            const names = divisions.length
              ? divisions.map((item) => item.label || item.name || item.id || 'Section')
              : Array.from(new Set(nextRecords.filter((item) => item.className === selectedClass.label).map((item) => item.section)));
            if (active) setSectionOptions(['All Divisions / Sections (Full Class)', ...names]);
          } catch (requestError) {
            const fallback = Array.from(new Set(nextRecords.filter((item) => item.className === selectedClass.label).map((item) => item.section)));
            if (active) setSectionOptions(['All Divisions / Sections (Full Class)', ...fallback]);
            if (requestError instanceof ApiError && requestError.status !== 404) {
              if (active) setRefreshError(requestError.message);
            }
          }
        }

        if (active) {
          setRecords(nextRecords);
          setTeacherRecords((Array.isArray(liveTimetable) && liveTimetable.length ? normalizeTimetableRecords(liveTimetable) : teacherTimetableSeed));
          setClassOptions(classList.length ? classList : [{ id: 'Class_1', label: 'Class_1' }]);
          const currentClassMatches = classList.find((option) => option.label === className || option.id === className);
          if (!currentClassMatches && classList.length) {
            setClassName(classList[0].label);
          }
        }
      } catch (requestError) {
        if (active) {
          setRefreshError(requestError instanceof ApiError ? requestError.message : 'Unable to refresh timetable data.');
          setRecords(classTimetableSeed);
          setTeacherRecords(teacherTimetableSeed);
          setClassOptions(Array.from(new Set(classTimetableSeed.map((item) => item.className))).map((item) => ({ id: item, label: item })));
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void fetchTimetable();
    return () => { active = false; };
  }, [className, session]);

  const sectionOptionsForClass = useMemo(() => {
    const fallbackValues = sectionOptions.length > 1
      ? sectionOptions.slice(1)
      : Array.from(new Set(
          records
            .filter((item) => item.className === className)
            .map((item) => item.section),
        ));

    return ['All Divisions / Sections (Full Class)', ...fallbackValues];
  }, [className, records, sectionOptions]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      if (item.academicSession !== academicSession) return false;
      if (item.className !== className) return false;
      if (sectionFilter !== 'All Divisions / Sections (Full Class)' && item.section !== sectionFilter) {
        return false;
      }
      return true;
    });
  }, [academicSession, className, records, sectionFilter]);

  const periodList = useMemo(() => {
    if (showAllPeriods) {
      return periodTemplates;
    }
    return periodTemplates.filter((period) =>
      filteredRecords.some((item) => item.period === period.id),
    );
  }, [filteredRecords, showAllPeriods]);

  const columnEntries = useMemo(() => {
    const map = {};
    days.forEach((day) => {
      map[day] = {};
      periodList.forEach((period) => {
        map[day][period.id] = filteredRecords.filter(
          (item) => item.day === day && item.period === period.id,
        );
      });
    });
    return map;
  }, [filteredRecords, periodList]);

  const allocatedSlots = filteredRecords.length;

  const facultyOptions = useMemo(() => {
    const set = new Set(teacherRecords.map((item) => `${item.facultyName} (${item.facultyId})`));
    return Array.from(set);
  }, [teacherRecords]);

  const selectedFacultyName = useMemo(() => facultyMember.split(' (')[0], [facultyMember]);

  const teacherFilteredRecords = useMemo(() => {
    const sessionRecords = teacherRecords.filter((item) => item.academicSession === academicSession);
    if (assignedOnly) {
      return sessionRecords.filter((item) => item.facultyName === selectedFacultyName);
    }
    return sessionRecords;
  }, [academicSession, assignedOnly, selectedFacultyName, teacherRecords]);

  const weeklyWorkload = teacherFilteredRecords.length;
  const dailyAverage = (weeklyWorkload / 6).toFixed(1);
  const uniqueSubjects = new Set(teacherFilteredRecords.map((item) => item.subject.trim())).size;

  const teacherMatrixMap = useMemo(() => {
    const map = {};
    days.forEach((day) => {
      map[day] = {};
      teacherPeriods.forEach((period) => {
        map[day][period.id] = teacherFilteredRecords.filter(
          (item) => item.day === day && item.period === period.id,
        );
      });
    });
    return map;
  }, [teacherFilteredRecords]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    setRefreshError('');
  };

  const statusMessage = refreshError || (loading ? 'Loading timetable...' : '');

  const handlePrintSchedule = () => {
    Alert.alert('Print Schedule', 'This action is ready to connect to a print/export service.');
  };

  const teacherTimetableSubView = (
    <View style={styles.teacherView}>
      <View style={styles.headerCard}>
        <View style={styles.headerRowWrap}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>My Teaching Schedule</Text>
            <Text style={styles.subtitle}>View your personal weekly teaching workload, subject duties, and classrooms</Text>
          </View>
          <Pressable style={styles.printButton} onPress={handlePrintSchedule}>
            <Icon name="print-outline" size={17} color={colors.blue} />
            <Text style={styles.printText}>Print Schedule</Text>
          </Pressable>
        </View>
        <Text style={styles.sessionLabel}>Session: {academicSession}</Text>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard icon="person-outline" title="Assigned Teacher" value={selectedFacultyName} label="Assigned Teacher" tint={colors.paleBlue} accent={colors.blue} />
        <SummaryCard icon="bar-chart-outline" title="Weekly Workload" value={`${weeklyWorkload} Periods`} label="Weekly Workload" tint={colors.paleTeal} accent={colors.teal} />
        <SummaryCard icon="stats-chart-outline" title="Average Daily Load" value={`${dailyAverage} / Day`} label="Avg Daily Load" tint={colors.paleOrange} accent={colors.orange} />
        <SummaryCard icon="library-outline" title="Assigned Subjects" value={`${uniqueSubjects} Subjects`} label="Assigned Subjects" tint={colors.softLilac} accent={colors.plum} />
      </View>

      <View style={styles.filtersCard}>
        <FilterSelect
          label="Academic Session"
          value={academicSession}
          options={academicSessions}
          onChange={setAcademicSession}
        />

        <FilterSelect
          label="Faculty Member"
          value={facultyMember}
          options={facultyOptions}
          onChange={setFacultyMember}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Assigned Only</Text>
          <Pressable
            style={[styles.toggleSwitch, assignedOnly && styles.toggleSwitchActive]}
            onPress={() => setAssignedOnly((current) => !current)}
          >
            <View style={[styles.toggleThumb, assignedOnly && styles.toggleThumbActive]} />
          </Pressable>
        </View>
      </View>

      <View style={styles.matrixWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.teacherMatrixTable}>
            <View style={styles.headerRow}>
              <View style={styles.periodHeaderCell}>
                <Text style={styles.headerText}>Period / Time</Text>
              </View>
              {days.map((day) => (
                <View key={day} style={styles.dayHeaderCell}>
                  <Text style={styles.headerText}>{day}</Text>
                </View>
              ))}
            </View>

            {teacherPeriods.map((period) => (
              <View key={period.id} style={styles.periodRow}>
                <View style={styles.periodCell}>
                  <Text style={styles.periodName}>{period.label}</Text>
                  <Text style={styles.periodTime}>{period.startTime} - {period.endTime}</Text>
                </View>
                {days.map((day) => {
                  const rowEntries = teacherMatrixMap[day]?.[period.id] || [];
                  return (
                    <Pressable
                      key={`${day}-${period.id}`}
                      style={[styles.teacherDayCell, !rowEntries.length && styles.teacherDayCellEmpty]}
                      onPress={() => {
                        if (rowEntries.length) {
                          setSelectedCell({ day, period, entries: rowEntries });
                        }
                      }}
                    >
                      {rowEntries.length ? (
                        rowEntries.map((entry) => (
                          <View key={entry.id} style={styles.subjectCard}>
                            <Text style={styles.subjectText} numberOfLines={2}>{entry.subject}</Text>
                            <Text style={styles.metaText}>Class {entry.className} - {entry.section}</Text>
                            {entry.room ? <Text style={styles.metaText}>Room: {entry.room}</Text> : null}
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyCellText}>—</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topTabs}>
        {['Class Timetable', 'Teacher Timetable'].map((item) => (
          <Pressable
            key={item}
            style={[styles.topTab, tab === item && styles.topTabActive]}
            onPress={() => setTab(item)}
          >
            <Text style={[styles.topTabText, tab === item && styles.topTabTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'Class Timetable' ? (
        <>
          <View style={styles.headerCard}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Master Class Timetable</Text>
              <Text style={styles.subtitle}>Design, assign, and manage weekly classroom lecture schedules by division or grade</Text>
            </View>
            <Pressable style={styles.refreshButton} onPress={handleRefresh} disabled={refreshing}>
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.blue} />
              ) : (
                <Icon name="refresh-outline" size={17} color={colors.blue} />
              )}
              <Text style={styles.refreshText}>{refreshing ? 'Refreshing...' : 'Refresh Matrix'}</Text>
            </Pressable>
            <Text style={styles.sessionLabel}>Session: {academicSession}</Text>
          </View>

          {statusMessage ? (
            <View style={styles.statusBanner}>
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          ) : null}

          <View style={styles.summaryGrid}>
            <SummaryCard icon="school-outline" title="Class" value={className} label="Grade Target" tint={colors.paleBlue} accent={colors.blue} />
            <SummaryCard icon="calendar-outline" title="Working Days" value="6 Days" label="Working Days" tint={colors.paleTeal} accent={colors.teal} />
            <SummaryCard icon="time-outline" title="Period Slots" value={String(periodTemplates.length)} label="Period Slots" tint={colors.paleOrange} accent={colors.orange} />
            <SummaryCard icon="briefcase-outline" title="Allocated Slots" value={String(allocatedSlots)} label="Scheduled" tint={colors.softLilac} accent={colors.plum} />
            <SummaryCard icon="document-text-outline" title="Academic Session" value={academicSession} label="Current cycle" tint={colors.paleBlue} accent={colors.blue} />
          </View>

          <View style={styles.filtersCard}>
            <FilterSelect label="Academic Session" value={academicSession} options={academicSessions} onChange={setAcademicSession} />
            <FilterSelect label="Class / Grade" value={className} options={classOptions} onChange={setClassName} />
            <FilterSelect label="Division / Section" value={sectionFilter} options={['All Divisions / Sections (Full Class)', ...sectionOptionsForClass]} onChange={setSectionFilter} />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show All Periods</Text>
              <Pressable style={[styles.toggleSwitch, showAllPeriods && styles.toggleSwitchActive]} onPress={() => setShowAllPeriods((current) => !current)}>
                <View style={[styles.toggleThumb, showAllPeriods && styles.toggleThumbActive]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.matrixWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.matrixTable}>
                <View style={styles.headerRow}>
                  <View style={styles.periodHeaderCell}><Text style={styles.headerText}>Period</Text></View>
                  {days.map((day) => (
                    <View key={day} style={styles.dayHeaderCell}><Text style={styles.headerText}>{day}</Text></View>
                  ))}
                </View>

                {periodList.map((period) => (
                  <View key={period.id} style={styles.periodRow}>
                    <View style={styles.periodCell}>
                      <Text style={styles.periodName}>{period.name}</Text>
                      <Text style={styles.periodTime}>{period.startTime} - {period.endTime}</Text>
                    </View>
                    {days.map((day) => {
                      const entries = getDisplayEntries(columnEntries[day]?.[period.id] || []);
                      return (
                        <Pressable
                          key={`${day}-${period.id}`}
                          style={[styles.dayCell, !entries.length && styles.dayCellEmpty]}
                          onPress={() => entries.length && setSelectedCell({ day, period, entries })}
                        >
                          {entries.length ? (
                            <>
                              <Text style={styles.cellCount}>{entries.length} {entries.length === 1 ? 'Section' : 'Sections'}</Text>
                              {entries.slice(0, 2).map((entry) => (
                                <Text key={entry.id} style={styles.cellSubject} numberOfLines={2}>{entry.subject}</Text>
                              ))}
                              {entries.length > 2 ? <Text style={styles.cellSubjectMuted}>+{entries.length - 2} more</Text> : null}
                            </>
                          ) : (
                            <Text style={styles.emptyCellText}>-</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </>
      ) : (
        teacherTimetableSubView
      )}

      <Modal transparent visible={Boolean(selectedCell)} animationType="fade" onRequestClose={() => setSelectedCell(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedCell(null)}>
          <View style={styles.detailSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Timetable Details</Text>
              <Pressable hitSlop={10} onPress={() => setSelectedCell(null)}>
                <Icon name="close" size={22} color={colors.ink} />
              </Pressable>
            </View>

            {selectedCell ? (
              <View style={styles.detailList}>
                <Text style={styles.detailMeta}><Text style={styles.detailKey}>Day:</Text> {selectedCell.day}</Text>
                <Text style={styles.detailMeta}><Text style={styles.detailKey}>Period:</Text> {selectedCell.period.label || selectedCell.period.name}</Text>
                <Text style={styles.detailMeta}><Text style={styles.detailKey}>Start Time:</Text> {selectedCell.period.startTime}</Text>
                <Text style={styles.detailMeta}><Text style={styles.detailKey}>End Time:</Text> {selectedCell.period.endTime}</Text>
                {selectedCell.entries.map((entry, index) => (
                  <View key={`${entry.id}-${index}`} style={styles.detailEntry}>
                    <Text style={styles.detailEntryTitle}>{entry.subject}</Text>
                    <Text style={styles.detailMeta}><Text style={styles.detailKey}>Teacher:</Text> {entry.teacher || selectedFacultyName}</Text>
                    <Text style={styles.detailMeta}><Text style={styles.detailKey}>Section:</Text> {entry.section}</Text>
                    <Text style={styles.detailMeta}><Text style={styles.detailKey}>Class:</Text> {entry.className}</Text>
                    <Text style={styles.detailMeta}><Text style={styles.detailKey}>Academic Session:</Text> {entry.academicSession || academicSession}</Text>
                    <Text style={styles.detailMeta}><Text style={styles.detailKey}>Room:</Text> {entry.room || 'TBA'}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 140 },
  topTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  topTab: {
    flex: 1,
    minHeight: 42,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabActive: { backgroundColor: colors.paleBlue, borderColor: colors.blue },
  topTabText: { color: colors.ink, fontWeight: '800', fontSize: 12 },
  topTabTextActive: { color: colors.blue },
  teacherView: { gap: 12 },
  headerCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 2,
  },
  headerRowWrap: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  headerTextWrap: { marginBottom: 10 },
  title: { fontSize: 23, fontWeight: '900', color: colors.ink },
  subtitle: { marginTop: 5, color: colors.muted, fontSize: 11 },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.paleBlue,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  printText: { color: colors.blue, fontWeight: '800', fontSize: 12 },
  refreshButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.blue,
    backgroundColor: colors.paleBlue,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshText: { color: colors.blue, fontWeight: '800', fontSize: 12 },
  sessionLabel: { marginTop: 10, color: colors.ink, fontSize: 12, fontWeight: '800' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 2 },
  summaryCard: {
    width: '31%',
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  summaryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  summaryTitle: { marginTop: 9, color: colors.ink, fontSize: 10, fontWeight: '900' },
  summaryValue: { marginTop: 4, color: colors.ink, fontSize: 16, fontWeight: '900' },
  summaryLabel: { marginTop: 3, color: colors.muted, fontSize: 8, textTransform: 'uppercase' },
  filtersCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    marginBottom: 2,
  },
  field: { marginBottom: 12 },
  fieldLabel: { color: colors.ink, fontSize: 10, fontWeight: '900', marginBottom: 6 },
  select: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 9,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { color: colors.ink, fontSize: 12, flex: 1 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  toggleLabel: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  toggleSwitch: {
    width: 46,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#D8E2E4',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleSwitchActive: { backgroundColor: colors.blue },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    marginLeft: 0,
  },
  toggleThumbActive: { marginLeft: 18 },
  matrixWrap: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 12, overflow: 'hidden' },
  matrixTable: { minWidth: 700 },
  teacherMatrixTable: { minWidth: 760 },
  statusBanner: { backgroundColor: '#FFF5EA', borderWidth: 1, borderColor: '#F2D8B3', borderRadius: 10, padding: 10, marginBottom: 12 },
  statusText: { color: '#B96A1A', fontSize: 11, fontWeight: '700' },
  headerRow: { flexDirection: 'row', backgroundColor: colors.navy },
  periodHeaderCell: {
    width: 120,
    minHeight: 46,
    padding: 8,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
  },
  dayHeaderCell: {
    width: 120,
    minHeight: 46,
    padding: 8,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { color: colors.white, fontWeight: '800', fontSize: 11 },
  periodRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.line },
  periodCell: {
    width: 120,
    minHeight: 130,
    backgroundColor: colors.paleBlue,
    padding: 8,
    borderRightWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  periodName: { color: colors.ink, fontSize: 12, fontWeight: '900' },
  periodTime: { marginTop: 4, color: colors.muted, fontSize: 10 },
  dayCell: {
    width: 120,
    minHeight: 115,
    padding: 8,
    borderRightWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  teacherDayCell: {
    width: 120,
    minHeight: 130,
    padding: 8,
    borderRightWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  teacherDayCellEmpty: { backgroundColor: '#F9FBFB' },
  dayCellEmpty: { backgroundColor: '#F9FBFB' },
  cellCount: { color: colors.blue, fontSize: 10, fontWeight: '900', marginBottom: 4 },
  cellSubject: { color: colors.ink, fontSize: 11, fontWeight: '700', marginBottom: 2 },
  cellSubjectMuted: { color: colors.muted, fontSize: 9 },
  subjectCard: {
    backgroundColor: colors.paleBlue,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 6,
    marginBottom: 5,
  },
  subjectText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  metaText: { color: colors.muted, fontSize: 9, marginTop: 3 },
  emptyCellText: { color: colors.muted, textAlign: 'center', fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9, 19, 27, 0.35)', justifyContent: 'flex-end' },
  optionsSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '60%',
  },
  optionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  optionTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  optionRow: {
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  optionActive: { backgroundColor: colors.paleBlue },
  optionText: { color: colors.ink, fontSize: 13 },
  optionTextActive: { color: colors.blue, fontWeight: '800' },
  detailSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '75%',
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  detailTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  detailList: { gap: 8 },
  detailMeta: { color: colors.ink, fontSize: 12 },
  detailKey: { fontWeight: '800' },
  detailEntry: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.canvas,
    padding: 10,
    marginTop: 6,
  },
  detailEntryTitle: { color: colors.ink, fontSize: 14, fontWeight: '900', marginBottom: 6 },
});
