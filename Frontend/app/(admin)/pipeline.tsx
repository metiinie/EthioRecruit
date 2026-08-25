import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../constants';

export default function AdminPipelineScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pipeline</Text>
            </View>
            <View style={styles.emptyState}>
                <Ionicons name="git-branch-outline" size={56} color={Colors.gray500} />
                <Text style={styles.emptyTitle}>No active pipelines</Text>
                <Text style={styles.emptyDesc}>Track candidates through the hiring process</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    header: { paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
    title: { fontSize: 26, fontWeight: '800', color: Colors.white },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray400 },
    emptyDesc: { fontSize: 14, color: Colors.gray500 },
});
