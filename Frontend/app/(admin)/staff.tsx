import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Switch,
    Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';

export default function StaffManagementScreen() {
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('RECRUITER');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const res = await adminService.getStaff();
            setStaffList(res.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load staff roster');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await adminService.toggleStaffActive(id, !currentStatus);
            setStaffList((prev) =>
                prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s)),
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update staff status');
        }
    };

    const handleAddStaff = async () => {
        if (!email.trim() || !firstName.trim() || !password.trim()) {
            Alert.alert('Required Fields', 'Email, first name, and password are required.');
            return;
        }

        setSubmitting(true);
        try {
            await adminService.addStaff({ email, firstName, lastName, role, password });
            setAddModalVisible(false);
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
            Alert.alert('Success', 'Staff member added!');
            loadStaff();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add staff member');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1A365D" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Staff Management',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => setAddModalVisible(true)} style={{ marginRight: 15 }}>
                            <Ionicons name="person-add" size={22} color="#D69E2E" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <FlatList
                data={staffList}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{item.firstName?.[0] || 'S'}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                            <Text style={styles.email}>{item.email}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>{item.role}</Text>
                            </View>
                        </View>

                        <Switch
                            value={item.isActive}
                            onValueChange={() => handleToggleActive(item.id, item.isActive)}
                            trackColor={{ false: '#CBD5E0', true: '#319795' }}
                        />
                    </View>
                )}
            />

            {/* Add Staff Modal */}
            <Modal visible={addModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Staff Member</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Role (ADMIN / RECRUITER / AGENT)"
                            value={role}
                            onChangeText={setRole}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.submitBtn} onPress={handleAddStaff} disabled={submitting}>
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Add Staff</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
    },
    avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A365D', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1A365D' },
    email: { fontSize: 13, color: '#718096', marginTop: 2 },
    roleBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
    roleText: { fontSize: 11, fontWeight: 'bold', color: '#4A5568' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A365D', marginBottom: 12 },
    input: { backgroundColor: '#EDF2F7', borderRadius: 8, padding: 12, marginBottom: 10, color: '#2D3748' },
    modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
    cancelBtn: { padding: 10, marginRight: 8 },
    cancelBtnText: { color: '#718096', fontWeight: '600' },
    submitBtn: { backgroundColor: '#1A365D', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    submitBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
