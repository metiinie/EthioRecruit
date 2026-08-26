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
import { vacancyService } from '../../../services/vacancyService';

export default function NewVacancyScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State for Ethiopian Agency Job Listings
    const [formData, setFormData] = useState({
        // Step 1: Job Details & Partners
        title: '',
        jobCode: 'VAC-2026-089',
        categoryId: 'housemaid',
        employerType: 'individual_family',
        employerName: 'Al-Farooq Family',
        showEmployerName: false,
        foreignAgencyPartner: 'Al-Riyadh Global Manpower Agency',

        // Step 2: Location & Compensation
        country: 'Saudi Arabia',
        city: 'Riyadh',
        targetRegion: 'GCC / Middle East',
        salaryMin: '1500',
        salaryMax: '1800',
        salaryCurrency: 'SAR',
        overtimeTerms: 'Overtime paid at 1.5x standard hourly rate',
        placementFeeTerms: 'Zero recruitment fee charged to candidates (MoLS compliant)',

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
        genderPreference: 'female',
        religionPreference: 'Muslim',
        ageMin: '21',
        ageMax: '40',
        experienceRequired: '1',
        overseasExpRequired: false,
        educationLevelRequired: 'Primary School / 8th Grade Minimum',
        requirementsInput: 'Valid Ethiopian Passport (2+ yrs validity), GAMCA Fit Medical, MoLS COC Level 1',
        requiredSkillsInput: 'Cleaning, Cooking Arabic Dishes, Baby Care, Laundry',
        requiredLanguagesInput: 'Basic Arabic, Amharic',
        requiredCertificatesInput: 'Valid Passport, Fit Medical, Level 1 COC Certificate',

        // Step 5: Capacity, Description & Publishing
        vacanciesCount: '5',
        applicationDeadline: '2026-10-31',
        description: 'Urgent demand for experienced housemaids and cooks in Riyadh, Saudi Arabia. Full sponsorship, free accommodation, free meals, medical insurance, and round-trip flight tickets provided.',
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
                categoryId: formData.categoryId,
                employerType: formData.employerType,
                employerName: formData.employerName || undefined,
                showEmployerName: formData.showEmployerName,
                foreignAgencyPartner: formData.foreignAgencyPartner || undefined,

                country: formData.country,
                city: formData.city || undefined,
                targetRegion: formData.targetRegion || undefined,
                salaryMin: parseInt(formData.salaryMin, 10) || 1500,
                salaryMax: parseInt(formData.salaryMax, 10) || 1800,
                salaryCurrency: formData.salaryCurrency,
                overtimeTerms: formData.overtimeTerms || undefined,
                placementFeeTerms: formData.placementFeeTerms || undefined,

                contractPeriodYears: parseInt(formData.contractPeriodYears, 10) || 2,
                probationPeriodMonths: parseInt(formData.probationPeriodMonths, 10) || 3,
                workingHoursPerDay: parseInt(formData.workingHoursPerDay, 10) || 8,
                workingDaysPerWeek: parseInt(formData.workingDaysPerWeek, 10) || 6,
                offDaysPerMonth: parseInt(formData.offDaysPerMonth, 10) || 4,
                visaSponsorship: formData.visaSponsorship,
                accommodationProvided: formData.accommodationProvided,
                mealsProvided: formData.mealsProvided,
                transportationProvided: formData.transportationProvided,
                healthInsurance: formData.healthInsurance,
                flightTicketProvided: formData.flightTicketProvided,
                annualLeaveDays: parseInt(formData.annualLeaveDays, 10) || 30,

                genderPreference: formData.genderPreference,
                religionPreference: formData.religionPreference,
                ageMin: parseInt(formData.ageMin, 10) || 21,
                ageMax: parseInt(formData.ageMax, 10) || 40,
                experienceRequired: parseInt(formData.experienceRequired, 10) || 0,
                overseasExpRequired: formData.overseasExpRequired,
                educationLevelRequired: formData.educationLevelRequired || undefined,
                requirements: formData.requirementsInput.split(',').map((r) => r.trim()).filter(Boolean),
                requiredSkills: formData.requiredSkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
                requiredLanguages: formData.requiredLanguagesInput.split(',').map((l) => l.trim()).filter(Boolean),
                requiredCertificates: formData.requiredCertificatesInput.split(',').map((c) => c.trim()).filter(Boolean),

                vacanciesCount: parseInt(formData.vacanciesCount, 10) || 1,
                applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined,
                description: formData.description,
                status: formData.status,
            };

            await vacancyService.createVacancy(payload);
            Alert.alert('Success', 'Job Vacancy posted with complete Ethiopian Agency terms!', [
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
                        placeholder="e.g. Experienced Housemaid & Cook - Riyadh"
                        value={formData.title}
                        onChangeText={(val) => updateForm('title', val)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Job Code / Ref No.</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VAC-2026-089"
                                value={formData.jobCode}
                                onChangeText={(val) => updateForm('jobCode', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Category ID *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.categoryId}
                                onChangeText={(val) => updateForm('categoryId', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Employer Type</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="individual_family / corporate"
                        value={formData.employerType}
                        onChangeText={(val) => updateForm('employerType', val)}
                    />

                    <Text style={styles.label}>Employer Client Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Al-Farooq Family"
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
                        placeholder="e.g. Al-Riyadh Global Manpower Agency (Saudi Arabia)"
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
                            <Text style={styles.label}>Destination Country *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.country}
                                onChangeText={(val) => updateForm('country', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Riyadh / Dubai / Jeddah"
                                value={formData.city}
                                onChangeText={(val) => updateForm('city', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Target Region</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="GCC / Middle East / Horn of Africa"
                        value={formData.targetRegion}
                        onChangeText={(val) => updateForm('targetRegion', val)}
                    />

                    <Text style={styles.sectionHeader}>Salary & Remuneration</Text>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Salary Min</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.salaryMin}
                                onChangeText={(val) => updateForm('salaryMin', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Salary Max</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.salaryMax}
                                onChangeText={(val) => updateForm('salaryMax', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Currency</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.salaryCurrency}
                                onChangeText={(val) => updateForm('salaryCurrency', val)}
                            />
                        </View>
                    </View>

                    <Text style={styles.label}>Overtime Terms & Conditions</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Overtime paid at 1.5x standard rate"
                        value={formData.overtimeTerms}
                        onChangeText={(val) => updateForm('overtimeTerms', val)}
                    />

                    <Text style={styles.label}>Placement & Recruitment Fee Policy</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Zero candidate fee under MoLS regulations"
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
                                value={formData.contractPeriodYears}
                                onChangeText={(val) => updateForm('contractPeriodYears', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Probation (Months)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.probationPeriodMonths}
                                onChangeText={(val) => updateForm('probationPeriodMonths', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Leave Days / 2 Yrs</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
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
                                value={formData.workingHoursPerDay}
                                onChangeText={(val) => updateForm('workingHoursPerDay', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Work Days / Week</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.workingDaysPerWeek}
                                onChangeText={(val) => updateForm('workingDaysPerWeek', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Off Days / Month</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
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
                            <Text style={styles.label}>Gender Preference</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="female / male / any"
                                value={formData.genderPreference}
                                onChangeText={(val) => updateForm('genderPreference', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Religion Preference</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Muslim / Christian / any"
                                value={formData.religionPreference}
                                onChangeText={(val) => updateForm('religionPreference', val)}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.label}>Age Min</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.ageMin}
                                onChangeText={(val) => updateForm('ageMin', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 6 }}>
                            <Text style={styles.label}>Age Max</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.ageMax}
                                onChangeText={(val) => updateForm('ageMax', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Exp Required (Yrs)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
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
                        placeholder="Primary School / 8th Grade Minimum"
                        value={formData.educationLevelRequired}
                        onChangeText={(val) => updateForm('educationLevelRequired', val)}
                    />

                    <Text style={styles.sectionHeader}>Required Skills & Certificates</Text>
                    <Text style={styles.label}>Key Requirements (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.requirementsInput}
                        onChangeText={(val) => updateForm('requirementsInput', val)}
                    />

                    <Text style={styles.label}>Required Skills (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.requiredSkillsInput}
                        onChangeText={(val) => updateForm('requiredSkillsInput', val)}
                    />

                    <Text style={styles.label}>Required Languages (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.requiredLanguagesInput}
                        onChangeText={(val) => updateForm('requiredLanguagesInput', val)}
                    />

                    <Text style={styles.label}>Required Documents/Certificates (Comma Separated)</Text>
                    <TextInput
                        style={styles.input}
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
                            <Text style={styles.label}>Number of Vacancies (Open Positions)</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={formData.vacanciesCount}
                                onChangeText={(val) => updateForm('vacanciesCount', val)}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2026-10-31"
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

                    <Text style={styles.label}>Posting Status</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ACTIVE / DRAFT"
                        value={formData.status}
                        onChangeText={(val) => updateForm('status', val)}
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
