"use client";

import { isValidVideoUrl, getVideoPlatform } from "@/utils/validate-video-url";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface VideoThumbnailProps {
    url: string;
    className?: string;
    alt?: string;
}

/**
 * VideoThumbnail component that displays a thumbnail image for supported video platforms
 * Supports: YouTube, Google Drive, Zoom recording, Loom, and Vimeo
 */
export default function VideoThumbnail({ url, className, alt = "Video thumbnail" }: VideoThumbnailProps) {
    if (!isValidVideoUrl(url)) {
        return (
            <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                <p className="text-grey-500 text-sm">Invalid video URL</p>
            </div>
        );
    }

    const platform = getVideoPlatform(url);
    const thumbnailUrl = getThumbnailUrl(url, platform);

    if (!thumbnailUrl) {
        return (
            <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                <p className="text-grey-500 text-sm">Thumbnail not available</p>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden rounded-lg", className)}>
            <Image
                src={thumbnailUrl}
                alt={alt}
                fill
                className="object-cover"
                unoptimized
                onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23ddd" width="400" height="225"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EVideo Thumbnail%3C/text%3E%3C/svg%3E';
                }}
            />
        </div>
    );
}

/**
 * Gets the thumbnail URL for a video based on its platform
 */
function getThumbnailUrl(url: string, platform: string | null): string | null {
    if (!platform) {
        return null;
    }

    switch (platform) {
        case 'youtube':
            return getYouTubeThumbnail(url);
        case 'vimeo':
            return getVimeoThumbnail(url);
        case 'loom':
            return getLoomThumbnail(url);
        case 'google-drive':
        case 'zoom':
            // These platforms don't have reliable direct thumbnail URLs
            return null;
        default:
            return null;
    }
}

/**
 * Extracts YouTube video ID and returns thumbnail URL
 */
function getYouTubeThumbnail(url: string): string | null {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) {
        return null;
    }
    // Try maxresdefault first (highest quality), fallback to hqdefault
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
function getYouTubeVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        // youtu.be format: https://youtu.be/VIDEO_ID
        if (hostname.includes('youtu.be')) {
            return urlObj.pathname.slice(1);
        }

        // youtube.com format: https://www.youtube.com/watch?v=VIDEO_ID
        if (hostname.includes('youtube.com')) {
            // Check for watch?v= format
            const vParam = urlObj.searchParams.get('v');
            if (vParam) {
                return vParam;
            }

            // Check for embed format: /embed/VIDEO_ID
            const embedMatch = urlObj.pathname.match(/\/embed\/([^/?]+)/);
            if (embedMatch) {
                return embedMatch[1];
            }

            // Check for /v/ format: /v/VIDEO_ID
            const vMatch = urlObj.pathname.match(/\/v\/([^/?]+)/);
            if (vMatch) {
                return vMatch[1];
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Extracts Vimeo video ID and returns thumbnail URL
 * Note: Vimeo thumbnails require API call, but we can use a placeholder pattern
 * For production, you might want to use Vimeo's oEmbed API
 */
function getVimeoThumbnail(url: string): string | null {
    const videoId = getVimeoVideoId(url);
    if (!videoId) {
        return null;
    }
    // Vimeo doesn't provide direct thumbnail URLs without API call
    // Using oEmbed endpoint to get thumbnail
    return `https://vumbnail.com/${videoId}.jpg`;
}

/**
 * Extracts Vimeo video ID from URL
 */
function getVimeoVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        let videoId: string | null = null;

        // Extract video ID from Vimeo URL
        // Format: https://vimeo.com/VIDEO_ID or https://player.vimeo.com/video/VIDEO_ID
        if (urlObj.hostname.includes('player.vimeo.com')) {
            const videoMatch = urlObj.pathname.match(/\/video\/(\d+)/);
            if (videoMatch) {
                videoId = videoMatch[1];
            }
        } else {
            // Regular vimeo.com format: /VIDEO_ID
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0 && /^\d+$/.test(pathParts[pathParts.length - 1])) {
                videoId = pathParts[pathParts.length - 1];
            }
        }

        return videoId;
    } catch (error) {
        return null;
    }
}

/**
 * Extracts Loom video ID and returns thumbnail URL
 */
function getLoomThumbnail(url: string): string | null {
    const videoId = getLoomVideoId(url);
    if (!videoId) {
        return null;
    }
    // Loom provides thumbnail URLs in this format
    return `https://cdn.loom.com/sessions/thumbnails/${videoId}-0000000-0000-0000-0000-000000000000-0000000-0000-0000-0000-000000000000-small.gif`;
}

/**
 * Extracts Loom video ID from URL
 */
function getLoomVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        let videoId: string | null = null;

        // Extract video ID from Loom URL
        // Format: https://www.loom.com/share/VIDEO_ID
        const shareMatch = urlObj.pathname.match(/\/share\/([^/?]+)/);
        if (shareMatch) {
            videoId = shareMatch[1];
        } else {
            // Try direct video ID in path
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
                videoId = pathParts[pathParts.length - 1];
            }
        }

        return videoId;
    } catch (error) {
        return null;
    }
}
