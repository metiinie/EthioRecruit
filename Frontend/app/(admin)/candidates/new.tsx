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
    Modal,
    Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { candidateService } from '../../../services/candidateService';

// Custom Reusable Dropdown Component
function DropdownSelect({
    label,
    value,
    options,
    onSelect,
    placeholder = 'Select Option',
}: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onSelect: (val: string) => void;
    placeholder?: string;
}) {
    const [modalVisible, setModalVisible] = useState(false);
    const selectedObj = options.find((o) => o.value === value);

    return (
        <View style={{ marginBottom: 12 }}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Text style={selectedObj ? styles.dropdownBtnText : styles.dropdownPlaceholder}>
                    {selectedObj ? selectedObj.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#718096" />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[
                                        styles.optionItem,
                                        opt.value === value && styles.optionItemActive,
                                    ]}
                                    onPress={() => {
                                        onSelect(opt.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            opt.value === value && styles.optionTextActive,
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                    {opt.value === value && (
                                        <Ionicons name="checkmark" size={18} color="#1A365D" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

export default function NewCandidateWizardScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State with EMPTY DEFAULTS (No auto-filled values)
    const [formData, setFormData] = useState({
        // Step 1: Personal & Biometrics
        firstName: '',
        middleName: '',
        lastName: '',
        fullNameAmharic: '',
        age: '',
        gender: '',
        religion: '',
        maritalStatus: '',
        numberOfChildren: '',
        heightCm: '',
        weightKg: '',
        complexion: '',

        // Step 2: Contact & Location
        phone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        currentCountry: 'Ethiopia',
        city: '',
        originRegion: '',

        // Step 3: Legal & Documents
        passportNumber: '',
        passportPlaceOfIssue: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        nationalIdNumber: '',
        cocStatus: '',
        cocIssueDate: '',
        medicalStatus: '',
        policeClearanceStatus: '',
        visaStatus: '',

        // Step 4: Qualifications & Experience
        categoryId: '',
        appliedPosition: '',
        yearsOfExperience: '',
        hasOverseasExperience: false,
        overseasDetails: '',
        localExperienceDetails: '',
        educationLevel: '',
        skillsInput: '',
        languagesInput: '',

        // Step 5: Financials, Media & Publishing
        expectedSalary: '',
        expectedSalaryCurrency: 'SAR',
        contractPeriodYears: '2',
        photoUrl: '',
        fullBodyPhotoUrl: '',
        videoUrl: '',
        passportCopyUrl: '',
        medicalCertUrl: '',
        cocCertUrl: '',
        galleryPhotos: [] as string[],
        fullBodyPhotos: ['', '', '', '', ''] as string[],
        summary: '',
        isPublished: true,
    });

    const updateForm = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const updateFullBodyPhoto = (index: number, url: string) => {
        setFormData((prev) => {
            const nextList = [...(prev.fullBodyPhotos || ['', '', '', '', ''])];
            nextList[index] = url;
            return {
                ...prev,
                fullBodyPhotos: nextList,
                fullBodyPhotoUrl: nextList[0] || prev.fullBodyPhotoUrl,
            };
        });
    };

    // Media Picker Function (Gallery or Camera)
    const pickMedia = async (fieldKey: string, mediaType: 'image' | 'video', source: 'gallery' | 'camera') => {
        try {
            const permissionResult =
                source === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Denied', `Camera/Gallery access is required to attach ${mediaType}s.`);
                return;
            }

            const result =
                source === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pickedUri = result.assets[0].uri;
                updateForm(fieldKey, pickedUri);
            }
        } catch (err: any) {
            Alert.alert('Media Error', err.message || 'Failed to select media');
        }
    };

    const pickFullBodyMedia = async (index: number, source: 'gallery' | 'camera') => {
        try {
            const permissionResult =
                source === 'camera'
                    ? await ImagePicker.requestCameraPermissionsAsync()
                    : await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Denied', 'Camera/Gallery access is required.');
                return;
            }

            const result =
                source === 'camera'
                    ? await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    })
                    : await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.8,
                    });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const pickedUri = result.assets[0].uri;
                updateFullBodyPhoto(index, pickedUri);
            }
        } catch (err: any) {
            Alert.alert('Media Error', err.message || 'Failed to select media');
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.firstName.trim() || !formData.lastName.trim()) {
                Alert.alert('Required Fields', 'First name and Last name are required.');
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
            const parseDate = (val: string) => {
                if (!val || !val.trim()) return undefined;
                const d = new Date(val.trim());
                return isNaN(d.getTime()) ? undefined : d.toISOString();
            };

            const parseNum = (val: string, isFloat = false) => {
                if (!val || !val.trim()) return undefined;
                const n = isFloat ? parseFloat(val.trim()) : parseInt(val.trim(), 10);
                return isNaN(n) ? undefined : n;
            };

            const payload: any = {
                firstName: formData.firstName.trim(),
                middleName: formData.middleName.trim() || undefined,
                lastName: formData.lastName.trim(),
                fullNameAmharic: formData.fullNameAmharic.trim() || undefined,
                age: parseNum(formData.age),
                gender: formData.gender || undefined,
                religion: formData.religion || undefined,
                maritalStatus: formData.maritalStatus || undefined,
                numberOfChildren: parseNum(formData.numberOfChildren) ?? 0,
                heightCm: parseNum(formData.heightCm, true),
                weightKg: parseNum(formData.weightKg, true),
                complexion: formData.complexion || undefined,

                phone: formData.phone || undefined,
                emergencyContactName: formData.emergencyContactName || undefined,
                emergencyContactPhone: formData.emergencyContactPhone || undefined,
                emergencyContactRelation: formData.emergencyContactRelation || undefined,
                currentCountry: formData.currentCountry,
                currentCity: formData.city || undefined,
                originRegion: formData.originRegion || undefined,

                passportNumber: formData.passportNumber || undefined,
                passportPlaceOfIssue: formData.passportPlaceOfIssue || undefined,
                passportIssueDate: parseDate(formData.passportIssueDate),
                passportExpiryDate: parseDate(formData.passportExpiryDate),
                nationalIdNumber: formData.nationalIdNumber || undefined,
                cocStatus: formData.cocStatus || undefined,
                cocIssueDate: parseDate(formData.cocIssueDate),
                medicalStatus: formData.medicalStatus || undefined,
                policeClearanceStatus: formData.policeClearanceStatus || undefined,
                visaStatus: formData.visaStatus || undefined,

                categoryId: formData.categoryId || 'Housemaid',
                appliedPosition: formData.appliedPosition || undefined,
                yearsOfExperience: parseNum(formData.yearsOfExperience) ?? 0,
                hasOverseasExperience: formData.hasOverseasExperience,
                overseasDetails: formData.overseasDetails || undefined,
                localExperienceDetails: formData.localExperienceDetails || undefined,
                educationLevel: formData.educationLevel || undefined,
                skills: formData.skillsInput ? formData.skillsInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
                languages: formData.languagesInput ? formData.languagesInput.split(',').map((l) => l.trim()).filter(Boolean) : [],

                expectedSalary: parseNum(formData.expectedSalary),
                expectedSalaryCurrency: formData.expectedSalaryCurrency || 'SAR',
                contractPeriodYears: parseNum(formData.contractPeriodYears) ?? 2,
                summary: formData.summary || undefined,
                photoUrl: formData.photoUrl || undefined,
                fullBodyPhotoUrl: (formData.fullBodyPhotos || []).find((u) => u.trim().length > 0) || formData.fullBodyPhotoUrl || undefined,
                videoUrl: formData.videoUrl || undefined,
                passportCopyUrl: formData.passportCopyUrl || undefined,
                medicalCertUrl: formData.medicalCertUrl || undefined,
                cocCertUrl: formData.cocCertUrl || undefined,
                galleryPhotos: Array.from(new Set([
                    formData.photoUrl,
                    formData.fullBodyPhotoUrl,
                    ...(formData.fullBodyPhotos || []),
                    formData.passportCopyUrl,
                    formData.medicalCertUrl,
                    formData.cocCertUrl,
                    ...(Array.isArray((formData as any).galleryPhotos) ? (formData as any).galleryPhotos : [])
                ].filter((u): u is string => typeof u === 'string' && u.trim().length > 0))),
                isPublished: formData.isPublished,
            };

            await candidateService.createCandidate(payload);
            Alert.alert('Success', 'Candidate created successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            const errDetail = error.response?.data?.message;
            const message = Array.isArray(errDetail) ? errDetail.join('\n') : (errDetail || error.message || 'Failed to create candidate');
            Alert.alert('Error', message);
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
                                placeholder="First Name"
                                value={formData.firstName}
                                onChangeText={(val) => updateForm('firstName', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Father Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Father Name"
                                value={formData.middleName}
                                onChangeText={(val) => updateForm('middleName', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Grandfather / Last Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Grandfather / Last Name"
                        value={formData.lastName}
                        onChangeText={(val) => updateForm('lastName', val)}
                    />

                    <Text style={styles.label}>Full Name in Amharic (ሙሉ ስም በሐበሻ)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="የአመልካች ሙሉ ስም"
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
                                placeholder="e.g. 25"
                                value={formData.age}
                                onChangeText={(val) => updateForm('age', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <DropdownSelect
                                label="Gender"
                                value={formData.gender}
                                placeholder="Select Gender"
                                options={[
                                    { label: 'Female', value: 'female' },
                                    { label: 'Male', value: 'male' },
                                ]}
                                onSelect={(val) => updateForm('gender', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <DropdownSelect
                                label="Religion"
                                value={formData.religion}
                                placeholder="Select Religion"
                                options={[
                                    { label: 'Muslim', value: 'Muslim' },
                                    { label: 'Orthodox', value: 'Orthodox' },
                                    { label: 'Protestant', value: 'Protestant' },
                                    { label: 'Catholic', value: 'Catholic' },
                                    { label: 'Other', value: 'Other' },
                                ]}
                                onSelect={(val) => updateForm('religion', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <DropdownSelect
                                label="Marital Status"
                                value={formData.maritalStatus}
                                placeholder="Select Status"
                                options={[
                                    { label: 'Single', value: 'Single' },
                                    { label: 'Married', value: 'Married' },
                                    { label: 'Divorced', value: 'Divorced' },
                                    { label: 'Widowed', value: 'Widowed' },
                                ]}
                                onSelect={(val) => updateForm('maritalStatus', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>No. of Children</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="0"
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
                                placeholder="e.g. 160"
                                value={formData.heightCm}
                                onChangeText={(val) => updateForm('heightCm', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Weight (kg)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="e.g. 55"
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
                        placeholder="+251 9..."
                        value={formData.phone}
                        onChangeText={(val) => updateForm('phone', val)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Current City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Addis Ababa"
                                value={formData.city}
                                onChangeText={(val) => updateForm('city', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <DropdownSelect
                                label="Origin Region"
                                value={formData.originRegion}
                                placeholder="Select Region"
                                options={[
                                    { label: 'Addis Ababa', value: 'Addis Ababa' },
                                    { label: 'Oromia', value: 'Oromia' },
                                    { label: 'Amhara', value: 'Amhara' },
                                    { label: 'SNNPR', value: 'SNNPR' },
                                    { label: 'Sidama', value: 'Sidama' },
                                    { label: 'Tigray', value: 'Tigray' },
                                    { label: 'Somali', value: 'Somali' },
                                    { label: 'Afar', value: 'Afar' },
                                    { label: 'Benishangul-Gumuz', value: 'Benishangul-Gumuz' },
                                    { label: 'Gambela', value: 'Gambela' },
                                    { label: 'Harari', value: 'Harari' },
                                    { label: 'Dire Dawa', value: 'Dire Dawa' },
                                ]}
                                onSelect={(val) => updateForm('originRegion', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Emergency Next of Kin Contact</Text>
                    <Text style={styles.label}>Emergency Contact Person Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Emergency Contact Name"
                        value={formData.emergencyContactName}
                        onChangeText={(val) => updateForm('emergencyContactName', val)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Emergency Phone</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="+251 9..."
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
                                placeholder="EP..."
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
                        placeholder="NID-..."
                        value={formData.nationalIdNumber}
                        onChangeText={(val) => updateForm('nationalIdNumber', val)}
                    />

                    <Text style={styles.sectionHeader}>MoLS Competency, Medical & Police Checks</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <DropdownSelect
                                label="COC Certification"
                                value={formData.cocStatus}
                                placeholder="Select COC Status"
                                options={[
                                    { label: 'Level 1 Certified', value: 'LEVEL_1' },
                                    { label: 'Level 2 Certified', value: 'LEVEL_2' },
                                    { label: 'Level 3 Certified', value: 'LEVEL_3' },
                                    { label: 'Passed Assessment', value: 'PASSED' },
                                    { label: 'Pending Assessment', value: 'PENDING' },
                                    { label: 'Not Certified', value: 'NOT_CERTIFIED' },
                                ]}
                                onSelect={(val) => updateForm('cocStatus', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <DropdownSelect
                                label="Medical Status"
                                value={formData.medicalStatus}
                                placeholder="Select Medical"
                                options={[
                                    { label: 'Passed GAMCA / GCC', value: 'PASSED_GAMCA' },
                                    { label: 'Passed Local Medical', value: 'PASSED_LOCAL' },
                                    { label: 'Pending Examination', value: 'PENDING' },
                                    { label: 'Unfit / Rejected', value: 'UNFIT' },
                                ]}
                                onSelect={(val) => updateForm('medicalStatus', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <DropdownSelect
                                label="Police Clearance"
                                value={formData.policeClearanceStatus}
                                placeholder="Select Police Check"
                                options={[
                                    { label: 'Clean Record', value: 'CLEAN' },
                                    { label: 'Pending Request', value: 'PENDING' },
                                    { label: 'Attached', value: 'ATTACHED' },
                                    { label: 'Not Submitted', value: 'NOT_SUBMITTED' },
                                ]}
                                onSelect={(val) => updateForm('policeClearanceStatus', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <DropdownSelect
                                label="Visa Deployment"
                                value={formData.visaStatus}
                                placeholder="Select Visa Status"
                                options={[
                                    { label: 'No Visa', value: 'NO_VISA' },
                                    { label: 'Visa Applied', value: 'VISA_APPLIED' },
                                    { label: 'Visa Issued', value: 'VISA_ISSUED' },
                                    { label: 'Ready for Deployment', value: 'READY_FOR_DEPLOYMENT' },
                                ]}
                                onSelect={(val) => updateForm('visaStatus', val)}
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
                            <DropdownSelect
                                label="Job Category"
                                value={formData.categoryId}
                                placeholder="Select Category"
                                options={[
                                    { label: 'Housemaid (የቤት ሰራተኛ)', value: 'housemaid' },
                                    { label: 'Nanny / Childcare', value: 'nanny' },
                                    { label: 'Cook / Chef', value: 'cook' },
                                    { label: 'Elderly Caregiver', value: 'caregiver' },
                                    { label: 'Driver', value: 'driver' },
                                    { label: 'Cleaner', value: 'cleaner' },
                                    { label: 'Hospitality Staff', value: 'hospitality' },
                                    { label: 'General Worker', value: 'general_worker' },
                                ]}
                                onSelect={(val) => updateForm('categoryId', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Applied Position Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Housemaid & Cook"
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
                                placeholder="e.g. 3"
                                value={formData.yearsOfExperience}
                                onChangeText={(val) => updateForm('yearsOfExperience', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <DropdownSelect
                                label="Education Level"
                                value={formData.educationLevel}
                                placeholder="Select Education"
                                options={[
                                    { label: 'Primary School (1-8)', value: 'Primary School' },
                                    { label: 'High School (10th Grade)', value: 'High School (10th Grade)' },
                                    { label: 'High School (12th Grade)', value: 'High School (12th Grade)' },
                                    { label: 'TVET / Diploma', value: 'TVET / Diploma' },
                                    { label: 'University Degree', value: 'University Degree' },
                                ]}
                                onSelect={(val) => updateForm('educationLevel', val)}
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
                                placeholder="e.g. 2 Years in Riyadh, Saudi Arabia"
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
                                placeholder="e.g. 1200"
                                value={formData.expectedSalary}
                                onChangeText={(val) => updateForm('expectedSalary', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <DropdownSelect
                                label="Currency"
                                value={formData.expectedSalaryCurrency}
                                placeholder="Currency"
                                options={[
                                    { label: 'SAR (Saudi)', value: 'SAR' },
                                    { label: 'AED (UAE)', value: 'AED' },
                                    { label: 'QAR (Qatar)', value: 'QAR' },
                                    { label: 'USD ($)', value: 'USD' },
                                    { label: 'ETB (Birr)', value: 'ETB' },
                                ]}
                                onSelect={(val) => updateForm('expectedSalaryCurrency', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Contract Yrs</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="2"
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

                    <Text style={styles.sectionHeader}>Media & Document Attachments (Camera / Gallery / URL)</Text>

                    {/* Photo Picker */}
                    <Text style={styles.label}>Headshot Profile Photo</Text>
                    {formData.photoUrl ? (
                        <View style={styles.mediaPreviewBox}>
                            <Image source={{ uri: formData.photoUrl }} style={styles.previewThumb} />
                            <Text style={styles.previewUriText} numberOfLines={1}>
                                {formData.photoUrl}
                            </Text>
                            <TouchableOpacity onPress={() => updateForm('photoUrl', '')}>
                                <Ionicons name="close-circle" size={22} color="#E53E3E" />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    <View style={styles.pickerBtnRow}>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('photoUrl', 'image', 'gallery')}
                        >
                            <Ionicons name="images-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('photoUrl', 'image', 'camera')}
                        >
                            <Ionicons name="camera-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Or enter image URL (https://...)"
                        value={formData.photoUrl}
                        onChangeText={(val) => updateForm('photoUrl', val)}
                    />

                    {/* Up to 5 Full Body Standing Photos */}
                    <Text style={[styles.sectionHeader, { marginTop: 16 }]}>
                        Full-Body Standing Photos (Up to 5 Photos - Gulf Requirement)
                    </Text>

                    {[0, 1, 2, 3, 4].map((idx) => {
                        const currentUri = (formData.fullBodyPhotos && formData.fullBodyPhotos[idx]) || '';
                        return (
                            <View key={`fullbody-slot-${idx}`} style={{ marginBottom: 14, backgroundColor: '#F7FAFC', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                <Text style={[styles.label, { color: '#2D3748', fontWeight: '700' }]}>
                                    Full-Body Standing Photo #{idx + 1} {idx === 0 ? '(Primary)' : '(Optional)'}
                                </Text>
                                {currentUri ? (
                                    <View style={styles.mediaPreviewBox}>
                                        <Image source={{ uri: currentUri }} style={styles.previewThumb} />
                                        <Text style={styles.previewUriText} numberOfLines={1}>
                                            {currentUri}
                                        </Text>
                                        <TouchableOpacity onPress={() => updateFullBodyPhoto(idx, '')}>
                                            <Ionicons name="close-circle" size={22} color="#E53E3E" />
                                        </TouchableOpacity>
                                    </View>
                                ) : null}
                                <View style={styles.pickerBtnRow}>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
                                        onPress={() => pickFullBodyMedia(idx, 'gallery')}
                                    >
                                        <Ionicons name="images-outline" size={16} color="#1A365D" />
                                        <Text style={styles.pickerBtnText}>Gallery</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.pickerBtn}
                                        onPress={() => pickFullBodyMedia(idx, 'camera')}
                                    >
                                        <Ionicons name="camera-outline" size={16} color="#1A365D" />
                                        <Text style={styles.pickerBtnText}>Camera</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={[styles.input, { marginTop: 6 }]}
                                    placeholder={`Or enter full-body photo #${idx + 1} URL (https://...)`}
                                    value={currentUri}
                                    onChangeText={(val) => updateFullBodyPhoto(idx, val)}
                                />
                            </View>
                        );
                    })}

                    {/* Intro Video Picker */}
                    <Text style={styles.label}>Candidate Introduction Video</Text>
                    {formData.videoUrl ? (
                        <View style={styles.mediaPreviewBox}>
                            <Ionicons name="videocam" size={24} color="#319795" />
                            <Text style={styles.previewUriText} numberOfLines={1}>
                                {formData.videoUrl}
                            </Text>
                            <TouchableOpacity onPress={() => updateForm('videoUrl', '')}>
                                <Ionicons name="close-circle" size={22} color="#E53E3E" />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    <View style={styles.pickerBtnRow}>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('videoUrl', 'video', 'gallery')}
                        >
                            <Ionicons name="film-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Gallery Video</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('videoUrl', 'video', 'camera')}
                        >
                            <Ionicons name="videocam-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Record Video</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Or enter video URL (https://...)"
                        value={formData.videoUrl}
                        onChangeText={(val) => updateForm('videoUrl', val)}
                    />

                    {/* Document Scans (Gallery / Camera / URL) */}
                    <Text style={styles.label}>Passport Scan Document</Text>
                    {formData.passportCopyUrl ? (
                        <View style={styles.mediaPreviewBox}>
                            <Ionicons name="document-text" size={24} color="#2B6CB0" />
                            <Text style={styles.previewUriText} numberOfLines={1}>
                                {formData.passportCopyUrl}
                            </Text>
                            <TouchableOpacity onPress={() => updateForm('passportCopyUrl', '')}>
                                <Ionicons name="close-circle" size={22} color="#E53E3E" />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    <View style={styles.pickerBtnRow}>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('passportCopyUrl', 'image', 'gallery')}
                        >
                            <Ionicons name="images-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('passportCopyUrl', 'image', 'camera')}
                        >
                            <Ionicons name="camera-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Or enter passport document URL (https://...)"
                        value={formData.passportCopyUrl}
                        onChangeText={(val) => updateForm('passportCopyUrl', val)}
                    />

                    <Text style={styles.label}>Medical Certificate Copy</Text>
                    {formData.medicalCertUrl ? (
                        <View style={styles.mediaPreviewBox}>
                            <Ionicons name="medkit" size={24} color="#319795" />
                            <Text style={styles.previewUriText} numberOfLines={1}>
                                {formData.medicalCertUrl}
                            </Text>
                            <TouchableOpacity onPress={() => updateForm('medicalCertUrl', '')}>
                                <Ionicons name="close-circle" size={22} color="#E53E3E" />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    <View style={styles.pickerBtnRow}>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('medicalCertUrl', 'image', 'gallery')}
                        >
                            <Ionicons name="images-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('medicalCertUrl', 'image', 'camera')}
                        >
                            <Ionicons name="camera-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Or enter medical certificate URL (https://...)"
                        value={formData.medicalCertUrl}
                        onChangeText={(val) => updateForm('medicalCertUrl', val)}
                    />

                    <Text style={styles.label}>COC Competency Certificate Copy</Text>
                    {formData.cocCertUrl ? (
                        <View style={styles.mediaPreviewBox}>
                            <Ionicons name="ribbon" size={24} color="#D69E2E" />
                            <Text style={styles.previewUriText} numberOfLines={1}>
                                {formData.cocCertUrl}
                            </Text>
                            <TouchableOpacity onPress={() => updateForm('cocCertUrl', '')}>
                                <Ionicons name="close-circle" size={22} color="#E53E3E" />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    <View style={styles.pickerBtnRow}>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('cocCertUrl', 'image', 'gallery')}
                        >
                            <Ionicons name="images-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pickerBtn}
                            onPress={() => pickMedia('cocCertUrl', 'image', 'camera')}
                        >
                            <Ionicons name="camera-outline" size={16} color="#1A365D" />
                            <Text style={styles.pickerBtnText}>Take Photo</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        style={[styles.input, { marginTop: 6 }]}
                        placeholder="Or enter COC certificate URL (https://...)"
                        value={formData.cocCertUrl}
                        onChangeText={(val) => updateForm('cocCertUrl', val)}
                    />

                    <View style={{ backgroundColor: '#EBF8FF', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#BEE3F8', marginVertical: 10 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#2B6CB0', marginBottom: 2 }}>
                            📸 5-Photo Gallery Support Active
                        </Text>
                        <Text style={{ fontSize: 11, color: '#2C5282' }}>
                            All 5 attached media items above (Headshot, Full-Body, Passport, Medical & COC) are saved directly into the candidate's <Text style={{ fontWeight: '700' }}>galleryPhotos</Text> backend array column.
                        </Text>
                    </View>

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
    dropdownBtn: { backgroundColor: '#EDF2F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dropdownBtnText: { color: '#2D3748', fontSize: 13, fontWeight: '500' },
    dropdownPlaceholder: { color: '#A0AEC0', fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 24 },
    modalCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, elevation: 5 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A365D', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', paddingBottom: 8 },
    optionItem: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    optionItemActive: { backgroundColor: '#EBF8FF' },
    optionText: { fontSize: 14, color: '#4A5568' },
    optionTextActive: { fontWeight: 'bold', color: '#1A365D' },
    pickerBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    pickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#E2E8F0', paddingVertical: 8, borderRadius: 6 },
    pickerBtnText: { fontSize: 12, color: '#1A365D', fontWeight: '600' },
    mediaPreviewBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EDF2F7', padding: 8, borderRadius: 8, marginTop: 6 },
    previewThumb: { width: 36, height: 36, borderRadius: 4 },
    previewUriText: { flex: 1, fontSize: 11, color: '#4A5568' },
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
