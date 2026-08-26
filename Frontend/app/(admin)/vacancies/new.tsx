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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { vacancyService } from '../../../services/vacancyService';

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

export default function NewVacancyScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State with CLEAN EMPTY DEFAULTS (No auto-filled values)
    const [formData, setFormData] = useState({
        // Step 1: Job Details & Partners
        title: '',
        jobCode: '',
        categoryId: '',
        employerType: 'individual_family',
        employerName: '',
        showEmployerName: false,
        foreignAgencyPartner: '',

        // Step 2: Location & Compensation
        country: '',
        city: '',
        targetRegion: '',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'SAR',
        overtimeTerms: '',
        placementFeeTerms: '',

        // Step 3: Contract & Welfare Benefits
        contractPeriodYears: '2',
        probationPeriodMonths: '3',
        workingHoursPerDay: '8',
        workingDaysPerWeek: '6',
        offDaysPerMonth: '4',
        visaSponsorship: true,
        accommodationProvided: true,
        mealsProvided: true,
        transportationProvided: true,
        healthInsurance: true,
        flightTicketProvided: true,
        annualLeaveDays: '30',

        // Step 4: Candidate Criteria & Requirements
        genderPreference: 'any',
        religionPreference: 'any',
        ageMin: '',
        ageMax: '',
        experienceRequired: '',
        overseasExpRequired: false,
        educationLevelRequired: '',
        requirementsInput: '',
        requiredSkillsInput: '',
        requiredLanguagesInput: '',
        requiredCertificatesInput: '',

        // Step 5: Capacity, Description & Publishing
        vacanciesCount: '',
        applicationDeadline: '',
        description: '',
        status: 'ACTIVE',
    });

    const updateForm = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.title.trim()) {
                Alert.alert('Required Field', 'Job Vacancy title is required.');
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
        if (!formData.title.trim() || !formData.description.trim()) {
            Alert.alert('Required Fields', 'Vacancy title and description are required.');
            return;
        }

        setSubmitting(true);
        try {
            const payload: any = {
                title: formData.title.trim(),
                jobCode: formData.jobCode.trim() || undefined,
                categoryId: formData.categoryId || 'housemaid',
                employerType: formData.employerType,
                employerName: formData.employerName || undefined,
                showEmployerName: formData.showEmployerName,
                foreignAgencyPartner: formData.foreignAgencyPartner || undefined,

                country: formData.country || 'Saudi Arabia',
                city: formData.city || undefined,
                targetRegion: formData.targetRegion || undefined,
                salaryMin: formData.salaryMin ? parseInt(formData.salaryMin, 10) : 1500,
                salaryMax: formData.salaryMax ? parseInt(formData.salaryMax, 10) : undefined,
                salaryCurrency: formData.salaryCurrency,
                overtimeTerms: formData.overtimeTerms || undefined,
                placementFeeTerms: formData.placementFeeTerms || undefined,

                contractPeriodYears: formData.contractPeriodYears ? parseInt(formData.contractPeriodYears, 10) : 2,
                probationPeriodMonths: formData.probationPeriodMonths ? parseInt(formData.probationPeriodMonths, 10) : 3,
                workingHoursPerDay: formData.workingHoursPerDay ? parseInt(formData.workingHoursPerDay, 10) : 8,
                workingDaysPerWeek: formData.workingDaysPerWeek ? parseInt(formData.workingDaysPerWeek, 10) : 6,
                offDaysPerMonth: formData.offDaysPerMonth ? parseInt(formData.offDaysPerMonth, 10) : 4,
                visaSponsorship: formData.visaSponsorship,
                accommodationProvided: formData.accommodationProvided,
                mealsProvided: formData.mealsProvided,
                transportationProvided: formData.transportationProvided,
                healthInsurance: formData.healthInsurance,
                flightTicketProvided: formData.flightTicketProvided,
                annualLeaveDays: formData.annualLeaveDays ? parseInt(formData.annualLeaveDays, 10) : 30,

                genderPreference: formData.genderPreference,
                religionPreference: formData.religionPreference,
                ageMin: formData.ageMin ? parseInt(formData.ageMin, 10) : undefined,
                ageMax: formData.ageMax ? parseInt(formData.ageMax, 10) : undefined,
                experienceRequired: formData.experienceRequired ? parseInt(formData.experienceRequired, 10) : 0,
                overseasExpRequired: formData.overseasExpRequired,
                educationLevelRequired: formData.educationLevelRequired || undefined,
                requirements: formData.requirementsInput ? formData.requirementsInput.split(',').map((r) => r.trim()).filter(Boolean) : [],
                requiredSkills: formData.requiredSkillsInput ? formData.requiredSkillsInput.split(',').map((s) => s.trim()).filter(Boolean) : [],
                requiredLanguages: formData.requiredLanguagesInput ? formData.requiredLanguagesInput.split(',').map((l) => l.trim()).filter(Boolean) : [],
                requiredCertificates: formData.requiredCertificatesInput ? formData.requiredCertificatesInput.split(',').map((c) => c.trim()).filter(Boolean) : [],

                vacanciesCount: formData.vacanciesCount ? parseInt(formData.vacanciesCount, 10) : 1,
                applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined,
                description: formData.description,
                status: formData.status,
            };

            await vacancyService.createVacancy(payload);
            Alert.alert('Success', 'Job Vacancy posted successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to post vacancy');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <Stack.Screen options={{ title: 'Post Job Vacancy' }} />

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
                {step === 1 && '1. Job Details & Agency Partner'}
                {step === 2 && '2. Destination & Compensation'}
                {step === 3 && '3. Contract & Welfare Benefits'}
                {step === 4 && '4. Candidate Criteria & Requirements'}
                {step === 5 && '5. Capacity, Description & Publishing'}
            </Text>

            {/* STEP 1 */}
            {step === 1 && (
                <View style={styles.card}>
                    <Text style={styles.label}>Vacancy Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Vacancy Title"
                        value={formData.title}
                        onChangeText={(val) => updateForm('title', val)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Job Code / Ref No.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VAC-..."
                                value={formData.jobCode}
                                onChangeText={(val) => updateForm('jobCode', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
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
                    </View>

                    <DropdownSelect
                        label="Employer Type"
                        value={formData.employerType}
                        placeholder="Select Employer Type"
                        options={[
                            { label: 'Individual Family', value: 'individual_family' },
                            { label: 'Corporate Company', value: 'corporate' },
                            { label: 'Foreign Recruitment Agency', value: 'foreign_agency' },
                        ]}
                        onSelect={(val) => updateForm('employerType', val)}
                    />

                    <Text style={styles.label}>Employer Client Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Employer Name"
                        value={formData.employerName}
                        onChangeText={(val) => updateForm('employerName', val)}
                    />

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>Show Employer Name Publicly</Text>
                            <Text style={styles.switchSub}>If toggled off, employer name will remain confidential.</Text>
                        </View>
                        <Switch
                            value={formData.showEmployerName}
                            onValueChange={(val) => updateForm('showEmployerName', val)}
                            trackColor={{ false: '#CBD5E0', true: '#319795' }}
                        />
                    </View>

                    <Text style={styles.label}>Foreign Partner Recruitment Agency</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Partner Agency Name"
                        value={formData.foreignAgencyPartner}
                        onChangeText={(val) => updateForm('foreignAgencyPartner', val)}
                    />
                </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Destination & Location</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <DropdownSelect
                                label="Destination Country"
                                value={formData.country}
                                placeholder="Select Country"
                                options={[
                                    { label: 'Saudi Arabia', value: 'Saudi Arabia' },
                                    { label: 'United Arab Emirates', value: 'United Arab Emirates' },
                                    { label: 'Qatar', value: 'Qatar' },
                                    { label: 'Kuwait', value: 'Kuwait' },
                                    { label: 'Oman', value: 'Oman' },
                                    { label: 'Jordan', value: 'Jordan' },
                                    { label: 'Ethiopia', value: 'Ethiopia' },
                                ]}
                                onSelect={(val) => updateForm('country', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Riyadh"
                                value={formData.city}
                                onChangeText={(val) => updateForm('city', val)}
                            />
                        </View>
                    </View>

                    <DropdownSelect
                        label="Target Region"
                        value={formData.targetRegion}
                        placeholder="Select Target Region"
                        options={[
                            { label: 'GCC / Middle East', value: 'GCC / Middle East' },
                            { label: 'Horn of Africa', value: 'Horn of Africa' },
                            { label: 'Local Ethiopia', value: 'Local Ethiopia' },
                        ]}
                        onSelect={(val) => updateForm('targetRegion', val)}
                    />

                    <Text style={styles.sectionHeader}>Salary & Remuneration</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Salary Min</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="1500"
                                value={formData.salaryMin}
                                onChangeText={(val) => updateForm('salaryMin', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Salary Max</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="1800"
                                value={formData.salaryMax}
                                onChangeText={(val) => updateForm('salaryMax', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <DropdownSelect
                                label="Currency"
                                value={formData.salaryCurrency}
                                placeholder="Currency"
                                options={[
                                    { label: 'SAR (Saudi)', value: 'SAR' },
                                    { label: 'AED (UAE)', value: 'AED' },
                                    { label: 'QAR (Qatar)', value: 'QAR' },
                                    { label: 'USD ($)', value: 'USD' },
                                    { label: 'ETB (Birr)', value: 'ETB' },
                                ]}
                                onSelect={(val) => updateForm('salaryCurrency', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Overtime Terms & Conditions</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Overtime terms"
                        value={formData.overtimeTerms}
                        onChangeText={(val) => updateForm('overtimeTerms', val)}
                    />

                    <Text style={styles.label}>Placement & Recruitment Fee Policy</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Placement fee terms"
                        value={formData.placementFeeTerms}
                        onChangeText={(val) => updateForm('placementFeeTerms', val)}
                    />
                </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Contract & Work Hours</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Contract Period (Yrs)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="2"
                                value={formData.contractPeriodYears}
                                onChangeText={(val) => updateForm('contractPeriodYears', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Probation (Months)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="3"
                                value={formData.probationPeriodMonths}
                                onChangeText={(val) => updateForm('probationPeriodMonths', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Leave Days / 2 Yrs</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="30"
                                value={formData.annualLeaveDays}
                                onChangeText={(val) => updateForm('annualLeaveDays', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Work Hours / Day</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="8"
                                value={formData.workingHoursPerDay}
                                onChangeText={(val) => updateForm('workingHoursPerDay', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Work Days / Week</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="6"
                                value={formData.workingDaysPerWeek}
                                onChangeText={(val) => updateForm('workingDaysPerWeek', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Off Days / Month</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="4"
                                value={formData.offDaysPerMonth}
                                onChangeText={(val) => updateForm('offDaysPerMonth', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionHeader}>Included Welfare & Provisions</Text>
                    {[
                        { key: 'visaSponsorship', title: 'Free Visa & Work Permit Sponsorship' },
                        { key: 'accommodationProvided', title: 'Free Private Accommodation' },
                        { key: 'mealsProvided', title: 'Free Meals (3 Times Daily)' },
                        { key: 'transportationProvided', title: 'Free Local Transportation' },
                        { key: 'healthInsurance', title: 'Full Medical & Health Insurance' },
                        { key: 'flightTicketProvided', title: 'Round-Trip Air Ticket Every 2 Years' },
                    ].map((item) => (
                        <View style={styles.switchRowSmall} key={item.key}>
                            <Text style={styles.switchTitleSmall}>{item.title}</Text>
                            <Switch
                                value={(formData as any)[item.key]}
                                onValueChange={(val) => updateForm(item.key, val)}
                                trackColor={{ false: '#CBD5E0', true: '#319795' }}
                            />
                        </View>
                    ))}
                </View>
            )}

            {/* STEP 4 */}
            {step === 4 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Demographics Preference</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <DropdownSelect
                                label="Gender Preference"
                                value={formData.genderPreference}
                                placeholder="Select Gender"
                                options={[
                                    { label: 'Any', value: 'any' },
                                    { label: 'Female', value: 'female' },
                                    { label: 'Male', value: 'male' },
                                ]}
                                onSelect={(val) => updateForm('genderPreference', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <DropdownSelect
                                label="Religion Preference"
                                value={formData.religionPreference}
                                placeholder="Select Religion"
                                options={[
                                    { label: 'Any', value: 'any' },
                                    { label: 'Muslim', value: 'Muslim' },
                                    { label: 'Orthodox', value: 'Orthodox' },
                                    { label: 'Protestant', value: 'Protestant' },
                                    { label: 'Catholic', value: 'Catholic' },
                                ]}
                                onSelect={(val) => updateForm('religionPreference', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Age Min</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="21"
                                value={formData.ageMin}
                                onChangeText={(val) => updateForm('ageMin', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Age Max</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="40"
                                value={formData.ageMax}
                                onChangeText={(val) => updateForm('ageMax', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Exp Required (Yrs)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="0"
                                value={formData.experienceRequired}
                                onChangeText={(val) => updateForm('experienceRequired', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.switchTitle}>Require Prior Overseas Gulf Experience</Text>
                            <Text style={styles.switchSub}>Candidate must have worked in Gulf countries before.</Text>
                        </View>
                        <Switch
                            value={formData.overseasExpRequired}
                            onValueChange={(val) => updateForm('overseasExpRequired', val)}
                            trackColor={{ false: '#CBD5E0', true: '#319795' }}
                        />
                    </View>

                    <Text style={styles.label}>Minimum Education Level Required</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Primary School / 8th Grade Minimum"
                        value={formData.educationLevelRequired}
                        onChangeText={(val) => updateForm('educationLevelRequired', val)}
                    />

                    <Text style={styles.sectionHeader}>Required Skills & Certificates</Text>
                    <Text style={styles.label}>Key Requirements (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Valid Passport, GAMCA Medical, COC Level 1"
                        value={formData.requirementsInput}
                        onChangeText={(val) => updateForm('requirementsInput', val)}
                    />

                    <Text style={styles.label}>Required Skills (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Cleaning, Cooking Arabic Dishes, Baby Care"
                        value={formData.requiredSkillsInput}
                        onChangeText={(val) => updateForm('requiredSkillsInput', val)}
                    />

                    <Text style={styles.label}>Required Languages (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Basic Arabic, Amharic"
                        value={formData.requiredLanguagesInput}
                        onChangeText={(val) => updateForm('requiredLanguagesInput', val)}
                    />

                    <Text style={styles.label}>Required Documents/Certificates (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Valid Passport, Fit Medical, Level 1 COC"
                        value={formData.requiredCertificatesInput}
                        onChangeText={(val) => updateForm('requiredCertificatesInput', val)}
                    />
                </View>
            )}

            {/* STEP 5 */}
            {step === 5 && (
                <View style={styles.card}>
                    <Text style={styles.sectionHeader}>Vacancy Capacity & Deadline</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Number of Vacancies (Positions)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="1"
                                value={formData.vacanciesCount}
                                onChangeText={(val) => updateForm('vacanciesCount', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                value={formData.applicationDeadline}
                                onChangeText={(val) => updateForm('applicationDeadline', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Detailed Job Description *</Text>
                    <TextInput
                        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                        multiline
                        placeholder="Detailed description of duties and benefits..."
                        value={formData.description}
                        onChangeText={(val) => updateForm('description', val)}
                    />

                    <DropdownSelect
                        label="Posting Status"
                        value={formData.status}
                        placeholder="Select Status"
                        options={[
                            { label: 'Active (Published)', value: 'ACTIVE' },
                            { label: 'Draft', value: 'DRAFT' },
                            { label: 'Paused', value: 'PAUSED' },
                            { label: 'Closed', value: 'CLOSED' },
                        ]}
                        onSelect={(val) => updateForm('status', val)}
                    />
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
                            <Text style={styles.submitBtnText}>Post Agency Vacancy</Text>
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
    switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    switchRowSmall: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    switchTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D3748' },
    switchSub: { fontSize: 11, color: '#718096', marginTop: 2 },
    switchTitleSmall: { fontSize: 13, color: '#2D3748', flex: 1 },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
    prevBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#E2E8F0' },
    prevBtnText: { color: '#4A5568', fontWeight: 'bold' },
    nextBtn: { flex: 1, marginLeft: 12, paddingVertical: 13, borderRadius: 8, backgroundColor: '#1A365D', alignItems: 'center' },
    nextBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
    submitBtn: { flex: 1, marginLeft: 12, paddingVertical: 13, borderRadius: 8, backgroundColor: '#D69E2E', alignItems: 'center' },
    submitBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
