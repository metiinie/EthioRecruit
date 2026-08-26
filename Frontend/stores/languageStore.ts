import { create } from 'zustand';

export type LanguageCode = 'en' | 'am' | 'ar' | 'om' | 'ti';

export interface LanguageOption {
    code: LanguageCode;
    name: string;
    nativeName: string;
    flag: string;
    isSupported: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', isSupported: true },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', isSupported: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isSupported: true },
    { code: 'om', name: 'Afaan Oromoo', nativeName: 'Oromiffa', flag: '🇪🇹', isSupported: false },
    { code: 'ti', name: 'Tigrigna', nativeName: 'ትግርኛ', flag: '🇪🇹', isSupported: false },
];

interface LanguageState {
    currentLanguage: LanguageCode;
    setLanguage: (code: LanguageCode) => void;
    getCurrentLanguageOption: () => LanguageOption;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
    currentLanguage: 'en',
    setLanguage: (code: LanguageCode) => set({ currentLanguage: code }),
    getCurrentLanguageOption: () => {
        const lang = get().currentLanguage;
        return SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
    },
}));
