import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { candidateService } from '../../../services/candidateService';
import { Colors } from '../../../constants';

export default function NewCandidateWizardScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '25',
        gender: 'FEMALE',
        religion: 'CHRISTIANITY',
        phone: '',
        photoUrl: '',
        categoryId: 'housemaid',
        experienceYears: '3',
        skillsInput: 'Cleaning, Cooking, Childcare',
        languagesInput: 'Amharic, English, Basic Arabic',
        medicalStatus: 'CLEARED',
        videoUrl: '',
        passportUrl: '',
        medicalCertUrl: '',
        isPublished: true,
    });

    const updateForm = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.firstName.trim() || !formData.lastName.trim()) {
                Alert.alert('Required Fields', 'First name and last name are required.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                age: parseInt(formData.age, 10) || 25,
                gender: formData.gender,
                religion: formData.religion,
                phone: formData.phone || undefined,
                photoUrl: formData.photoUrl || undefined,
                categoryId: formData.categoryId,
                experienceYears: parseInt(formData.experienceYears, 10) || 0,
                skills: formData.skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
                languages: formData.languagesInput.split(',').map((l) => l.trim()).filter(Boolean),
                medicalStatus: formData.medicalStatus,
                videoUrl: formData.videoUrl || undefined,
                passportUrl: formData.passportUrl || undefined,
                medicalCertUrl: formData.medicalCertUrl || undefined,
                isPublished: formData.isPublished,
            };

            await candidateService.createCandidate(payload);
            Alert.alert('Success', 'Candidate profile registered successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create candidate');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <Stack.Screen options={{ title: 'Add Candidate Wizard' }} />

            {/* Stepper Indicator */}
            <View style={styles.stepperHeader}>
                <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
                    <Text style={styles.stepNum}>1</Text>
                </View>
                <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                    <Text style={styles.stepNum}>2</Text>
                </View>
                <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
                <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}>
                    <Text style={styles.stepNum}>3</Text>
                </View>
            </View>

            <Text style={styles.stepTitle}>
                {step === 1 && 'Step 1: Personal Demographics'}
                {step === 2 && 'Step 2: Qualifications & Roster'}
                {step === 3 && 'Step 3: Media & Publishing'}
            </Text>

            {/* STEP 1 */}
            {step === 1 && (
                <View style={styles.card}>
                    <Text style={styles.label}>First Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Meron"
                        value={formData.firstName}
                        onChangeText={(val) => updateForm('firstName', val)}
                    />

                    <Text style={styles.label}>Last Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Tadesse"
                        value={formData.lastName}
                        onChangeText={(val) => updateForm('lastName', val)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.age}
                                onChangeText={(val) => updateForm('age', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Gender</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.gender}
                                onChangeText={(val) => updateForm('gender', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Religion</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Christian / Muslim"
                        value={formData.religion}
                        onChangeText={(val) => updateForm('religion', val)}
                    />

                    <Text style={styles.label}>Photo URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/photo.jpg"
                        value={formData.photoUrl}
                        onChangeText={(val) => updateForm('photoUrl', val)}
                    />
                </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <View style={styles.card}>
                    <Text style={styles.label}>Job Category ID</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.categoryId}
                        onChangeText={(val) => updateForm('categoryId', val)}
                    />

                    <Text style={styles.label}>Experience (Years)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={formData.experienceYears}
                        onChangeText={(val) => updateForm('experienceYears', val)}
                    />

                    <Text style={styles.label}>Skills (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.skillsInput}
                        onChangeText={(val) => updateForm('skillsInput', val)}
                    />

                    <Text style={styles.label}>Languages Spoken</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.languagesInput}
                        onChangeText={(val) => updateForm('languagesInput', val)}
                    />

                    <Text style={styles.label}>Medical Clearance Status</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.medicalStatus}
                        onChangeText={(val) => updateForm('medicalStatus', val)}
                    />
                </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <View style={styles.card}>
                    <Text style={styles.label}>Intro Video URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/video.mp4"
                        value={formData.videoUrl}
                        onChangeText={(val) => updateForm('videoUrl', val)}
                    />

                    <Text style={styles.label}>Passport Scan Copy URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/passport.pdf"
                        value={formData.passportUrl}
                        onChangeText={(val) => updateForm('passportUrl', val)}
                    />

                    <Text style={styles.label}>Medical Certificate Document URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/medical.pdf"
                        value={formData.medicalCertUrl}
                        onChangeText={(val) => updateForm('medicalCertUrl', val)}
                    />

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>Publish Immediately</Text>
                            <Text style={styles.switchSub}>Make profile publicly searchable on mobile feed.</Text>
                        </View>
                        <Switch
                            value={formData.isPublished}
                            onValueChange={(val) => updateForm('isPublished', val)}
                            trackColor={{ false: '#CBD5E0', true: '#319795' }}
                        />
                    </View>
                </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.btnRow}>
                {step > 1 && (
                    <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
                        <Text style={styles.prevBtnText}>Previous</Text>
                    </TouchableOpacity>
                )}

                {step < 3 ? (
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.nextBtnText}>Next Step</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.submitBtnText}>Create Candidate</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    stepperHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
    stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center' },
    stepDotActive: { backgroundColor: '#1A365D' },
    stepNum: { color: '#FFFFFF', fontWeight: 'bold' },
    stepLine: { flex: 0.2, height: 3, backgroundColor: '#CBD5E0' },
    stepLineActive: { backgroundColor: '#1A365D' },
    stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A365D', textAlign: 'center', marginBottom: 16 },
    card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, elevation: 2 },
    label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginTop: 12, marginBottom: 4 },
    input: { backgroundColor: '#EDF2F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#2D3748', fontSize: 14 },
    row: { flexDirection: 'row' },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    switchTitle: { fontSize: 15, fontWeight: 'bold', color: '#2D3748' },
    switchSub: { fontSize: 12, color: '#718096', marginTop: 2 },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
    prevBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: '#E2E8F0' },
    prevBtnText: { color: '#4A5568', fontWeight: 'bold' },
    nextBtn: { flex: 1, marginLeft: 12, paddingVertical: 14, borderRadius: 8, backgroundColor: '#1A365D', alignItems: 'center' },
    nextBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
    submitBtn: { flex: 1, marginLeft: 12, paddingVertical: 14, borderRadius: 8, backgroundColor: '#D69E2E', alignItems: 'center' },
    submitBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
