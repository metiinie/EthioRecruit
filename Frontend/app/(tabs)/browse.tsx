import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { useAuthStore } from '../../stores/authStore';

export default function BrowseScreen() {
    const mode = useAuthStore((s) => s.mode);
    const isJobSeeker = mode === 'JOB_SEEKER';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isJobSeeker ? 'Browse Jobs' : 'Browse Candidates'}
                </Text>
            </View>

            <View style={styles.emptyState}>
                <Ionicons
                    name={isJobSeeker ? 'briefcase-outline' : 'people-outline'}
                    size={56}
                    color={Colors.gray300}
                />
                <Text style={styles.emptyTitle}>
                    {isJobSeeker ? 'No vacancies yet' : 'No candidates yet'}
                </Text>
                <Text style={styles.emptyDesc}>
                    {isJobSeeker
                        ? 'Job listings from agencies will appear here'
                        : 'Worker profiles from agencies will appear here'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
    title: { fontSize: 26, fontWeight: '800', color: Colors.gray900 },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray600 },
    emptyDesc: { fontSize: 14, color: Colors.gray400, textAlign: 'center', lineHeight: 22 },
});
