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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { vacancyService } from '../../../services/vacancyService';

export default function NewVacancyScreen() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('housemaid');
    const [description, setDescription] = useState('');
    const [country, setCountry] = useState('Saudi Arabia');
    const [salaryMin, setSalaryMin] = useState('1500');
    const [salaryMax, setSalaryMax] = useState('2000');
    const [currency, setCurrency] = useState('SAR');
    const [experienceRequired, setExperienceRequired] = useState('1');
    const [requirementsInput, setRequirementsInput] = useState('Housekeeping, Cooking, Basic Arabic');

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Required Fields', 'Vacancy title and description are required.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title,
                categoryId,
                description,
                country,
                salaryMin: parseInt(salaryMin, 10) || 1500,
                salaryMax: parseInt(salaryMax, 10) || 2000,
                currency,
                experienceRequired: parseInt(experienceRequired, 10) || 1,
                requirements: requirementsInput.split(',').map((r) => r.trim()).filter(Boolean),
                status: 'ACTIVE',
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
            <Stack.Screen options={{ title: 'Post New Vacancy' }} />

            <View style={styles.card}>
                <Text style={styles.label}>Vacancy Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Experienced Housemaid - Riyadh"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Job Category ID</Text>
                <TextInput
                    style={styles.input}
                    value={categoryId}
                    onChangeText={setCategoryId}
                />

                <Text style={styles.label}>Job Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    placeholder="Describe duties, working hours, and benefits..."
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Destination Country</Text>
                <TextInput
                    style={styles.input}
                    value={country}
                    onChangeText={setCountry}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 6 }}>
                        <Text style={styles.label}>Salary Min</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={salaryMin}
                            onChangeText={setSalaryMin}
                        />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 6 }}>
                        <Text style={styles.label}>Salary Max</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={salaryMax}
                            onChangeText={setSalaryMax}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 6 }}>
                        <Text style={styles.label}>Currency</Text>
                        <TextInput
                            style={styles.input}
                            value={currency}
                            onChangeText={setCurrency}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Experience Required (Years)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={experienceRequired}
                    onChangeText={setExperienceRequired}
                />

                <Text style={styles.label}>Key Requirements (Comma Separated)</Text>
                <TextInput
                    style={styles.input}
                    value={requirementsInput}
                    onChangeText={setRequirementsInput}
                />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Text style={styles.submitBtnText}>Post Vacancy</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, elevation: 2 },
    label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginTop: 12, marginBottom: 4 },
    input: { backgroundColor: '#EDF2F7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#2D3748', fontSize: 14 },
    textArea: { height: 90, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    submitBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 8, backgroundColor: '#D69E2E', alignItems: 'center' },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
