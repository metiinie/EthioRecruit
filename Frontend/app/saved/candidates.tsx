import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { savedService } from '../../services/savedService';

export default function SavedCandidatesScreen() {
    const router = useRouter();
    const [savedList, setSavedList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSavedCandidates();
    }, []);

    const loadSavedCandidates = async () => {
        setLoading(true);
        try {
            const res = await savedService.getSavedCandidates();
            setSavedList(res.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load saved candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = async (candidateId: string) => {
        try {
            await savedService.unsaveCandidate(candidateId);
            setSavedList((prev) => prev.filter((item) => item.candidateId !== candidateId));
        } catch (error) {
            Alert.alert('Error', 'Failed to remove candidate');
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
            <Stack.Screen options={{ title: 'Saved Candidates' }} />

            {savedList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bookmark-outline" size={64} color="#CBD5E0" />
                    <Text style={styles.emptyTitle}>No Saved Candidates</Text>
                    <Text style={styles.emptySub}>Bookmark candidates from the Browse tab to review them later.</Text>
                </View>
            ) : (
                <FlatList
                    data={savedList}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        const candidate = item.candidate;
                        return (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => router.push(`/candidate/${candidate.id}`)}
                            >
                                <Image
                                    source={{
                                        uri: candidate?.photoUrl || 'https://via.placeholder.com/150.png?text=Photo',
                                    }}
                                    style={styles.avatar}
                                />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.name}>
                                        {candidate?.firstName} {candidate?.lastName}
                                    </Text>
                                    <Text style={styles.category}>{candidate?.category?.name || 'Domestic Worker'}</Text>
                                    <Text style={styles.subText}>{candidate?.currentCountry || 'Ethiopia'} • {candidate?.experienceYears ? `${candidate.experienceYears} yrs exp` : 'Fresh'}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleUnsave(candidate.id)}
                                    style={{ padding: 8 }}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#E53E3E" />
                                </TouchableOpacity>
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
    avatar: { width: 54, height: 54, borderRadius: 27 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#1A365D' },
    category: { fontSize: 13, color: '#718096', marginTop: 2 },
    subText: { fontSize: 12, color: '#A0AEC0', marginTop: 4 },
});
