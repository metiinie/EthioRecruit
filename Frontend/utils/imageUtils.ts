import { Platform } from 'react-native';

/**
 * Validates and cleans image URIs for cross-platform support (Web & Mobile).
 * On Web, file:// URIs (from mobile local pickers) are blocked by browser security.
 */
export function getValidImageUri(url?: string | null): string | null {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Web browsers disallow file:// URIs due to security policy ("Not allowed to load local resource")
    if (Platform.OS === 'web' && trimmed.startsWith('file://')) {
        return null;
    }

    return trimmed;
}
