import { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../constants';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function OtpScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ phone: string; devOtp?: string }>();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [devOtp, setDevOtp] = useState<string | undefined>(params.devOtp);
    const inputs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (newCode.every((d) => d.length === 1)) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otp?: string) => {
        const otpCode = otp || code.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.verifyOtp(params.phone!, otpCode);
            setAuth(response.data.user, response.data.token);
            router.replace('/(auth)/mode-select');
        } catch (error: any) {
            const msg = getErrorMessage(error);
            Alert.alert('Verification Failed', msg);
            setCode(['', '', '', '', '', '']);
            inputs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            const res = await authService.sendOtp(params.phone!);
            if (res.data?.devOtp) {
                setDevOtp(res.data.devOtp);
            }
            setCountdown(60);
            Alert.alert('Success', 'OTP resent successfully');
        } catch (error: any) {
            const msg = getErrorMessage(error);
            Alert.alert('Resend Failed', msg);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(auth)/register');
                    }
                }}
            >
                <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.iconCircle}>
                <Ionicons name="mail-open" size={36} color={Colors.accent} />
            </View>

            <Text style={styles.title}>Verify your phone</Text>
            <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.phone}>{params.phone}</Text>
            </Text>

            {devOtp ? (
                <View style={styles.devBox}>
                    <Ionicons name="key-outline" size={16} color={Colors.accent} />
                    <Text style={styles.devBoxText}>Dev Code: <Text style={styles.devCodeHighlight}>{devOtp}</Text></Text>
                </View>
            ) : null}

            <View style={styles.codeRow}>
                {code.map((digit, i) => (
                    <TextInput
                        key={i}
                        ref={(ref) => (inputs.current[i] = ref)}
                        style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
                        value={digit}
                        onChangeText={(text) => handleChange(text, i)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                        keyboardType="number-pad"
                        maxLength={1}
                        autoFocus={i === 0}
                    />
                ))}
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => handleVerify()}
                disabled={loading}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.resendRow}
                onPress={handleResend}
                disabled={countdown > 0}
            >
                <Text style={styles.resendText}>
                    {countdown > 0
                        ? `Resend code in ${countdown}s`
                        : 'Resend code'}
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
        paddingTop: 60,
    },
    backButton: { marginBottom: Spacing.xl },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryLight,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    title: { fontSize: 26, fontWeight: '800', color: Colors.white, textAlign: 'center' },
    subtitle: { fontSize: 15, color: Colors.gray400, textAlign: 'center', marginTop: 8, lineHeight: 22 },
    phone: { color: Colors.accent, fontWeight: '700' },
    devBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: Colors.primaryLight,
        borderColor: Colors.accent,
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'center',
        marginTop: 14,
    },
    devBoxText: { color: Colors.gray300, fontSize: 14 },
    devCodeHighlight: { color: Colors.accent, fontWeight: '800', fontSize: 16, letterSpacing: 1 },
    codeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    codeInput: {
        width: 48,
        height: 56,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.primaryLight,
        borderWidth: 1.5,
        borderColor: Colors.gray700,
        color: Colors.white,
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
    },
    codeInputFilled: { borderColor: Colors.accent },
    button: {
        backgroundColor: Colors.accent,
        paddingVertical: 18,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: Colors.white, fontSize: 17, fontWeight: '700' },
    resendRow: { alignItems: 'center', paddingTop: Spacing.lg },
    resendText: { color: Colors.gray400, fontSize: 14 },
});
