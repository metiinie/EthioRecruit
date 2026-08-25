import { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vacancyService } from '../../services/vacancyService';

export default function AdminVacanciesScreen() {
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [title, setTitle] = useState('');
    const [country, setCountry] = useState('Saudi Arabia');
    const [salaryMin, setSalaryMin] = useState('1500');
    const [categoryId, setCategoryId] = useState('housemaid');
    const [description, setDescription] = useState('');

    const vacanciesQuery = useQuery({
        queryKey: ['admin', 'vacancies'],
        queryFn: () => vacancyService.getAdminVacancies(),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => vacancyService.createVacancy(data),
        onSuccess: () => {
            Alert.alert('Success', 'Vacancy drafted successfully!');
            setShowAddModal(false);
            setTitle('');
            setDescription('');
            queryClient.invalidateQueries({ queryKey: ['admin', 'vacancies'] });
        },
        onError: (err: any) => {
            Alert.alert('Error', err.response?.data?.error?.message || 'Failed to create vacancy');
        },
    });

    const statusMutation = useMutation({
        mutationFn: (data: { id: string; status: string }) =>
            vacancyService.updateVacancyStatus(data.id, data.status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'vacancies'] });
        },
    });

    const handleCreate = () => {
        if (!title) {
            Alert.alert('Error', 'Please provide job title');
            return;
        }
        createMutation.mutate({
            title,
            country,
            categoryId,
            salaryMin: parseFloat(salaryMin) || 1200,
            salaryCurrency: 'SAR',
            description: description || 'Overseas employment contract',
            requirements: ['Valid Passport', 'Age 21-40'],
            contractPeriodYears: 2,
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Agency Vacancies</Text>
                    <Text style={styles.subTitle}>Manage job postings & statuses</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                    <Ionicons name="add" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>

            {vacanciesQuery.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.accent} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.listContent}>
                    {vacanciesQuery.data?.data?.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Ionicons name="briefcase-outline" size={56} color={Colors.gray600} />
                            <Text style={styles.emptyText}>No vacancies posted yet</Text>
                        </View>
                    ) : (
                        vacanciesQuery.data?.data?.map((vac: any) => (
                            <View key={vac.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.vacTitle}>{vac.title}</Text>
                                        <Text style={styles.vacSub}>
                                            {vac.country} • {vac.salaryCurrency} {vac.salaryMin}
                                        </Text>
                                    </View>
                                    <View style={styles.statusPill}>
                                        <Text style={styles.statusPillText}>{vac.status}</Text>
                                    </View>
                                </View>

                                {/* Status Toggle Actions */}
                                <View style={styles.actionRow}>
                                    {vac.status !== 'ACTIVE' && (
                                        <TouchableOpacity
                                            style={styles.statusBtnActive}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'ACTIVE' })}
                                        >
                                            <Text style={styles.statusBtnText}>Publish</Text>
                                        </TouchableOpacity>
                                    )}
                                    {vac.status === 'ACTIVE' && (
                                        <TouchableOpacity
                                            style={styles.statusBtnPause}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'PAUSED' })}
                                        >
                                            <Text style={styles.statusBtnText}>Pause</Text>
                                        </TouchableOpacity>
                                    )}
                                    {vac.status !== 'CLOSED' && (
                                        <TouchableOpacity
                                            style={styles.statusBtnClose}
                                            onPress={() => statusMutation.mutate({ id: vac.id, status: 'CLOSED' })}
                                        >
                                            <Text style={styles.statusBtnText}>Close</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Post Vacancy Modal */}
            {showAddModal && (
                <Modal visible transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Post Vacancy</Text>
                                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                    <Ionicons name="close" size={24} color={Colors.gray400} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Job Title (e.g. Domestic Housemaid)"
                                placeholderTextColor={Colors.gray500}
                                value={title}
                                onChangeText={setTitle}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Destination Country"
                                placeholderTextColor={Colors.gray500}
                                value={country}
                                onChangeText={setCountry}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Monthly Salary"
                                placeholderTextColor={Colors.gray500}
                                keyboardType="number-pad"
                                value={salaryMin}
                                onChangeText={setSalaryMin}
                            />
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder="Job Description & Terms..."
                                placeholderTextColor={Colors.gray500}
                                multiline
                                value={description}
                                onChangeText={setDescription}
                            />

                            <TouchableOpacity
                                style={[styles.submitBtn, createMutation.isPending && { opacity: 0.6 }]}
                                onPress={handleCreate}
                                disabled={createMutation.isPending}
                            >
                                <Text style={styles.submitBtnText}>
                                    {createMutation.isPending ? 'Posting...' : 'Post Vacancy'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    title: { fontSize: 24, fontWeight: '800', color: Colors.white },
    subTitle: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: Spacing.lg, gap: Spacing.md },
    emptyBox: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { color: Colors.gray400, fontSize: 16 },
    card: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gray700,
        gap: 12,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    vacTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
    vacSub: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
    statusPill: {
        backgroundColor: Colors.accent + '20',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    statusPillText: { color: Colors.accent, fontSize: 11, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
    statusBtnActive: { backgroundColor: Colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    statusBtnPause: { backgroundColor: Colors.warning, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    statusBtnClose: { backgroundColor: Colors.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    statusBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: {
        backgroundColor: Colors.primaryLight,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
    input: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 52,
        color: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray700,
    },
    submitBtn: {
        backgroundColor: Colors.accent,
        paddingVertical: 16,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    submitBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
