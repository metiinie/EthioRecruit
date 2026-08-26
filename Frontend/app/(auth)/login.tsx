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
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [phone, setPhone] = useState('');
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
        if (!phone.trim() || !password) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const formattedPhone = sanitizePhone(phone);
            const response = await authService.login({ phone: formattedPhone, password });
            setAuth(response.data.user, response.data.token);
            router.replace('/(tabs)');
        } catch (error: any) {
            const msg = getErrorMessage(error);
            Alert.alert('Login Failed', msg);
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
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>

                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.prefix}>+251</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="912345678"
                                placeholderTextColor={Colors.gray500}
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>
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
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={22}
                                    color={Colors.gray400}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkRow}
                        onPress={() => router.push('/(auth)/register')}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account?{' '}
                            <Text style={styles.linkAccent}>Create one</Text>
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
    prefix: { color: Colors.gray400, fontSize: 16, marginRight: 8, fontWeight: '600' },
    input: { flex: 1, color: Colors.white, fontSize: 16 },
    button: {
        backgroundColor: Colors.accent,
        paddingVertical: 18,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
    linkRow: { alignItems: 'center', paddingTop: Spacing.md },
    linkText: { color: Colors.gray400, fontSize: 14 },
    linkAccent: { color: Colors.accent, fontWeight: '600' },
});
