import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Logo Area */}
            <View style={styles.logoArea}>
                <View style={styles.logoCircle}>
                    <Ionicons name="briefcase" size={48} color={Colors.accent} />
                </View>
                <Text style={styles.appName}>EthioHire</Text>
                <Text style={styles.tagline}>
                    Your gateway to verified overseas employment
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonArea}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/(auth)/register')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/(auth)/login')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.secondaryButtonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.push('/(auth)/admin-login')}
                    activeOpacity={0.6}
                >
                    <Ionicons name="shield-checkmark" size={16} color={Colors.gray400} />
                    <Text style={styles.linkText}>Agency Admin Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: 120,
        paddingBottom: 60,
    },
    logoArea: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    appName: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: Colors.gray400,
        textAlign: 'center',
        marginTop: Spacing.sm,
        lineHeight: 24,
    },
    buttonArea: {
        gap: Spacing.md,
    },
    primaryButton: {
        backgroundColor: Colors.accent,
        paddingVertical: 18,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 18,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.gray600,
    },
    secondaryButtonText: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: '600',
    },
    linkButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingTop: Spacing.md,
    },
    linkText: {
        color: Colors.gray400,
        fontSize: 14,
    },
});
