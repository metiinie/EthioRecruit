import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { vacancyService } from '../../services/vacancyService';
import { savedService } from '../../services/savedService';
import { AgencyContactBar } from '../../components/AgencyContactBar';

export default function VacancyDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [vacancy, setVacancy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [applyModalVisible, setApplyModalVisible] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [submittingApply, setSubmittingApply] = useState(false);

    useEffect(() => {
        if (id) {
            loadVacancy();
        }
    }, [id]);

    const loadVacancy = async () => {
        setLoading(true);
        try {
            const res = await vacancyService.getVacancyById(id!);
            setVacancy(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load vacancy details');
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async () => {
        if (!id) return;
        try {
            if (isSaved) {
                await savedService.unsaveVacancy(id);
                setIsSaved(false);
                Alert.alert('Success', 'Removed from saved vacancies');
            } else {
                await savedService.saveVacancy(id);
                setIsSaved(true);
                Alert.alert('Success', 'Saved job vacancy');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Action failed');
        }
    };

    const handleApply = async () => {
        setSubmittingApply(true);
        try {
            await vacancyService.applyToVacancy(id!, { coverLetter });
            setApplyModalVisible(false);
            setCoverLetter('');
            Alert.alert('Application Submitted!', 'Your application has been received by the agency.');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit application');
        } finally {
            setSubmittingApply(false);
        }
    };

    const launchAgencyOutreach = (channel: 'WHATSAPP' | 'TELEGRAM' | 'IMO') => {
        const agencyPhone = vacancy?.agency?.whatsappNumber || vacancy?.agency?.phone || '+251911000000';
        const cleanPhone = agencyPhone.replace(/[^\d]/g, '');
        const title = vacancy?.title || 'Vacancy';
        const prefilledText = encodeURIComponent(`Hello ${vacancy?.agency?.name || 'Agency'}, I am interested in applying for "${title}" on EthioRecruit.`);

        if (channel === 'WHATSAPP') {
            const waApp = `whatsapp://send?phone=${cleanPhone}&text=${prefilledText}`;
            const waWeb = `https://wa.me/${cleanPhone}?text=${prefilledText}`;
            Linking.canOpenURL(waApp).then((supported) => {
                if (supported) Linking.openURL(waApp);
                else Linking.openURL(waWeb);
            }).catch(() => Linking.openURL(waWeb));
        } else if (channel === 'TELEGRAM') {
            const tgUsername = vacancy?.agency?.telegramUsername || cleanPhone;
            const tgUrl = `https://t.me/${tgUsername.replace('@', '')}`;
            Linking.openURL(tgUrl).catch(() => Alert.alert('Telegram', `Agency Telegram: ${tgUsername}`));
        } else if (channel === 'IMO') {
            const imoPhone = vacancy?.agency?.imoNumber || agencyPhone;
            const imoUrl = `imo://user?phone=${imoPhone.replace('+', '')}`;
            Linking.canOpenURL(imoUrl).then((sup) => {
                if (sup) Linking.openURL(imoUrl);
                else Alert.alert('IMO Contact', `Agency IMO Contact: ${imoPhone}`);
            }).catch(() => Alert.alert('IMO Contact', `Agency IMO Contact: ${imoPhone}`));
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1A365D" />
                <Text style={styles.loadingText}>Loading Vacancy Details...</Text>
            </View>
        );
    }

    if (!vacancy) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Vacancy Not Found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
            <Stack.Screen
                options={{
                    title: vacancy.title,
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleSave} style={{ marginRight: 15 }}>
                            <Ionicons
                                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                                size={24}
                                color="#D69E2E"
                            />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Title & Salary Header */}
            <View style={styles.headerCard}>
                <Text style={styles.vacancyTitle}>{vacancy.title}</Text>
                <Text style={styles.categoryText}>{vacancy.category?.name || 'Domestic Staff'}</Text>

                <View style={styles.salaryContainer}>
                    <Ionicons name="cash-outline" size={24} color="#2B6CB0" />
                    <Text style={styles.salaryText}>
                        {vacancy.salaryMin ? `${vacancy.salaryMin} - ${vacancy.salaryMax} ${vacancy.currency || 'SAR'}` : 'Competitive Salary'}
                    </Text>
                </View>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={18} color="#718096" />
                    <Text style={styles.locationText}>{vacancy.country || 'Saudi Arabia'}</Text>
                </View>
            </View>

            {/* Job Description */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Job Description</Text>
                <Text style={styles.descriptionText}>{vacancy.description}</Text>
            </View>

            {/* Requirements & Experience */}
            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Requirements & Criteria</Text>

                <View style={styles.reqRow}>
                    <Text style={styles.reqLabel}>Experience Required:</Text>
                    <Text style={styles.reqValue}>{vacancy.experienceRequired ? `${vacancy.experienceRequired} Years` : 'Fresh Applicants Allowed'}</Text>
                </View>

                <View style={styles.reqRow}>
                    <Text style={styles.reqLabel}>Gender Preference:</Text>
                    <Text style={styles.reqValue}>{vacancy.genderPreference || 'Any'}</Text>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 15, fontSize: 14 }]}>Specific Skills Required:</Text>
                {(vacancy.requirements || ['Housekeeping', 'Cooking', 'Caregiving']).map((req: string, idx: number) => (
                    <View key={idx} style={styles.bulletRow}>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#319795" style={{ marginRight: 8 }} />
                        <Text style={styles.bulletText}>{req}</Text>
                    </View>
                ))}
            </View>

            {/* Employer / Managing Agency & Direct Contact Channels */}
            {vacancy.agency && (
                <View style={styles.agencyContainer}>
                    <View style={styles.agencyCard}>
                        <Ionicons name="business" size={24} color="#1A365D" />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.agencyName}>{vacancy.agency.name}</Text>
                            <Text style={styles.agencySub}>Licensed Overseas Recruitment Agency</Text>
                        </View>
                    </View>

                    {/* Direct Contact Bar for Job Seekers */}
                    <AgencyContactBar
                        agency={vacancy.agency}
                        vacancyTitle={vacancy.title}
                    />
                </View>
            )}

            {/* Bottom Floating Apply Bar */}
            <View style={styles.actionFooter}>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => setApplyModalVisible(true)}
                >
                    <Ionicons name="send" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
            </View>

            {/* Apply Modal */}
            <Modal visible={applyModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Apply for Vacancy</Text>
                        <Text style={styles.modalSubtitle}>
                            Confirm your application for "{vacancy.title}".
                        </Text>

                        <TextInput
                            style={styles.textArea}
                            multiline
                            numberOfLines={4}
                            placeholder="Optional cover letter or notes for the agency..."
                            placeholderTextColor="#A0AEC0"
                            value={coverLetter}
                            onChangeText={setCoverLetter}
                        />

                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                style={styles.cancelModalButton}
                                onPress={() => setApplyModalVisible(false)}
                            >
                                <Text style={styles.cancelModalButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.submitModalButton}
                                onPress={handleApply}
                                disabled={submittingApply}
                            >
                                {submittingApply ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.submitModalButtonText}>Submit Application</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 12, fontSize: 16, color: '#4A5568' },
    errorText: { fontSize: 18, color: '#E53E3E', fontWeight: 'bold' },
    headerCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    vacancyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A365D' },
    categoryText: { fontSize: 14, color: '#718096', marginTop: 4 },
    salaryContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
    salaryText: { fontSize: 20, fontWeight: 'bold', color: '#2B6CB0', marginLeft: 8 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    locationText: { fontSize: 14, color: '#718096', marginLeft: 4 },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 12 },
    descriptionText: { fontSize: 14, color: '#4A5568', lineHeight: 22 },
    reqRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reqLabel: { fontSize: 14, color: '#718096' },
    reqValue: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
    bulletRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    bulletText: { fontSize: 14, color: '#4A5568' },
    agencyContainer: {
        backgroundColor: '#EDF2F7',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    agencyCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    agencyName: { fontSize: 15, fontWeight: 'bold', color: '#1A365D' },
    agencySub: { fontSize: 12, color: '#718096' },
    directContactTitle: { fontSize: 12, fontWeight: '700', color: '#4A5568', textTransform: 'uppercase', letterSpacing: 0.5 },
    directChannelRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    directChannelBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 9,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    directChannelText: { fontSize: 12, fontWeight: '800' },
    actionFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    applyButton: {
        backgroundColor: '#D69E2E',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 10,
    },
    applyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A365D' },
    modalSubtitle: { fontSize: 13, color: '#718096', marginVertical: 8 },
    textArea: {
        backgroundColor: '#EDF2F7',
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: 'top',
        color: '#2D3748',
        marginVertical: 12,
    },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
    cancelModalButton: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
    cancelModalButtonText: { color: '#718096', fontWeight: '600' },
    submitModalButton: { backgroundColor: '#D69E2E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    submitModalButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
});
