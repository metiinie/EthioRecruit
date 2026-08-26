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

export default function RegisterScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleRegister = async () => {
        if (!firstName.trim() || !lastName.trim() || !phone.trim() || !password) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters');
            return;
        }

        const formattedPhone = sanitizePhone(phone);
        if (!/^\+251[0-9]{9}$/.test(formattedPhone)) {
            Alert.alert(
                'Invalid Phone Number',
                'Please enter a valid 9-digit Ethiopian mobile number (e.g. 912345678 or 712345678)'
            );
            return;
        }

        setLoading(true);
        try {
            const response = await authService.register({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phone: formattedPhone,
                password,
            });
            setAuth(response.data.user, response.data.token);
            router.replace({
                pathname: '/(auth)/otp',
                params: { phone: formattedPhone, devOtp: response.data?.devOtp },
            });
        } catch (error: any) {
            const msg = getErrorMessage(error);
            Alert.alert('Registration Failed', msg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>

                <Text style={styles.title}>Create account</Text>
                <Text style={styles.subtitle}>Join EthioHire today</Text>

                <View style={styles.form}>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="Abebe"
                                placeholderTextColor={Colors.gray500}
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.inputFull}
                                placeholder="Kebede"
                                placeholderTextColor={Colors.gray500}
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

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
                                placeholder="Min. 6 characters"
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Re-enter password"
                            placeholderTextColor={Colors.gray500}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkAccent}>Sign In</Text>
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
    row: { flexDirection: 'row', gap: Spacing.md },
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
        marginTop: Spacing.sm,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
    linkRow: { alignItems: 'center', paddingTop: Spacing.md },
    linkText: { color: Colors.gray400, fontSize: 14 },
    linkAccent: { color: Colors.accent, fontWeight: '600' },
});
