import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { adminAuthService } from '../../services/authService';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import { getErrorMessage } from '../../services/api';

export default function AdminLoginScreen() {
    const router = useRouter();
    const setAdminAuth = useAdminAuthStore((s) => s.setAdminAuth);

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const sanitizePhone = (raw: string): string => {
        let digits = raw.replace(/\D/g, '');
        if (digits.startsWith('251')) {
            digits = digits.slice(3);
        }
        digits = digits.replace(/^0+/, '');
        return `+251${digits}`;
    };

    const handleLogin = async () => {
        if (!identifier.trim() || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const isEmail = identifier.includes('@');
            const payload: any = { password };
            if (isEmail) {
                payload.email = identifier.trim().toLowerCase();
                payload.identifier = identifier.trim().toLowerCase();
            } else {
                const formattedPhone = sanitizePhone(identifier);
                payload.phone = formattedPhone;
                payload.identifier = formattedPhone;
            }

            const response = await adminAuthService.login(payload);
            setAdminAuth(response.data.admin, response.data.token);
            router.replace('/(admin)');
        } catch (error: any) {
            const msg = getErrorMessage(error);
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/(auth)/welcome');
                        }
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.badge}>
                    <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
                    <Text style={styles.badgeText}>Agency Admin</Text>
                </View>

                <Text style={styles.title}>Admin Login</Text>
                <Text style={styles.subtitle}>Access your agency dashboard</Text>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email or Phone Number</Text>
                        <TextInput
                            style={styles.inputFull}
                            placeholder="admin@agency.com or 0921283801"
                            placeholderTextColor={Colors.gray500}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={identifier}
                            onChangeText={setIdentifier}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter password"
                                placeholderTextColor={Colors.gray500}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={Colors.gray400} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="log-in" size={20} color={Colors.white} />
                        <Text style={styles.buttonText}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.primary },
    scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: 40 },
    backButton: { marginBottom: Spacing.xl },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.accent,
        marginBottom: Spacing.md,
    },
    badgeText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
    title: { fontSize: 30, fontWeight: '800', color: Colors.white },
    subtitle: { fontSize: 16, color: Colors.gray400, marginTop: 6, marginBottom: Spacing.xl },
    form: { gap: Spacing.lg },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: Colors.gray300 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 56,
        borderWidth: 1,
        borderColor: Colors.gray700,
    },
    input: { color: Colors.white, fontSize: 16 },
    inputFull: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 56,
        color: Colors.white,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.gray700,
    },
    button: {
        backgroundColor: Colors.accent,
        paddingVertical: 18,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: Spacing.sm,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
});
