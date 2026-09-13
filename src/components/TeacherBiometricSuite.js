import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { biometricApi } from '../services/biometricApi';

const colors = { ink: '#17343B', muted: '#6A7F83', line: '#D9E7E4', white: '#FFFFFF', canvas: '#F4F8F6', blue: '#0D8B82', navy: '#123B43', paleBlue: '#E5F4F0', green: '#1E8E5E', paleGreen: '#E8F8F1', red: '#B94E4E', paleRed: '#FDECEC', orange: '#A76E00', paleOrange: '#FFF7DF' };
const tabs = ['Registered Devices', 'User Enrollments', 'Live Punch Feeds', 'Webhook & Test Simulator'];
const deviceTypes = ['Hikvision', 'ZKTeco', 'Dahua'];
const blankDevice = { name: '', type: 'Hikvision', deviceId: '', location: '', host: '', port: '80', username: '', password: '', protocol: 'HTTP' };
const blankEnrollment = { user: '', category: 'Student', erpId: '', biometricUid: '', device: '', className: '', section: '' };
const enrollmentCategories = ['Student', 'Teacher', 'Parent', 'Staff'];

function Icon({ name, size = 18, color = colors.ink }) { return <Ionicons name={name} size={size} color={color} />; }
function Button({ title, onPress, secondary = false, icon = 'arrow-forward-outline' }) { return <Pressable style={[styles.button, secondary && styles.secondaryButton]} onPress={onPress}><Icon name={icon} size={16} color={secondary ? colors.blue : colors.white} /><Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text></Pressable>; }
function Field({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} secureTextEntry={secureTextEntry} keyboardType={keyboardType} style={styles.input} /></View>; }
function Empty({ title, message, action, onAction }) { return <View style={styles.empty}><Icon name="hardware-chip-outline" size={30} color={colors.blue} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyMessage}>{message}</Text>{action ? <Button title={action} onPress={onAction} icon="add-outline" /> : null}</View>; }
function SummaryCard({ value, label, icon }) { return <View style={styles.summaryCard}><View style={styles.summaryIcon}><Icon name={icon} size={17} color={colors.blue} /></View><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }

function validateDevice(device, devices) {
  if (!device.name.trim()) return 'Device Name is required.';
  if (!deviceTypes.includes(device.type)) return 'Choose a supported device type.';
  if (device.deviceId.trim() && devices.some((item) => (item.deviceId || '').toLowerCase() === device.deviceId.trim().toLowerCase())) return 'Serial Number already exists.';
  return '';
}

