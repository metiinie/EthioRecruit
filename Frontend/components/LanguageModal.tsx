import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../constants';
import {
    useLanguageStore,
    SUPPORTED_LANGUAGES,
    LanguageCode,
} from '../stores/languageStore';

interface LanguageModalProps {
    visible: boolean;
    onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose }) => {
    const { currentLanguage, setLanguage } = useLanguageStore();

    const handleSelect = (code: LanguageCode, isSupported: boolean) => {
        if (!isSupported) {
            // Keep UI select or show informative toast
            setLanguage(code);
        } else {
            setLanguage(code);
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {/* Modal Header */}
                            <View style={styles.header}>
                                <View style={styles.headerTitleRow}>
                                    <Ionicons name="globe-outline" size={22} color={Colors.accent} />
                                    <Text style={styles.title}>Select Language / ቋንቋ</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <Ionicons name="close" size={20} color={Colors.gray500} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.subtitle}>
                                Choose your preferred language for the interface
                            </Text>

                            {/* Options List */}
                            <View style={styles.list}>
                                {SUPPORTED_LANGUAGES.map((lang) => {
                                    const isSelected = currentLanguage === lang.code;

                                    return (
                                        <TouchableOpacity
                                            key={lang.code}
                                            style={[
                                                styles.optionCard,
                                                isSelected && styles.optionCardSelected,
                                            ]}
                                            onPress={() => handleSelect(lang.code, lang.isSupported)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.optionLeft}>
                                                <Text style={styles.flag}>{lang.flag}</Text>
                                                <View>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Text style={styles.langName}>{lang.name}</Text>
                                                        {!lang.isSupported && (
                                                            <View style={styles.badgeComingSoon}>
                                                                <Text style={styles.badgeText}>Preview</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text style={styles.nativeName}>{lang.nativeName}</Text>
                                                </View>
                                            </View>

                                            {isSelected && (
                                                <View style={styles.checkCircle}>
                                                    <Ionicons name="checkmark" size={16} color={Colors.white} />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.gray900,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.gray500,
        marginBottom: Spacing.md,
    },
    closeBtn: {
        padding: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray100,
    },
    list: {
        gap: 10,
    },
    optionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.gray50,
        borderWidth: 1.5,
        borderColor: Colors.gray200,
    },
    optionCardSelected: {
        backgroundColor: Colors.accent + '10',
        borderColor: Colors.accent,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flag: {
        fontSize: 26,
    },
    langName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.gray900,
    },
    nativeName: {
        fontSize: 12,
        color: Colors.gray500,
        marginTop: 2,
    },
    badgeComingSoon: {
        backgroundColor: Colors.warning + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.warning,
    },
    checkCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
