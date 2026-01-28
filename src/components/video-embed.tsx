"use client";

import { isValidVideoUrl, getVideoPlatform } from "@/utils/validate-video-url";
import { cn } from "@/lib/utils";

interface VideoEmbedProps {
    url: string;
    className?: string;
}

/**
 * VideoEmbed component that renders an embed for supported video platforms
 * Supports: YouTube, Google Drive, Zoom recording, Loom, and Vimeo
 */
export default function VideoEmbed({ url, className }: VideoEmbedProps) {
    if (!isValidVideoUrl(url)) {
        return (
            <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                <p className="text-grey-500 text-sm">Invalid video URL</p>
            </div>
        );
    }

    const platform = getVideoPlatform(url);

    switch (platform) {
        case 'youtube':
            return <YouTubeEmbed url={url} className={className} />;
        case 'google-drive':
            return <GoogleDriveEmbed url={url} className={className} />;
        case 'zoom':
            return <ZoomEmbed url={url} className={className} />;
        case 'loom':
            return <LoomEmbed url={url} className={className} />;
        case 'vimeo':
            return <VimeoEmbed url={url} className={className} />;
        default:
            return (
                <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                    <p className="text-grey-500 text-sm">Unsupported video platform</p>
                </div>
            );
    }
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

function YouTubeEmbed({ url, className }: { url: string; className?: string }) {
    const videoId = getYouTubeVideoId(url);
    
    if (!videoId) {
        return (
            <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                <p className="text-grey-500 text-sm">Invalid YouTube URL</p>
            </div>
        );
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
        <div className={cn("relative w-full", className)}>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video player"
                />
            </div>
        </div>
    );
}

function GoogleDriveEmbed({ url, className }: { url: string; className?: string }) {
    try {
        const urlObj = new URL(url);
        let fileId: string | null = null;

        // Extract file ID from /file/d/FILE_ID/view format
        const fileMatch = urlObj.pathname.match(/\/file\/d\/([^/]+)/);
        if (fileMatch) {
            fileId = fileMatch[1];
        } else {
            // Try /open?id=FILE_ID format
            fileId = urlObj.searchParams.get('id');
        }

        if (!fileId) {
            return (
                <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                    <p className="text-grey-500 text-sm">Invalid Google Drive URL</p>
                </div>
            );
        }

        const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

        return (
            <div className={cn("relative w-full", className)}>
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                    <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay"
                        title="Google Drive video player"
                    />
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                <p className="text-grey-500 text-sm">Invalid Google Drive URL</p>
            </div>
        );
    }
}

function ZoomEmbed({ url, className }: { url: string; className?: string }) {
    // Zoom recordings are typically accessed via iframe
    // The URL structure varies, so we'll use the URL directly
    return (
        <div className={cn("relative w-full", className)}>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe
                    src={url}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="autoplay; fullscreen"
                    title="Zoom recording player"
                />
            </div>
        </div>
    );
}

function LoomEmbed({ url, className }: { url: string; className?: string }) {
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

        if (!videoId) {
            return (
                <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                    <p className="text-grey-500 text-sm">Invalid Loom URL</p>
                </div>
            );
        }

        const embedUrl = `https://www.loom.com/embed/${videoId}`;

        return (
            <div className={cn("relative w-full", className)}>
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                    <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay; fullscreen"
                        title="Loom video player"
                    />
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                <p className="text-grey-500 text-sm">Invalid Loom URL</p>
            </div>
        );
    }
}

function VimeoEmbed({ url, className }: { url: string; className?: string }) {
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

        if (!videoId) {
            return (
                <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                    <p className="text-grey-500 text-sm">Invalid Vimeo URL</p>
                </div>
            );
        }

        const embedUrl = `https://player.vimeo.com/video/${videoId}`;

        return (
            <div className={cn("relative w-full", className)}>
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                    <iframe
                        src={embedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        title="Vimeo video player"
                    />
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className={cn("flex items-center justify-center p-4 bg-grey-200 rounded-lg", className)}>
                <p className="text-grey-500 text-sm">Invalid Vimeo URL</p>
            </div>
        );
    }
}
