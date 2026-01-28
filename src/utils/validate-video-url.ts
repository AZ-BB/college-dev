/**
 * Validates if a URL is from a supported video platform
 * Supports: YouTube, Google Drive, Zoom recording, Loom, or Vimeo
 * 
 * @param url - The URL to validate
 * @returns true if the URL is from a supported platform, false otherwise
 */
export function isValidVideoUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const pathname = urlObj.pathname.toLowerCase();

        // YouTube validation
        // Supports: youtube.com, youtu.be, m.youtube.com, www.youtube.com
        if (
            hostname.includes('youtube.com') ||
            hostname.includes('youtu.be') ||
            hostname.includes('m.youtube.com')
        ) {
            return true;
        }

        // Google Drive validation
        // Supports: drive.google.com with /file/d/ path
        if (hostname.includes('drive.google.com')) {
            // Check if it's a file view URL
            if (pathname.includes('/file/d/') || pathname.includes('/open')) {
                return true;
            }
        }

        // Zoom recording validation
        // Supports: zoom.us recordings
        if (hostname.includes('zoom.us')) {
            // Check if it's a recording URL
            if (pathname.includes('/rec/') || pathname.includes('/recording/')) {
                return true;
            }
        }

        // Loom validation
        // Supports: loom.com
        if (hostname.includes('loom.com')) {
            return true;
        }

        // Vimeo validation
        // Supports: vimeo.com, player.vimeo.com
        if (hostname.includes('vimeo.com')) {
            return true;
        }

        return false;
    } catch (error) {
        // Invalid URL format
        return false;
    }
}

/**
 * Validates if a string is a valid URL
 * 
 * @param url - The URL string to validate
 * @returns true if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    // Trim whitespace
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
        return false;
    }

    try {
        // Try to create a URL object - this will throw if invalid
        const urlObj = new URL(trimmedUrl);
        
        // Check if it has a valid protocol (http, https, etc.)
        const validProtocols = ['http:', 'https:', 'ftp:', 'mailto:'];
        if (!validProtocols.includes(urlObj.protocol.toLowerCase())) {
            return false;
        }

        // Check if it has a hostname
        if (!urlObj.hostname) {
            return false;
        }

        return true;
    } catch (error) {
        // If URL constructor throws, it's invalid
        return false;
    }
}

/**
 * Gets the video platform type from a URL
 * 
 * @param url - The URL to check
 * @returns The platform name or null if not supported
 */
export function getVideoPlatform(url: string): 'youtube' | 'google-drive' | 'zoom' | 'loom' | 'vimeo' | null {
    if (!isValidVideoUrl(url)) {
        return null;
    }

    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            return 'youtube';
        }
        if (hostname.includes('drive.google.com')) {
            return 'google-drive';
        }
        if (hostname.includes('zoom.us')) {
            return 'zoom';
        }
        if (hostname.includes('loom.com')) {
            return 'loom';
        }
        if (hostname.includes('vimeo.com')) {
            return 'vimeo';
        }

        return null;
    } catch (error) {
        return null;
    }
}
