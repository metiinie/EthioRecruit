import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { savedService } from '../../services/savedService';
import { ContactUsButton } from '../../components/ContactAgencyModal';

export default function SavedVacanciesScreen() {
    const router = useRouter();
    const [savedList, setSavedList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSavedVacancies();
    }, []);

    const loadSavedVacancies = async () => {
        setLoading(true);
        try {
            const res = await savedService.getSavedVacancies();
            setSavedList(res.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load saved vacancies');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (vacancyId: string) => {
        try {
            await savedService.unsaveVacancy(vacancyId);
            setSavedList((prev) => prev.filter((item) => item.vacancyId !== vacancyId));
        } catch (error) {
            Alert.alert('Error', 'Failed to remove vacancy');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1A365D" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Saved Vacancies' }} />

            {savedList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bookmark-outline" size={64} color="#CBD5E0" />
                    <Text style={styles.emptyTitle}>No Saved Vacancies</Text>
                    <Text style={styles.emptySub}>Bookmark job vacancies to apply or review them later.</Text>
                </View>
            ) : (
                <FlatList
                    data={savedList}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        const vacancy = item.vacancy;
                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => router.push(`/vacancy/${vacancy.id}`)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>{vacancy?.title}</Text>
                                    <Text style={styles.salary}>
                                        {vacancy?.salaryMin ? `${vacancy.salaryMin} - ${vacancy.salaryMax} ${vacancy.currency || 'SAR'}` : 'Competitive Salary'}
                                    </Text>
                                    <Text style={styles.subText}>{vacancy?.country || 'Saudi Arabia'} • {vacancy?.agency?.name || 'Agency'}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <ContactUsButton
                                        agency={vacancy?.agency}
                                        topicName={vacancy?.title}
                                        label="Contact Us"
                                        compact
                                    />

                                    <TouchableOpacity
                                        onPress={() => handleUnsave(vacancy.id)}
                                        style={{ padding: 6 }}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#E53E3E" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7FAFC' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A5568', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', marginTop: 8 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    title: { fontSize: 16, fontWeight: 'bold', color: '#1A365D' },
    salary: { fontSize: 14, fontWeight: '600', color: '#2B6CB0', marginTop: 4 },
    subText: { fontSize: 12, color: '#A0AEC0', marginTop: 4 },
});
