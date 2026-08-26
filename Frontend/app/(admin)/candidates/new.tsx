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

    // Comprehensive Form State according to Ethiopian Agency Standards
    const [formData, setFormData] = useState({
        // Step 1: Personal & Biometrics
        firstName: '',
        middleName: '',
        lastName: '',
        fullNameAmharic: '',
        age: '25',
        gender: 'female',
        religion: 'Muslim',
        maritalStatus: 'Single',
        numberOfChildren: '0',
        heightCm: '160',
        weightKg: '55',
        complexion: 'Medium',

        // Step 2: Contact & Location
        phone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: 'Mother',
        currentCountry: 'Ethiopia',
        city: 'Addis Ababa',
        originRegion: 'Oromia',

        // Step 3: Legal & Documents
        passportNumber: '',
        passportPlaceOfIssue: 'Addis Ababa',
        passportIssueDate: '',
        passportExpiryDate: '',
        nationalIdNumber: '',
        cocStatus: 'LEVEL_1',
        cocIssueDate: '',
        medicalStatus: 'PASSED_GAMCA',
        policeClearanceStatus: 'CLEAN',
        visaStatus: 'NO_VISA',

        // Step 4: Qualifications & Experience
        categoryId: 'housemaid',
        appliedPosition: 'Housemaid & Cook',
        yearsOfExperience: '3',
        hasOverseasExperience: true,
        overseasDetails: '2 Years in Riyadh, Saudi Arabia (Housekeeping & Cooking)',
        localExperienceDetails: '1 Year in Addis Ababa',
        educationLevel: 'High School (10th Grade)',
        skillsInput: 'Cleaning, Cooking Arabic Food, Baby Care, Laundry, Ironing',
        languagesInput: 'Amharic, Basic Arabic, English',

        // Step 5: Financials, Media & Publishing
        expectedSalary: '1200',
        expectedSalaryCurrency: 'SAR',
        contractPeriodYears: '2',
        photoUrl: '',
        fullBodyPhotoUrl: '',
        videoUrl: '',
        passportCopyUrl: '',
        medicalCertUrl: '',
        cocCertUrl: '',
        summary: 'Hardworking, reliable housemaid experienced in housekeeping, childcare, and preparing Middle Eastern dishes.',
        isPublished: true,
    });

    const updateForm = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.firstName.trim() || !formData.lastName.trim()) {
                Alert.alert('Required Fields', 'First name and Last name (Grandfather name) are required.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            setStep(5);
        }
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload: any = {
                firstName: formData.firstName.trim(),
                middleName: formData.middleName.trim() || undefined,
                lastName: formData.lastName.trim(),
                fullNameAmharic: formData.fullNameAmharic.trim() || undefined,
                age: parseInt(formData.age, 10) || 25,
                gender: formData.gender,
                religion: formData.religion,
                maritalStatus: formData.maritalStatus,
                numberOfChildren: parseInt(formData.numberOfChildren, 10) || 0,
                heightCm: parseFloat(formData.heightCm) || undefined,
                weightKg: parseFloat(formData.weightKg) || undefined,
                complexion: formData.complexion || undefined,

                phone: formData.phone || undefined,
                emergencyContactName: formData.emergencyContactName || undefined,
                emergencyContactPhone: formData.emergencyContactPhone || undefined,
                emergencyContactRelation: formData.emergencyContactRelation || undefined,
                currentCountry: formData.currentCountry,
                currentCity: formData.city,
                originRegion: formData.originRegion || undefined,

                passportNumber: formData.passportNumber || undefined,
                passportPlaceOfIssue: formData.passportPlaceOfIssue || undefined,
                passportIssueDate: formData.passportIssueDate ? new Date(formData.passportIssueDate) : undefined,
                passportExpiryDate: formData.passportExpiryDate ? new Date(formData.passportExpiryDate) : undefined,
                nationalIdNumber: formData.nationalIdNumber || undefined,
                cocStatus: formData.cocStatus,
                cocIssueDate: formData.cocIssueDate ? new Date(formData.cocIssueDate) : undefined,
                medicalStatus: formData.medicalStatus,
                policeClearanceStatus: formData.policeClearanceStatus,
                visaStatus: formData.visaStatus,

                categoryId: formData.categoryId,
                appliedPosition: formData.appliedPosition || undefined,
                yearsOfExperience: parseInt(formData.yearsOfExperience, 10) || 0,
                hasOverseasExperience: formData.hasOverseasExperience,
                overseasDetails: formData.overseasDetails || undefined,
                localExperienceDetails: formData.localExperienceDetails || undefined,
                educationLevel: formData.educationLevel || undefined,
                skills: formData.skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
                languages: formData.languagesInput.split(',').map((l) => l.trim()).filter(Boolean),

                expectedSalary: parseInt(formData.expectedSalary, 10) || 1200,
                expectedSalaryCurrency: formData.expectedSalaryCurrency,
                contractPeriodYears: parseInt(formData.contractPeriodYears, 10) || 2,
                summary: formData.summary || undefined,
                photoUrl: formData.photoUrl || undefined,
                fullBodyPhotoUrl: formData.fullBodyPhotoUrl || undefined,
                videoUrl: formData.videoUrl || undefined,
                passportCopyUrl: formData.passportCopyUrl || undefined,
                medicalCertUrl: formData.medicalCertUrl || undefined,
                cocCertUrl: formData.cocCertUrl || undefined,
                isPublished: formData.isPublished,
            };

            await candidateService.createCandidate(payload);
            Alert.alert('Success', 'Candidate record created with full Ethiopian Agency detail!', [
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
            <Stack.Screen options={{ title: 'Add Agency Candidate' }} />

            {/* Stepper Header */}
            <View style={styles.stepperHeader}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <React.Fragment key={i}>
                        <View style={[styles.stepDot, step >= i && styles.stepDotActive]}>
                            <Text style={styles.stepNum}>{i}</Text>
                        </View>
                        {i < 5 && <View style={[styles.stepLine, step > i && styles.stepLineActive]} />}
                    </React.Fragment>
                ))}
            </View>

            <Text style={styles.stepTitle}>
                {step === 1 && '1. Personal & Biometrics'}
                {step === 2 && '2. Location & Emergency Contacts'}
                {step === 3 && '3. Passports, COC & Clearances'}
                {step === 4 && '4. Qualifications & Experience'}
                {step === 5 && '5. Financials, Media & Publishing'}
            </Text>

            {/* STEP 1: Personal & Biometrics */}
            {step === 1 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Full Name (English & Amharic)</Text>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>First Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Genet"
                                value={formData.firstName}
                                onChangeText={(val) => updateForm('firstName', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Father Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Bekele"
                                value={formData.middleName}
                                onChangeText={(val) => updateForm('middleName', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Grandfather / Last Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Tadesse"
                        value={formData.lastName}
                        onChangeText={(val) => updateForm('lastName', val)}
                    />

                    <Text style={styles.label}>Full Name in Amharic (ሙሉ ስም በሐበሻ)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ምሳሌ፡ ገነት በቀለ ታደሰ"
                        value={formData.fullNameAmharic}
                        onChangeText={(val) => updateForm('fullNameAmharic', val)}
                    />

                    <Text style={styles.sectionHeader}>Demographics & Physical Attributes</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.age}
                                onChangeText={(val) => updateForm('age', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Gender</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="female / male"
                                value={formData.gender}
                                onChangeText={(val) => updateForm('gender', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Religion</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Muslim / Orthodox"
                                value={formData.religion}
                                onChangeText={(val) => updateForm('religion', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Marital Status</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Single / Married"
                                value={formData.maritalStatus}
                                onChangeText={(val) => updateForm('maritalStatus', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>No. of Children</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.numberOfChildren}
                                onChangeText={(val) => updateForm('numberOfChildren', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Height (cm)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="160"
                                value={formData.heightCm}
                                onChangeText={(val) => updateForm('heightCm', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="55"
                                value={formData.weightKg}
                                onChangeText={(val) => updateForm('weightKg', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Complexion</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Fair / Medium"
                                value={formData.complexion}
                                onChangeText={(val) => updateForm('complexion', val)}
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* STEP 2: Location & Emergency Contacts */}
            {step === 2 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Candidate Contact Info</Text>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="+251 91 123 4567"
                        value={formData.phone}
                        onChangeText={(val) => updateForm('phone', val)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Current City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Addis Ababa"
                                value={formData.city}
                                onChangeText={(val) => updateForm('city', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Origin Region in Ethiopia</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Oromia / Amhara / SNNPR"
                                value={formData.originRegion}
                                onChangeText={(val) => updateForm('originRegion', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Emergency Next of Kin Contact</Text>
                    <Text style={styles.label}>Emergency Contact Person Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Almaz Bekele"
                        value={formData.emergencyContactName}
                        onChangeText={(val) => updateForm('emergencyContactName', val)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Emergency Phone</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+251 92 888 7766"
                                value={formData.emergencyContactPhone}
                                onChangeText={(val) => updateForm('emergencyContactPhone', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Relationship</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Mother / Father / Husband"
                                value={formData.emergencyContactRelation}
                                onChangeText={(val) => updateForm('emergencyContactRelation', val)}
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* STEP 3: Passports, COC & Clearances */}
            {step === 3 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Passport & National Identification</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Passport Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="EP1234567"
                                value={formData.passportNumber}
                                onChangeText={(val) => updateForm('passportNumber', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Place of Issue</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Addis Ababa"
                                value={formData.passportPlaceOfIssue}
                                onChangeText={(val) => updateForm('passportPlaceOfIssue', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Issue Date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2024-01-15"
                                value={formData.passportIssueDate}
                                onChangeText={(val) => updateForm('passportIssueDate', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Expiry Date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2029-01-15"
                                value={formData.passportExpiryDate}
                                onChangeText={(val) => updateForm('passportExpiryDate', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>National ID / FAN ID / Kebele ID</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="NID-88991122"
                        value={formData.nationalIdNumber}
                        onChangeText={(val) => updateForm('nationalIdNumber', val)}
                    />

                    <Text style={styles.sectionHeader}>MoLS Competency, Medical & Police Checks</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>COC Certification Status</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="LEVEL_1 / LEVEL_2 / PASSED"
                                value={formData.cocStatus}
                                onChangeText={(val) => updateForm('cocStatus', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Medical Status</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="PASSED_GAMCA / PENDING"
                                value={formData.medicalStatus}
                                onChangeText={(val) => updateForm('medicalStatus', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Police Clearance Status</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="CLEAN / PENDING"
                                value={formData.policeClearanceStatus}
                                onChangeText={(val) => updateForm('policeClearanceStatus', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Visa Deployment Status</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="NO_VISA / VISA_ISSUED"
                                value={formData.visaStatus}
                                onChangeText={(val) => updateForm('visaStatus', val)}
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* STEP 4: Qualifications & Experience */}
            {step === 4 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Primary Specialty & Job Role</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Job Category ID *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.categoryId}
                                onChangeText={(val) => updateForm('categoryId', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Applied Position Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Housemaid & Caregiver"
                                value={formData.appliedPosition}
                                onChangeText={(val) => updateForm('appliedPosition', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Years of Experience</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.yearsOfExperience}
                                onChangeText={(val) => updateForm('yearsOfExperience', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Education Level</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="High School (10th Grade)"
                                value={formData.educationLevel}
                                onChangeText={(val) => updateForm('educationLevel', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>Overseas Gulf Experience?</Text>
                            <Text style={styles.switchSub}>Has candidate worked abroad in Saudi, UAE, Qatar etc.?</Text>
                        </View>
                        <Switch
                            value={formData.hasOverseasExperience}
                            onValueChange={(val) => updateForm('hasOverseasExperience', val)}
                            trackColor={{ false: '#CBD5E0', true: '#319795' }}
                        />
                    </View>

                    {formData.hasOverseasExperience && (
                        <>
                            <Text style={styles.label}>Overseas Work Details</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 2 Years in Riyadh, Saudi Arabia as Housemaid"
                                value={formData.overseasDetails}
                                onChangeText={(val) => updateForm('overseasDetails', val)}
                            />
                        </>
                    )}

                    <Text style={styles.label}>Local Experience Details</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 1 Year in Addis Ababa"
                        value={formData.localExperienceDetails}
                        onChangeText={(val) => updateForm('localExperienceDetails', val)}
                    />

                    <Text style={styles.sectionHeader}>Skills & Spoken Languages</Text>
                    <Text style={styles.label}>Skills (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Cleaning, Cooking Arabic Food, Baby Care"
                        value={formData.skillsInput}
                        onChangeText={(val) => updateForm('skillsInput', val)}
                    />

                    <Text style={styles.label}>Languages Spoken (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Amharic, Basic Arabic, English"
                        value={formData.languagesInput}
                        onChangeText={(val) => updateForm('languagesInput', val)}
                    />
                </View>
            )}

            {/* STEP 5: Financials, Media & Publishing */}
            {step === 5 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Salary & Contract Expectations</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Expected Monthly Salary</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.expectedSalary}
                                onChangeText={(val) => updateForm('expectedSalary', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Currency</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.expectedSalaryCurrency}
                                onChangeText={(val) => updateForm('expectedSalaryCurrency', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Contract Yrs</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.contractPeriodYears}
                                onChangeText={(val) => updateForm('contractPeriodYears', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Candidate Bio / Summary</Text>
                    <TextInput
                        style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                        multiline
                        placeholder="Professional bio..."
                        value={formData.summary}
                        onChangeText={(val) => updateForm('summary', val)}
                    />

                    <Text style={styles.sectionHeader}>Media & Document Attachments</Text>
                    <Text style={styles.label}>Headshot Profile Photo URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/headshot.jpg"
                        value={formData.photoUrl}
                        onChangeText={(val) => updateForm('photoUrl', val)}
                    />

                    <Text style={styles.label}>Full-Body Standing Photo URL (Gulf Requirement)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/full_body.jpg"
                        value={formData.fullBodyPhotoUrl}
                        onChangeText={(val) => updateForm('fullBodyPhotoUrl', val)}
                    />

                    <Text style={styles.label}>Intro Video URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/intro.mp4"
                        value={formData.videoUrl}
                        onChangeText={(val) => updateForm('videoUrl', val)}
                    />

                    <Text style={styles.label}>Passport Scan Document URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/passport.pdf"
                        value={formData.passportCopyUrl}
                        onChangeText={(val) => updateForm('passportCopyUrl', val)}
                    />

                    <Text style={styles.label}>Medical Certificate Copy URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="https://cloudinary.com/medical.pdf"
                        value={formData.medicalCertUrl}
                        onChangeText={(val) => updateForm('medicalCertUrl', val)}
                    />

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>Publish Candidate Record</Text>
                            <Text style={styles.switchSub}>Make profile instantly searchable by potential employers.</Text>
                        </View>
                        <Switch
                            value={formData.isPublished}
                            onValueChange={(val) => updateForm('isPublished', val)}
                            trackColor={{ false: '#CBD5E0', true: '#319795' }}
                        />
                    </View>
                </View>
            )}

            {/* Navigation Controls */}
            <View style={styles.btnRow}>
                {step > 1 && (
                    <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
                        <Text style={styles.prevBtnText}>Previous</Text>
                    </TouchableOpacity>
                )}

                {step < 5 ? (
                    <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                        <Text style={styles.nextBtnText}>Next Step</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.submitBtnText}>Create Agency Candidate</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    stepperHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 14 },
    stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center' },
    stepDotActive: { backgroundColor: '#1A365D' },
    stepNum: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
    stepLine: { flex: 0.15, height: 3, backgroundColor: '#CBD5E0' },
    stepLineActive: { backgroundColor: '#1A365D' },
    stepTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A365D', textAlign: 'center', marginBottom: 16 },
    card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, elevation: 2 },
    sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#2B6CB0', marginTop: 14, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 4 },
    label: { fontSize: 12, fontWeight: '600', color: '#4A5568', marginTop: 10, marginBottom: 4 },
    input: { backgroundColor: '#EDF2F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, color: '#2D3748', fontSize: 13 },
    row: { flexDirection: 'row' },
    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    switchTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D3748' },
    switchSub: { fontSize: 11, color: '#718096', marginTop: 2 },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
    prevBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#E2E8F0' },
    prevBtnText: { color: '#4A5568', fontWeight: 'bold' },
    nextBtn: { flex: 1, marginLeft: 12, paddingVertical: 13, borderRadius: 8, backgroundColor: '#1A365D', alignItems: 'center' },
    nextBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
    submitBtn: { flex: 1, marginLeft: 12, paddingVertical: 13, borderRadius: 8, backgroundColor: '#D69E2E', alignItems: 'center' },
    submitBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
