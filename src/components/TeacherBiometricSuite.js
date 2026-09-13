import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { biometricApi } from '../services/biometricApi';

const colors = { ink: '#17343B', muted: '#6A7F83', line: '#D9E7E4', white: '#FFFFFF', canvas: '#F4F8F6', blue: '#0D8B82', navy: '#123B43', paleBlue: '#E5F4F0', green: '#1E8E5E', paleGreen: '#E8F8F1', red: '#B94E4E', paleRed: '#FDECEC', orange: '#A76E00', paleOrange: '#FFF7DF' };
const tabs = ['Registered Devices', 'User Enrollments', 'Live Punch Feeds', 'Webhook & Test Simulator'];
const deviceTypes = ['Hikvision', 'ZKTeco', 'Dahua'];
const blankDevice = { name: '', type: 'Hikvision', deviceId: '', location: '', host: '', port: '80', username: '', password: '', protocol: 'HTTP' };

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
  const [enrollment, setEnrollment] = useState({ user: '', erpId: '', biometricUid: '', device: '' });
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

  const saveEnrollment = async () => {
    if (!enrollment.user.trim() || !enrollment.erpId.trim() || !enrollment.biometricUid.trim() || !enrollment.device.trim()) { Alert.alert('Incomplete mapping', 'ERP user, ERP ID, biometric UID, and device are required.'); return; }
    if (snapshot.enrollments.some((item) => String(item.biometricUid) === enrollment.biometricUid.trim())) { Alert.alert('Duplicate UID', 'This biometric UID is already mapped.'); return; }
    await biometricApi.saveEnrollment(enrollment, session); setEnrollment({ user: '', erpId: '', biometricUid: '', device: '' }); await refresh();
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
