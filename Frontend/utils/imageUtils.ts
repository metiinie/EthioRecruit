import { Platform } from 'react-native';
import { getDynamicBaseUrl } from '../services/api';

/**
 * Validates and cleans image URIs for cross-platform support (Web & Mobile).
 * Resolves relative server upload paths (e.g., /uploads/...) to full backend URLs.
 */
export function getValidImageUri(url?: string | null): string | null {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Web disallows file:// URIs due to browser security policies ("Not allowed to load local resource")
    if (Platform.OS === 'web' && trimmed.startsWith('file://')) {
        return null;
    }

    // Relative backend uploads path (e.g. /uploads/c-123.jpg or uploads/c-123.jpg)
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
        const apiBaseUrl = getDynamicBaseUrl();
        // Remove trailing /v1 to target root static server uploads folder
        const origin = apiBaseUrl.replace(/\/v1\/?$/, '');
        const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return `${origin}${cleanPath}`;
    }

    return trimmed;
}

/**
 * Multi-photo avatar fallback helper:
 * Returns the first valid candidate photo URL from photoUrl, fullBodyPhotoUrl, galleryPhotos, or document copies.
 */
export function getBestCandidateAvatar(candidate: any): string | null {
    if (!candidate) return null;

    // 1. Dedicated headshot profile photo
    const profileUri = getValidImageUri(candidate.photoUrl);
    if (profileUri) return profileUri;

    // 2. Full body photo
    const fullBodyUri = getValidImageUri(candidate.fullBodyPhotoUrl);
    if (fullBodyUri) return fullBodyUri;

    // 3. Gallery photos array
    if (Array.isArray(candidate.galleryPhotos) && candidate.galleryPhotos.length > 0) {
        for (const gUrl of candidate.galleryPhotos) {
            const gUri = getValidImageUri(gUrl);
            if (gUri) return gUri;
        }
    }

    // 4. Passport / Document copy fallback
    const passportUri = getValidImageUri(candidate.passportCopyUrl);
    if (passportUri) return passportUri;

    const medicalUri = getValidImageUri(candidate.medicalCertUrl);
    if (medicalUri) return medicalUri;

    const cocUri = getValidImageUri(candidate.cocCertUrl);
    if (cocUri) return cocUri;

    return null;
}
