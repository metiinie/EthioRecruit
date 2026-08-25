import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';

export default function ModeSelectScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const setMode = useAuthStore((s) => s.setMode);
    const [selected, setSelected] = useState<'JOB_SEEKER' | 'EMPLOYER' | null>(null);
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!selected) return;
        setLoading(true);
        try {
            const response = await authService.switchMode(selected);
            setAuth(response.data.user, response.data.token);
            router.replace('/(tabs)');
        } catch {
            // Fallback: set mode locally
            setMode(selected);
            router.replace('/(tabs)');
        } finally {
            setLoading(false);
        }
    };

    const modes = [
        {
            key: 'JOB_SEEKER' as const,
            icon: 'search' as const,
            title: "I'm looking for work",
            desc: 'Browse overseas job opportunities',
        },
        {
            key: 'EMPLOYER' as const,
            icon: 'people' as const,
            title: "I'm hiring",
            desc: 'Find verified workers for your needs',
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>How will you use EthioHire?</Text>
            <Text style={styles.subtitle}>You can switch anytime from settings</Text>

            <View style={styles.cards}>
                {modes.map((mode) => (
                    <TouchableOpacity
                        key={mode.key}
                        style={[
                            styles.card,
                            selected === mode.key && styles.cardSelected,
                        ]}
                        onPress={() => setSelected(mode.key)}
                        activeOpacity={0.8}
                    >
                        <View
                            style={[
                                styles.iconCircle,
                                selected === mode.key && styles.iconCircleSelected,
                            ]}
                        >
                            <Ionicons
                                name={mode.icon}
                                size={32}
                                color={selected === mode.key ? Colors.white : Colors.accent}
                            />
                        </View>
                        <Text style={styles.cardTitle}>{mode.title}</Text>
                        <Text style={styles.cardDesc}>{mode.desc}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.button, !selected && styles.buttonDisabled]}
                onPress={handleContinue}
                disabled={!selected || loading}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Setting up...' : 'Continue'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingTop: 100,
    },
    title: { fontSize: 26, fontWeight: '800', color: Colors.white, textAlign: 'center' },
    subtitle: { fontSize: 14, color: Colors.gray400, textAlign: 'center', marginTop: 8 },
    cards: { gap: Spacing.md, marginTop: Spacing.xxl },
    card: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.gray700,
    },
    cardSelected: {
        borderColor: Colors.accent,
        backgroundColor: '#0D2F2A',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1.5,
        borderColor: Colors.gray700,
    },
    iconCircleSelected: {
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.white },
    cardDesc: { fontSize: 14, color: Colors.gray400, marginTop: 4, textAlign: 'center' },
    button: {
        backgroundColor: Colors.accent,
        paddingVertical: 18,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    buttonDisabled: { opacity: 0.4 },
    buttonText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
});