export default function TeacherBiometricSuite({ session }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [snapshot, setSnapshot] = useState({ devices: [], enrollments: [], punches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const showDeviceForm = false;
  const setShowDeviceForm = (visible) => setShowDeviceModal(visible);
  const [device, setDevice] = useState(blankDevice);
  const [deviceError, setDeviceError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [enrollment, setEnrollment] = useState(blankEnrollment);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(`All Categories (${enrollmentCategories.length})`);
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentSaving, setEnrollmentSaving] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('Students');
  const [bulkCandidates, setBulkCandidates] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [simulator, setSimulator] = useState({ biometricUid: '10004', punchType: 'IN', timestamp: new Date().toISOString().slice(0, 16) });

  const refresh = async () => {
    setLoading(true); setError('');
    try {
      const next = await biometricApi.getSnapshot(session);
      const enrollments = await biometricApi.getEnrollments(session);
      const punches = await biometricApi.getPunches(session);
      setSnapshot({ ...next, enrollments, punches });
    } catch { setError('Unable to load biometric data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [session]);

  const loadBulkCandidates = async (category = bulkCategory) => {
    setBulkLoading(true);
    try {
      const candidates = await biometricApi.getAutoMapCandidates(category, session);
      const existing = new Set(snapshot.enrollments.map((item) => String(item.biometricUid)));
      setBulkCandidates((candidates || []).filter((candidate) => candidate.personName && candidate.admissionOrEmployeeCode && !candidate.biometricUid && !existing.has(String(candidate.admissionOrEmployeeCode))));
    } catch { setEnrollmentError('Unable to load auto-mapping candidates.'); }
    finally { setBulkLoading(false); }
  };

  const openBulkModal = () => { setBulkResult(null); setBulkProgress(null); setEnrollmentError(''); setShowBulkModal(true); loadBulkCandidates(); };

  const autoMap = () => {
    if (!bulkCandidates.length) return;
    Alert.alert('Bulk Auto-Mapping', `${bulkCandidates.length} ${bulkCategory.toLowerCase()} are eligible for automatic biometric mapping. Existing biometric mappings will not be overwritten. Do you want to continue?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Auto-Map', onPress: async () => {
      setBulkLoading(true); setBulkProgress({ completed: 0, total: bulkCandidates.length });
      try { const result = await biometricApi.autoMapEnrollments(bulkCategory, bulkCandidates, session); setBulkResult(result); await refresh(); }
      catch { setEnrollmentError('Bulk auto-mapping failed. Please try again.'); }
      finally { setBulkLoading(false); setBulkProgress(null); }
    } }]);
  };

  const unmapped = useMemo(() => snapshot.punches.filter((punch) => punch.status === 'Unmapped').length, [snapshot.punches]);
  const online = snapshot.devices.filter((deviceItem) => deviceItem.status === 'Online').length;

  const registerDevice = async () => {
    const validationError = validateDevice(device, snapshot.devices);
    if (validationError) { setDeviceError(validationError); return; }
    setRegistering(true);
    setDeviceError('');
    try { await biometricApi.registerDevice(device, session); setDevice(blankDevice); setShowDeviceForm(false); await refresh(); Alert.alert('Device registered', 'The device was added with an Unknown status until the backend tests its connection.'); }
    catch { setDeviceError('The biometric backend could not register this device.'); }
    finally { setRegistering(false); }
  };

  const testConnection = async (deviceItem) => {
    const result = await biometricApi.testConnection(deviceItem, session);
    Alert.alert(result.simulated ? 'Connection test unavailable' : 'Connection tested', result.message || `Device status: ${result.status || 'Unknown'}.`);
  };

  const deleteDevice = (deviceItem) => Alert.alert('Delete device?', deviceItem.name, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await biometricApi.deleteDevice(deviceItem.id, session); refresh(); } }]);

  const filteredEnrollments = useMemo(() => {
    const query = enrollmentSearch.trim().toLowerCase();
    return snapshot.enrollments.filter((item) => {
      const matchesSearch = !query || [item.user, item.person_name, item.erpId, item.admission_or_staff_code, item.biometricUid].some((value) => String(value || '').toLowerCase().includes(query));
      const matchesCategory = categoryFilter.startsWith('All Categories') || String(item.category || '').toLowerCase() === categoryFilter.toLowerCase();
      const matchesClass = classFilter === 'All Classes' || item.className === classFilter;
      const matchesSection = sectionFilter === 'All Sections' || item.section === sectionFilter;
      return matchesSearch && matchesCategory && matchesClass && matchesSection;
    });
  }, [snapshot.enrollments, enrollmentSearch, categoryFilter, classFilter, sectionFilter]);

  const enrollmentClasses = useMemo(() => [...new Set(snapshot.enrollments.map((item) => item.className).filter(Boolean))], [snapshot.enrollments]);
  const enrollmentSections = useMemo(() => [...new Set(snapshot.enrollments.map((item) => item.section).filter(Boolean))], [snapshot.enrollments]);

  const saveEnrollment = async () => {
    if (!enrollment.user.trim() || !enrollment.category.trim() || !enrollment.erpId.trim() || !enrollment.biometricUid.trim() || !enrollment.device.trim()) { setEnrollmentError('Person, category, code, UID, and assigned machine are required.'); return; }
    const duplicate = snapshot.enrollments.some((item) => String(item.biometricUid) === enrollment.biometricUid.trim() && item.id !== editingEnrollment?.id);
    const duplicatePerson = snapshot.enrollments.some((item) => String(item.erpId) === enrollment.erpId.trim() && item.id !== editingEnrollment?.id);
    if (duplicate) { setEnrollmentError('This biometric UID is already assigned to another user.'); return; }
    if (duplicatePerson) { setEnrollmentError('This person already has an active biometric mapping.'); return; }
    setEnrollmentSaving(true); setEnrollmentError('');
    try {
      if (editingEnrollment) await biometricApi.updateEnrollment(editingEnrollment.id, enrollment, session);
      else await biometricApi.saveEnrollment({ ...enrollment, enrolledDate: new Date().toISOString() }, session);
      setEnrollment(blankEnrollment); setEditingEnrollment(null); setShowEnrollmentModal(false); await refresh(); Alert.alert(editingEnrollment ? 'Enrollment updated' : 'UID enrolled', 'The enrollment list has been refreshed.');
    } catch { setEnrollmentError('Unable to save this enrollment. Please try again.'); }
    finally { setEnrollmentSaving(false); }
  };

  const openEnrollment = (item = null) => { setEditingEnrollment(item); setEnrollment(item ? { ...blankEnrollment, ...item } : blankEnrollment); setEnrollmentError(''); setShowEnrollmentModal(true); };
  const removeEnrollment = (item) => Alert.alert('Remove biometric mapping?', `${item.user || item.person_name} · UID ${item.biometricUid}`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: async () => { await biometricApi.deleteEnrollment(item.id, session); refresh(); } }]);

  const importCsv = async () => {
    const rows = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (rows.length < 2) { setEnrollmentError('Paste a CSV header and at least one enrollment row.'); return; }
    const headers = rows[0].split(',').map((value) => value.trim().toLowerCase());
    const indexOf = (...names) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0);
    const personIndex = indexOf('person name', 'person', 'user', 'person_name');
    const codeIndex = indexOf('admission / staff code', 'admission code', 'staff code', 'erp id', 'erpid');
    const uidIndex = indexOf('biometric machine uid', 'biometric uid', 'uid');
    const categoryIndex = indexOf('category');
    const deviceIndex = indexOf('assigned machine', 'device');
    if ([personIndex, codeIndex, uidIndex].some((index) => index === undefined)) { setEnrollmentError('CSV must include Person, Admission/Staff Code, and Biometric UID columns.'); return; }
    const seen = new Set(snapshot.enrollments.map((item) => String(item.biometricUid)));
    const imported = [];
    for (const row of rows.slice(1)) {
      const values = row.split(',').map((value) => value.trim());
      const item = { user: values[personIndex], category: values[categoryIndex] || 'Student', erpId: values[codeIndex], biometricUid: values[uidIndex], device: values[deviceIndex] || 'All Machines' };
      if (!item.user || !item.erpId || !item.biometricUid || seen.has(item.biometricUid)) continue;
      seen.add(item.biometricUid); imported.push(item);
    }
    if (!imported.length) { setEnrollmentError('No valid new enrollment rows were found. Existing mappings were not overwritten.'); return; }
    await biometricApi.bulkImportEnrollments(imported, session); setShowCsvModal(false); setCsvText(''); setEnrollmentError(''); await refresh(); Alert.alert('CSV imported', `${imported.length} enrollment mapping(s) imported.`);
  };

  const exportEnrollments = async () => {
    const rows = [['Person Name', 'Category', 'Class & Section', 'Admission / Staff Code', 'Biometric Machine UID', 'Assigned Machine', 'Enrolled Date'], ...filteredEnrollments.map((item) => [item.user || item.person_name, item.category, `${item.className || ''} - ${item.section || ''}`, item.erpId || item.admission_or_staff_code, item.biometricUid, item.device || item.assigned_machine, item.enrolledDate || item.enrolled_date || ''])];
    if (!filteredEnrollments.length) { Alert.alert('Nothing to export', 'No enrollment records match the current filters.'); return; }
    await Share.share({ title: 'User Enrollments CSV', message: rows.map((row) => row.map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(',')).join('\n') });
  };

  const simulatePunch = async () => {
    if (!simulator.biometricUid.trim()) { Alert.alert('UID required', 'Enter a biometric UID.'); return; }
    const event = await biometricApi.simulatePunch(simulator, session);
    await refresh();
    Alert.alert('TEST / SIMULATED punch created', event.status === 'Mapped' ? `Mapped to ${event.student}.` : 'The UID is currently unmapped.');
  };

  const closeDeviceModal = () => {
    if (registering) return;
    setDevice(blankDevice);
    setDeviceError('');
    setShowDeviceModal(false);
  };

  const renderDeviceModal = () => (
    <Modal visible={showDeviceModal} transparent animationType="slide" onRequestClose={closeDeviceModal}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.registrationModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Register Biometric Device</Text>
            <Pressable accessibilityLabel="Close registration form" disabled={registering} onPress={closeDeviceModal} style={styles.closeButton}><Text style={styles.closeText}>✕</Text></Pressable>
          </View>
          {deviceError ? <Text style={styles.formError}>{deviceError}</Text> : null}
          <Field label="Device Name *" value={device.name} onChangeText={(value) => { setDevice({ ...device, name: value }); setDeviceError(''); }} placeholder="e.g. Main Gate Scanner" />
          <Field label="Serial Number" value={device.deviceId} onChangeText={(value) => { setDevice({ ...device, deviceId: value }); setDeviceError(''); }} placeholder="e.g. HIK-99201" />
          <Field label="Location" value={device.location} onChangeText={(value) => { setDevice({ ...device, location: value }); setDeviceError(''); }} placeholder="e.g. Main Entrance" />
          <View style={styles.modalActions}><Button title="Cancel" secondary onPress={closeDeviceModal} icon="close-outline" /><Button title="Register Device" onPress={registerDevice} icon="checkmark-outline" /></View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderEnrollmentModal = () => (
    <Modal visible={showEnrollmentModal} transparent animationType="slide" onRequestClose={() => !enrollmentSaving && setShowEnrollmentModal(false)}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.registrationModal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingEnrollment ? 'Edit Enrollment' : 'Enroll UID'}</Text><Pressable disabled={enrollmentSaving} onPress={() => setShowEnrollmentModal(false)} style={styles.closeButton}><Text style={styles.closeText}>✕</Text></Pressable></View>{enrollmentError ? <Text style={styles.formError}>{enrollmentError}</Text> : null}<Field label="Person / User" value={enrollment.user} onChangeText={(value) => setEnrollment({ ...enrollment, user: value })} placeholder="Existing ERP person" /><Field label="Category" value={enrollment.category} onChangeText={(value) => setEnrollment({ ...enrollment, category: value })} placeholder="Student / Teacher / Parent / Staff" /><Field label="Admission / Staff Code" value={enrollment.erpId} onChangeText={(value) => setEnrollment({ ...enrollment, erpId: value })} placeholder="Existing ERP code" /><Field label="Biometric Machine UID" value={enrollment.biometricUid} onChangeText={(value) => setEnrollment({ ...enrollment, biometricUid: value })} placeholder="Scanner UID" /><Field label="Assigned Machine" value={enrollment.device} onChangeText={(value) => setEnrollment({ ...enrollment, device: value })} placeholder="All Machines or device ID" /><View style={styles.modalActions}><Button title="Cancel" secondary onPress={() => setShowEnrollmentModal(false)} icon="close-outline" /><Button title="Enroll UID" onPress={saveEnrollment} icon="checkmark-outline" /></View></View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderCsvModal = () => (
    <Modal visible={showCsvModal} transparent animationType="slide" onRequestClose={() => setShowCsvModal(false)}><KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.registrationModal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Bulk Auto-Map / CSV</Text><Pressable onPress={() => setShowCsvModal(false)} style={styles.closeButton}><Text style={styles.closeText}>✕</Text></Pressable></View><Text style={styles.modalHint}>Paste CSV rows with Person Name, Admission / Staff Code, and Biometric Machine UID columns.</Text><TextInput multiline value={csvText} onChangeText={setCsvText} placeholder="Person Name,Admission Code,Biometric UID,Category,Assigned Machine" placeholderTextColor={colors.muted} style={styles.csvInput} /><View style={styles.modalActions}><Button title="Cancel" secondary onPress={() => setShowCsvModal(false)} icon="close-outline" /><Button title="Import CSV" onPress={importCsv} icon="cloud-upload-outline" /></View></View></KeyboardAvoidingView></Modal>
  );

  const renderBulkModal = () => (
    <Modal visible={showBulkModal} transparent animationType="slide" onRequestClose={() => !bulkLoading && setShowBulkModal(false)}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.registrationModal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Bulk Biometric Auto-Mapping</Text><Pressable disabled={bulkLoading} onPress={() => setShowBulkModal(false)} style={styles.closeButton}><Text style={styles.closeText}>✕</Text></Pressable></View>{enrollmentError ? <Text style={styles.formError}>{enrollmentError}</Text> : null}{bulkResult ? <View><Text style={styles.resultTitle}>Bulk Auto-Mapping Completed</Text><Text style={styles.resultText}>Successfully Mapped: {bulkResult.mapped || 0}{'\n'}Skipped: {bulkResult.skipped || 0}{'\n'}Already Mapped: {bulkResult.alreadyMapped || 0}{'\n'}Failed: {bulkResult.failed || 0}</Text><Button title="Done" onPress={() => setShowBulkModal(false)} icon="checkmark-outline" /></View> : <><Text style={styles.fieldLabel}>Category</Text><View style={styles.choiceRow}>{['Students', 'Teachers', 'Staff'].map((category) => <Pressable key={category} style={[styles.choice, bulkCategory === category && styles.choiceActive]} onPress={() => { setBulkCategory(category); loadBulkCandidates(category); }}><Text style={styles.choiceText}>{category}</Text></Pressable>)}</View><Text style={styles.bulkSectionTitle}>1-Click Auto Mapping</Text><Text style={styles.modalHint}>Assigns each candidate's Admission No or Employee Code as their Biometric UID.</Text>{bulkLoading ? <View style={styles.bulkLoading}><ActivityIndicator color={colors.blue} /><Text style={styles.meta}>{bulkProgress ? `Mapping biometric UIDs... ${bulkProgress.completed} / ${bulkProgress.total} completed` : 'Loading candidates...'}</Text></View> : null}{!bulkLoading && !bulkCandidates.length ? <Empty title="No Candidates Available" message="All users in this category are already mapped or required Admission/Employee Codes are missing." /> : <Button title={`Auto-Map ${bulkCandidates.length} ${bulkCategory.toLowerCase()}`} onPress={autoMap} icon="flash-outline" />}</>}</View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderEnrollments = () => (
    <View><View style={styles.enrollmentActions}><Button title="Bulk Auto-Map / CSV" secondary onPress={openBulkModal} icon="cloud-upload-outline" /><Button title="Enroll UID" onPress={() => openEnrollment()} icon="add-outline" /></View><View style={styles.searchWrap}><Icon name="search-outline" size={17} color={colors.muted} /><TextInput value={enrollmentSearch} onChangeText={setEnrollmentSearch} placeholder="Search name, code, or UID..." placeholderTextColor={colors.muted} style={styles.searchInput} /></View><View style={styles.enrollmentFilters}><TextInput value={categoryFilter} onChangeText={setCategoryFilter} placeholder={`All Categories (${enrollmentCategories.length})`} placeholderTextColor={colors.muted} style={styles.filterInput} /><TextInput value={classFilter} onChangeText={setClassFilter} placeholder="All Classes" placeholderTextColor={colors.muted} style={styles.filterInput} /><TextInput value={sectionFilter} onChangeText={setSectionFilter} placeholder="All Sections" placeholderTextColor={colors.muted} style={styles.filterInput} /></View><Button title="Export CSV" secondary onPress={exportEnrollments} icon="download-outline" /><Text style={styles.tableLabels}>Person Name | Category | Class & Section | Admission / Staff Code | Biometric Machine UID | Assigned Machine | Enrolled Date | Actions</Text>{filteredEnrollments.length ? filteredEnrollments.map((item) => <View key={item.id} style={styles.listCard}><View style={styles.listCopy}><Text style={styles.listTitle}>{item.user || item.person_name}</Text><Text style={styles.meta}>Category: {item.category || 'Student'} · Class & Section: {item.className || '-'} - {item.section || '-'}</Text><Text style={styles.meta}>Admission / Staff Code: {item.erpId || item.admission_or_staff_code} · Biometric Machine UID: {item.biometricUid}</Text><Text style={styles.meta}>Assigned Machine: {item.device || item.assigned_machine || 'All Machines'} · Enrolled Date: {item.enrolledDate || item.enrolled_date || 'Not recorded'}</Text></View><View style={styles.actions}><Pressable onPress={() => openEnrollment(item)}><Icon name="create-outline" size={20} color={colors.blue} /></Pressable><Pressable onPress={() => removeEnrollment(item)}><Icon name="trash-outline" size={20} color={colors.red} /></Pressable></View></View>) : <Empty title={enrollmentSearch || !categoryFilter.startsWith('All Categories') || classFilter !== 'All Classes' || sectionFilter !== 'All Sections' ? 'No records found matching your criteria' : 'No User Enrollments'} message="No biometric UID mappings are available." action="Enroll UID" onAction={() => openEnrollment()} />}</View>
  );

  const renderEnrollmentScreen = () => (
    <><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Biometric Device & Hardware Suite</Text><Text style={styles.status}>Push API / ISAPI Active</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>{tabs.map((tab) => { const label = tab === 'Registered Devices' ? `${tab} (${snapshot.devices.length})` : tab === 'User Enrollments' ? `${tab} (${snapshot.enrollments.length})` : tab; return <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}><Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{label}</Text></Pressable>; })}</ScrollView><Text style={styles.sectionTitle}>User Enrollments ({snapshot.enrollments.length})</Text>{renderEnrollments()}</ScrollView>{renderEnrollmentModal()}{renderBulkModal()}</>
  );

  if (activeTab === 'User Enrollments') return renderEnrollmentScreen();

  return <><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.titleRow}><View style={{ flex: 1 }}><Text style={styles.title}>Biometric Device & Hardware Suite</Text><Text style={styles.status}>Push API / ISAPI Active</Text><Text style={styles.subtitle}>Manage scanners (Hikvision, ZKTeco, Dahua), user UID mappings & live attendance streams</Text></View><Icon name="hardware-chip-outline" size={30} color={colors.blue} /></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <View style={styles.summaryGrid}><SummaryCard value={snapshot.devices.length} label="Machines" icon="hardware-chip-outline" /><SummaryCard value={online} label="Online" icon="wifi-outline" /><SummaryCard value={snapshot.enrollments.length} label="Enrolled" icon="people-outline" /><SummaryCard value={unmapped} label="Unmapped" icon="help-circle-outline" /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>{tabs.map((tab) => { const label = tab === 'Registered Devices' ? `${tab} (${snapshot.devices.length})` : tab === 'User Enrollments' ? `${tab} (${snapshot.enrollments.length})` : tab; return <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}><Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{label}</Text></Pressable>; })}</ScrollView>
    {loading ? <ActivityIndicator color={colors.blue} style={styles.loader} /> : null}
    {activeTab === 'Registered Devices' ? <View><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Registered Devices ({snapshot.devices.length})</Text><Button title="Register Device" onPress={() => setShowDeviceForm(true)} icon="add-outline" /></View>{showDeviceForm ? <View style={styles.formCard}><Text style={styles.formTitle}>Register biometric device</Text><Field label="Device Name" value={device.name} onChangeText={(value) => setDevice({ ...device, name: value })} placeholder="Main entrance scanner" /><Text style={styles.fieldLabel}>Device Type</Text><View style={styles.choiceRow}>{deviceTypes.map((type) => <Pressable key={type} style={[styles.choice, device.type === type && styles.choiceActive]} onPress={() => setDevice({ ...device, type })}><Text style={styles.choiceText}>{type}</Text></Pressable>)}</View><Field label="Device ID / Serial Number" value={device.deviceId} onChangeText={(value) => setDevice({ ...device, deviceId: value })} placeholder="Device serial" /><Field label="IP Address / Host" value={device.host} onChangeText={(value) => setDevice({ ...device, host: value })} placeholder="192.168.1.20" /><Field label="Port" value={device.port} onChangeText={(value) => setDevice({ ...device, port: value })} placeholder="80" keyboardType="number-pad" /><Field label="Username" value={device.username} onChangeText={(value) => setDevice({ ...device, username: value })} placeholder="Backend-managed username" /><Field label="Password" value={device.password} onChangeText={(value) => setDevice({ ...device, password: value })} placeholder="Not stored in mock" secureTextEntry /><Field label="Protocol" value={device.protocol} onChangeText={(value) => setDevice({ ...device, protocol: value })} placeholder="HTTP / HTTPS / ISAPI" /><View style={styles.actions}><Button title="Cancel" secondary onPress={() => setShowDeviceForm(false)} icon="close-outline" /><Button title="Register" onPress={registerDevice} icon="checkmark-outline" /></View></View> : null}{snapshot.devices.length === 0 && !showDeviceForm ? <Empty title="No Devices Registered" message="Connect a supported scanner through the backend integration." action="Register First Device" onAction={() => setShowDeviceForm(true)} /> : snapshot.devices.map((deviceItem) => <View key={deviceItem.id} style={styles.listCard}><View style={styles.listIcon}><Icon name="hardware-chip-outline" size={21} color={colors.blue} /></View><View style={styles.listCopy}><Text style={styles.listTitle}>{deviceItem.name}</Text><Text style={styles.meta}>{deviceItem.type} · {deviceItem.deviceId}</Text><Text style={styles.meta}>{deviceItem.host}:{deviceItem.port} · {deviceItem.status || 'Unknown'}</Text></View><View style={styles.actions}><Button title="Test" secondary onPress={() => testConnection(deviceItem)} icon="wifi-outline" /><Pressable onPress={() => deleteDevice(deviceItem)}><Icon name="trash-outline" size={19} color={colors.red} /></Pressable></View></View>)}</View> : null}
    {activeTab === 'User Enrollments' ? <View><Text style={styles.sectionTitle}>User Enrollments ({snapshot.enrollments.length})</Text><View style={styles.formCard}><Text style={styles.formTitle}>Map ERP user to biometric UID</Text><Field label="ERP Student/User" value={enrollment.user} onChangeText={(value) => setEnrollment({ ...enrollment, user: value })} placeholder="Existing ERP user" /><Field label="ERP ID" value={enrollment.erpId} onChangeText={(value) => setEnrollment({ ...enrollment, erpId: value })} placeholder="Existing student/user ID" /><Field label="Biometric UID" value={enrollment.biometricUid} onChangeText={(value) => setEnrollment({ ...enrollment, biometricUid: value })} placeholder="Scanner UID" /><Field label="Device" value={enrollment.device} onChangeText={(value) => setEnrollment({ ...enrollment, device: value })} placeholder="Registered device ID" /><Button title="Save UID Mapping" onPress={saveEnrollment} icon="link-outline" /></View>{snapshot.enrollments.length ? snapshot.enrollments.map((item) => <View key={item.id} style={styles.listCard}><View style={styles.listCopy}><Text style={styles.listTitle}>{item.user} · {item.erpId}</Text><Text style={styles.meta}>UID {item.biometricUid} · Device {item.device}</Text><Text style={styles.meta}>{item.status || 'Mapped'} · Last sync {item.lastSync || 'Not synced'}</Text></View><Pressable onPress={async () => { await biometricApi.deleteEnrollment(item.id, session); refresh(); }}><Icon name="trash-outline" size={19} color={colors.red} /></Pressable></View>) : <Empty title="No User Enrollments" message="Map an existing ERP student or user to a device UID." />}</View> : null}
    {activeTab === 'Live Punch Feeds' ? <View><Text style={styles.sectionTitle}>Live Punch Feeds</Text>{snapshot.punches.length ? snapshot.punches.map((punch) => <View key={punch.id} style={styles.listCard}><View style={styles.listCopy}><Text style={styles.listTitle}>{punch.timestamp || 'Unknown time'} · UID {punch.biometricUid}</Text><Text style={styles.meta}>{punch.student} · {punch.device}</Text><Text style={styles.meta}>{punch.punchType} · {punch.status}{punch.simulated ? ' · TEST / SIMULATED' : ''}</Text></View></View>) : <Empty title="No Live Punches Available" message="Live events will appear when the backend stream receives a device punch." />}</View> : null}
    {activeTab === 'Webhook & Test Simulator' ? <View><Text style={styles.sectionTitle}>Webhook & Test Simulator</Text><View style={styles.formCard}><Text style={styles.simulatedLabel}>TEST / SIMULATED</Text><Text style={styles.formTitle}>Create a test punch event</Text><Field label="Biometric UID" value={simulator.biometricUid} onChangeText={(value) => setSimulator({ ...simulator, biometricUid: value })} placeholder="10004" /><Field label="Punch Type" value={simulator.punchType} onChangeText={(value) => setSimulator({ ...simulator, punchType: value.toUpperCase() })} placeholder="IN or OUT" /><Field label="Timestamp" value={simulator.timestamp} onChangeText={(value) => setSimulator({ ...simulator, timestamp: value })} placeholder="Current date/time" /><Button title="Simulate Punch" onPress={simulatePunch} icon="flash-outline" /></View></View> : null}
  </ScrollView>{renderDeviceModal()}</>;
}

const styles = StyleSheet.create({
  enrollmentActions: { flexDirection: 'row', gap: 7, marginBottom: 10 },
  enrollmentFilters: { flexDirection: 'row', gap: 6, marginVertical: 9 },
  filterInput: { flex: 1, minHeight: 38, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 8, color: colors.ink, fontSize: 10 },
  tableLabels: { color: colors.muted, fontSize: 9, lineHeight: 15, marginVertical: 10 },
  modalHint: { color: colors.muted, fontSize: 11, lineHeight: 17, marginBottom: 10 },
  csvInput: { minHeight: 130, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10, color: colors.ink, fontSize: 11, textAlignVertical: 'top' },
  bulkSectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 12, marginBottom: 5 },
  bulkLoading: { alignItems: 'center', gap: 8, paddingVertical: 14 },
  resultTitle: { color: colors.green, fontSize: 16, fontWeight: '900', marginBottom: 10 },
  resultText: { color: colors.ink, fontSize: 13, lineHeight: 23, marginBottom: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 31, 0.4)', justifyContent: 'flex-end' },
  registrationModal: { backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, paddingBottom: 28 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  modalTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', flex: 1 },
  closeButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paleBlue },
  closeText: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  formError: { color: colors.red, backgroundColor: colors.paleRed, borderRadius: 8, padding: 9, marginBottom: 10, fontSize: 11, fontWeight: '700' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 6 },
  content: { padding: 16, paddingBottom: 35 }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }, title: { color: colors.ink, fontSize: 22, fontWeight: '900' }, status: { color: colors.green, fontSize: 11, fontWeight: '900', marginTop: 7 }, subtitle: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 6 }, error: { color: colors.red, backgroundColor: colors.paleRed, padding: 10, borderRadius: 8, marginBottom: 10 }, summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 }, summaryCard: { width: '48%', minHeight: 88, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 10 }, summaryIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' }, summaryValue: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: 7 }, summaryLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 2 }, tabs: { marginBottom: 14 }, tab: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 9, marginRight: 7 }, activeTab: { backgroundColor: colors.blue, borderColor: colors.blue }, tabText: { color: colors.muted, fontSize: 10, fontWeight: '800' }, activeTabText: { color: colors.white }, loader: { marginVertical: 20 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }, sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginBottom: 10 }, button: { minHeight: 38, borderRadius: 8, backgroundColor: colors.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10 }, buttonText: { color: colors.white, fontSize: 10, fontWeight: '900' }, secondaryButton: { backgroundColor: colors.paleBlue }, secondaryButtonText: { color: colors.blue }, formCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 13, marginBottom: 10 }, formTitle: { color: colors.ink, fontSize: 14, fontWeight: '900', marginBottom: 10 }, field: { marginBottom: 9 }, fieldLabel: { color: colors.ink, fontSize: 10, fontWeight: '800', marginBottom: 5 }, input: { minHeight: 40, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 10, color: colors.ink, fontSize: 12 }, choiceRow: { flexDirection: 'row', gap: 6, marginBottom: 10 }, choice: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingVertical: 9, alignItems: 'center' }, choiceActive: { borderColor: colors.blue, backgroundColor: colors.paleBlue }, choiceText: { color: colors.ink, fontSize: 10, fontWeight: '800' }, actions: { flexDirection: 'row', gap: 8, alignItems: 'center' }, listCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }, listIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.paleBlue, alignItems: 'center', justifyContent: 'center' }, listCopy: { flex: 1 }, listTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' }, meta: { color: colors.muted, fontSize: 10, marginTop: 4 }, empty: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 11, padding: 24, alignItems: 'center' }, emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 8, textAlign: 'center' }, emptyMessage: { color: colors.muted, fontSize: 11, marginTop: 5, textAlign: 'center', marginBottom: 13 }, simulatedLabel: { color: colors.orange, fontSize: 10, fontWeight: '900', marginBottom: 6 },
});
