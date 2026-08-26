import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Switch,
    Alert,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';

export default function StaffManagementScreen() {
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('RECRUITER');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadStaff = async () => {
        try {
            const res = await adminService.getStaff();
            setStaffList(res.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load agency staff roster');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStaff();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadStaff();
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await adminService.toggleStaffActive(id, !currentStatus);
            setStaffList((prev) =>
                prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s)),
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update staff active status');
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
            Alert.alert('Success', 'Staff member added to agency roster!');
            loadStaff();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add staff member');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStaff = staffList.filter((s: any) => {
        const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const mail = (s.email || '').toLowerCase();
        const r = (s.role || '').toLowerCase();
        const q = searchQuery.toLowerCase().trim();

        const matchesSearch = !q || name.includes(q) || mail.includes(q) || r.includes(q);
        const matchesRole = selectedRoleFilter === 'ALL' || (s.role || '').toUpperCase() === selectedRoleFilter;

        return matchesSearch && matchesRole;
    });

    const roleFilterChips = [
        { label: 'All Staff', value: 'ALL' },
        { label: 'Recruiters', value: 'RECRUITER' },
        { label: 'Admins', value: 'ADMIN' },
        { label: 'Agents', value: 'AGENT' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Staff Management</Text>
                    <Text style={styles.subTitle}>Agency Team Members & Recruiter Accounts</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setAddModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="person-add" size={16} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Add Staff</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search staff by name, email, or role..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#64748B" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Role Filter Chips */}
            <View style={{ height: 44, marginBottom: 12 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {roleFilterChips.map((chip) => (
                        <TouchableOpacity
                            key={chip.value}
                            style={[styles.chip, selectedRoleFilter === chip.value && styles.chipActive]}
                            onPress={() => setSelectedRoleFilter(chip.value)}
                        >
                            <Text style={[styles.chipText, selectedRoleFilter === chip.value && styles.chipTextActive]}>
                                {chip.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Staff List Container */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>Loading agency team...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#10B981', '#2563EB']} />
                    }
                >
                    {filteredStaff.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="people-circle-outline" size={60} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No staff members found</Text>
                            <Text style={styles.emptySub}>
                                {searchQuery ? 'No match found for your search query.' : 'No staff members added to agency roster yet.'}
                            </Text>
                            <TouchableOpacity
                                style={styles.createFirstBtn}
                                onPress={() => setAddModalVisible(true)}
                            >
                                <Ionicons name="person-add" size={18} color="#FFFFFF" />
                                <Text style={styles.createFirstBtnText}>Add First Staff Member</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredStaff.map((item: any) => (
                            <View key={item.id} style={styles.card}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>{item.firstName?.[0] || 'S'}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                                    <Text style={styles.email}>{item.email}</Text>
                                    <View style={styles.roleBadge}>
                                        <Text style={styles.roleText}>{item.role || 'RECRUITER'}</Text>
                                    </View>
                                </View>

                                <View style={styles.switchCol}>
                                    <Text style={styles.switchLabel}>{item.isActive ? 'Active' : 'Inactive'}</Text>
                                    <Switch
                                        value={item.isActive}
                                        onValueChange={() => handleToggleActive(item.id, item.isActive)}
                                        trackColor={{ false: '#CBD5E1', true: '#A7F3D0' }}
                                        thumbColor={item.isActive ? '#10B981' : '#94A3B8'}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Add Staff Modal */}
            <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Agency Staff Member</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>First Name *</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Abebe"
                            value={firstName}
                            onChangeText={setFirstName}
                        />

                        <Text style={styles.modalLabel}>Last Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Kebede"
                            value={lastName}
                            onChangeText={setLastName}
                        />

                        <Text style={styles.modalLabel}>Email Address *</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="staff@agency.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Text style={styles.modalLabel}>Select Role *</Text>
                        <View style={styles.roleRow}>
                            {['RECRUITER', 'ADMIN', 'AGENT'].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.rolePill, role === r && styles.rolePillActive]}
                                    onPress={() => setRole(r)}
                                >
                                    <Text style={[styles.rolePillText, role === r && styles.rolePillTextActive]}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.modalLabel}>Password *</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Set account password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                                onPress={handleAddStaff}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitBtnText}>Add Staff Member</Text>
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
    container: { flex: 1, backgroundColor: '#F8FAFC' }, // Light default theme
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 56,
        paddingHorizontal: 18,
        paddingBottom: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    title: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
    subTitle: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#10B981', // Brand Emerald Green
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        elevation: 1,
    },
    addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 18,
        marginTop: 14,
        marginBottom: 10,
        paddingHorizontal: 14,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#0F172A', fontSize: 14 },
    chipRow: { paddingHorizontal: 18, gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 18, gap: 12, paddingBottom: 40 },
    emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    emptySub: { fontSize: 13, color: '#64748B', textAlign: 'center', paddingHorizontal: 30 },
    createFirstBtn: {
        marginTop: 14,
        backgroundColor: '#10B981',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    createFirstBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    avatarText: { color: '#059669', fontWeight: '900', fontSize: 18 },
    name: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    email: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    roleBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    roleText: { fontSize: 11, fontWeight: '800', color: '#2563EB' },
    switchCol: { alignItems: 'center', gap: 2 },
    switchLabel: { fontSize: 11, color: '#64748B', fontWeight: '700' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, gap: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    modalLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginTop: 4 },
    modalInput: { backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, height: 44, color: '#0F172A' },
    roleRow: { flexDirection: 'row', gap: 8 },
    rolePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' },
    rolePillActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    rolePillText: { fontSize: 12, fontWeight: '600', color: '#475569' },
    rolePillTextActive: { color: '#FFFFFF', fontWeight: '700' },
    modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
    cancelBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F1F5F9' },
    cancelBtnText: { color: '#64748B', fontWeight: '700' },
    submitBtn: { backgroundColor: '#10B981', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
    submitBtnText: { color: '#FFFFFF', fontWeight: '800' },
});
