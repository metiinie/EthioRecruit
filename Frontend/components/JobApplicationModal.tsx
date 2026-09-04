import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants';
import { useAuthStore } from '../stores/authStore';
import { AgencyContactBar } from './AgencyContactBar';

interface JobApplicationModalProps {
    visible: boolean;
    vacancy: any;
    onClose: () => void;
    onSubmit: (payload: { coverLetter: string }) => void;
    isSubmitting: boolean;
}

export function JobApplicationModal({
    visible,
    vacancy,
    onClose,
    onSubmit,
    isSubmitting,
}: JobApplicationModalProps) {
    const { user } = useAuthStore();

    const [phone, setPhone] = useState('');
    const [passportStatus, setPassportStatus] = useState<'ready' | 'in_progress' | 'not_issued'>('ready');
    const [medicalStatus, setMedicalStatus] = useState<'cleared' | 'pending' | 'not_tested'>('cleared');
    const [experience, setExperience] = useState<'fresh' | 'local' | 'overseas_gcc'>('overseas_gcc');
    const [availability, setAvailability] = useState<'immediate' | '2_weeks' | '1_month'>('immediate');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (user?.phone) {
            setPhone(user.phone);
        }
    }, [user]);

    if (!vacancy) return null;

    const handleSubmit = () => {
        const passportLabels = {
            ready: 'Ready & Issued 🛂',
            in_progress: 'In Progress / Processing ⏳',
            not_issued: 'Not Issued Yet ❌',
        };

        const medicalLabels = {
            cleared: 'GAMCA Medical Cleared ✅',
            pending: 'Medical Examination Pending ⏳',
            not_tested: 'Not Examined Yet ⚠️',
        };

        const expLabels = {
            fresh: 'Fresh Candidate (No Experience)',
            local: '1-2 Years Local Experience',
            overseas_gcc: '3+ Years Overseas GCC Experience 🌟',
        };

        const availLabels = {
            immediate: 'Immediate (Ready for Deployment)',
            '2_weeks': 'Within 2 Weeks',
            '1_month': 'Within 1 Month',
        };

        const formattedPayload = [
            `=== CANDIDATE APPLICATION CREDENTIALS ===`,
            `📱 Contact Phone: ${phone || user?.phone || 'Not Provided'}`,
            `🛂 Passport Status: ${passportLabels[passportStatus]}`,
            `🏥 Medical Status: ${medicalLabels[medicalStatus]}`,
            `💼 Experience Level: ${expLabels[experience]}`,
            `⏱ Availability: ${availLabels[availability]}`,
            note.trim() ? `\n📝 Applicant Note:\n"${note.trim()}"` : '',
        ]
            .filter(Boolean)
            .join('\n');

        onSubmit({ coverLetter: formattedPayload });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <View style={styles.modalCard}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.headerTitleCol}>
                            <Text style={styles.modalTitle} numberOfLines={1}>
                                Apply for {vacancy.title}
                            </Text>
                            <Text style={styles.modalSub}>
                                {vacancy.country} • {vacancy.agency?.name || 'Verified Agency'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color={Colors.gray600} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {/* Direct Agency Contact Bar */}
                        <AgencyContactBar
                            agency={vacancy.agency}
                            vacancyTitle={vacancy.title}
                        />

                        {/* Section 1: Phone / WhatsApp */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Contact Phone / WhatsApp *</Text>
                            <View style={styles.inputBox}>
                                <Ionicons name="call-outline" size={18} color={Colors.primary} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. 0912345678"
                                    placeholderTextColor={Colors.gray400}
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </View>

                        {/* Section 2: Passport Status */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Passport Status *</Text>
                            <View style={styles.chipsRow}>
                                <TouchableOpacity
                                    style={[styles.chip, passportStatus === 'ready' && styles.chipActive]}
                                    onPress={() => setPassportStatus('ready')}
                                >
                                    <Ionicons name="journal-outline" size={14} color={passportStatus === 'ready' ? Colors.white : Colors.primary} />
                                    <Text style={[styles.chipText, passportStatus === 'ready' && styles.chipTextActive]}>
                                        Ready / Issued
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chip, passportStatus === 'in_progress' && styles.chipActive]}
                                    onPress={() => setPassportStatus('in_progress')}
                                >
                                    <Ionicons name="time-outline" size={14} color={passportStatus === 'in_progress' ? Colors.white : Colors.gray700} />
                                    <Text style={[styles.chipText, passportStatus === 'in_progress' && styles.chipTextActive]}>
                                        In Progress
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chip, passportStatus === 'not_issued' && styles.chipActive]}
                                    onPress={() => setPassportStatus('not_issued')}
                                >
                                    <Text style={[styles.chipText, passportStatus === 'not_issued' && styles.chipTextActive]}>
                                        Not Issued
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Section 3: Medical Status */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Medical Clearance Status *</Text>
                            <View style={styles.chipsRow}>
                                <TouchableOpacity
                                    style={[styles.chip, medicalStatus === 'cleared' && styles.chipSuccessActive]}
                                    onPress={() => setMedicalStatus('cleared')}
                                >
                                    <Ionicons name="shield-checkmark" size={14} color={medicalStatus === 'cleared' ? Colors.white : Colors.success} />
                                    <Text style={[styles.chipText, medicalStatus === 'cleared' && styles.chipTextActive]}>
                                        GAMCA Cleared
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chip, medicalStatus === 'pending' && styles.chipActive]}
                                    onPress={() => setMedicalStatus('pending')}
                                >
                                    <Text style={[styles.chipText, medicalStatus === 'pending' && styles.chipTextActive]}>
                                        Pending / Examined
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chip, medicalStatus === 'not_tested' && styles.chipActive]}
                                    onPress={() => setMedicalStatus('not_tested')}
                                >
                                    <Text style={[styles.chipText, medicalStatus === 'not_tested' && styles.chipTextActive]}>
                                        Not Tested
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Section 4: Work Experience */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Work Experience *</Text>
                            <View style={styles.chipsColumn}>
                                <TouchableOpacity
                                    style={[styles.chipFull, experience === 'overseas_gcc' && styles.chipActive]}
                                    onPress={() => setExperience('overseas_gcc')}
                                >
                                    <Ionicons name="star" size={15} color={experience === 'overseas_gcc' ? Colors.warning : Colors.gray400} />
                                    <Text style={[styles.chipText, experience === 'overseas_gcc' && styles.chipTextActive]}>
                                        3+ Yrs Overseas GCC Experience
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chipFull, experience === 'local' && styles.chipActive]}
                                    onPress={() => setExperience('local')}
                                >
                                    <Text style={[styles.chipText, experience === 'local' && styles.chipTextActive]}>
                                        1-2 Yrs Local Work Experience
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chipFull, experience === 'fresh' && styles.chipActive]}
                                    onPress={() => setExperience('fresh')}
                                >
                                    <Text style={[styles.chipText, experience === 'fresh' && styles.chipTextActive]}>
                                        Fresh Candidate (No Prior Exp)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Section 5: Availability */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Availability Timeline *</Text>
                            <View style={styles.chipsRow}>
                                <TouchableOpacity
                                    style={[styles.chip, availability === 'immediate' && styles.chipActive]}
                                    onPress={() => setAvailability('immediate')}
                                >
                                    <Ionicons name="flash-outline" size={14} color={availability === 'immediate' ? Colors.warning : Colors.gray700} />
                                    <Text style={[styles.chipText, availability === 'immediate' && styles.chipTextActive]}>
                                        Immediate
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chip, availability === '2_weeks' && styles.chipActive]}
                                    onPress={() => setAvailability('2_weeks')}
                                >
                                    <Text style={[styles.chipText, availability === '2_weeks' && styles.chipTextActive]}>
                                        Within 2 Wks
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.chip, availability === '1_month' && styles.chipActive]}
                                    onPress={() => setAvailability('1_month')}
                                >
                                    <Text style={[styles.chipText, availability === '1_month' && styles.chipTextActive]}>
                                        1 Month
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Section 6: Optional Note */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Additional Note / Cover Message (Optional)</Text>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Specify any additional skills, questions, or deployment preferences..."
                                placeholderTextColor={Colors.gray400}
                                multiline
                                numberOfLines={3}
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>
                    </ScrollView>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.88}
                    >
                        <Ionicons name="paper-plane" size={16} color={Colors.white} />
                        <Text style={styles.submitBtnText}>
                            {isSubmitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray200,
        marginBottom: 12,
    },
    headerTitleCol: { flex: 1, marginRight: 10 },
    modalTitle: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
    modalSub: { fontSize: 12, color: Colors.gray500, marginTop: 2, fontWeight: '600' },
    closeBtn: { padding: 4 },
    scrollContent: { paddingBottom: 16 },
    section: { marginBottom: 16 },
    sectionLabel: { fontSize: 13, fontWeight: '800', color: Colors.gray800, marginBottom: 8 },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray50,
        borderWidth: 1,
        borderColor: Colors.gray200,
        borderRadius: BorderRadius.md,
        paddingHorizontal: 12,
        height: 44,
        gap: 8,
    },
    textInput: { flex: 1, fontSize: 14, color: Colors.gray900, fontWeight: '600' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipsColumn: { gap: 8 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.gray100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    chipFull: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.gray100,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.gray200,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipSuccessActive: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    chipText: { fontSize: 12, fontWeight: '700', color: Colors.gray700 },
    chipTextActive: { color: Colors.white, fontWeight: '800' },
    noteInput: {
        backgroundColor: Colors.gray50,
        borderWidth: 1,
        borderColor: Colors.gray200,
        borderRadius: BorderRadius.md,
        padding: 12,
        fontSize: 13,
        color: Colors.gray900,
        textAlignVertical: 'top',
        minHeight: 70,
    },
    submitBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.accent,
        paddingVertical: 14,
        borderRadius: BorderRadius.xl,
        marginTop: 8,
        elevation: 2,
    },
    submitBtnText: { fontSize: 15, fontWeight: '900', color: Colors.white },
});
