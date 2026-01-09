"use client"
import UploadIcon from "@/components/icons/upload";
import { Tables } from "@/database.types";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { addVideoMedia } from "@/action/community_media";
import { Fragment } from 'react'

export default function CommunityMedia({
    media,
    deleteMedia,
    slug
}: {
    media: Tables<"community_gallery_media">[]
    deleteMedia: (mediaId: number, mediaUrl: string, type: 'image' | string) => Promise<void>
    slug: string
}) {

    const [selectedMedia, setSelectedMedia] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"image" | "video">("image");
    const [videoType, setVideoType] = useState<"loom" | "youtube" | "vimeo">("youtube");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoUrlError, setVideoUrlError] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleDeleteMedia(mediaId: number, mediaUrl: string, type: 'image' | string) {
        deleteMedia(mediaId, mediaUrl, type);
        if (selectedMedia === media.findIndex((item) => item.id === mediaId)) {
            setSelectedMedia(0);
        }
    }

    // Helper function to convert YouTube URL to embed URL
    const getYouTubeEmbedUrl = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    // Helper function to convert Loom URL to embed URL
    const getLoomEmbedUrl = (url: string): string => {
        // Loom URLs: https://www.loom.com/share/{videoId} or https://loom.com/share/{videoId}
        const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
        const videoId = match ? match[1] : null;
        return videoId ? `https://www.loom.com/embed/${videoId}` : url;
    };

    // Helper function to convert Vimeo URL to embed URL
    const getVimeoEmbedUrl = (url: string): string => {
        // Vimeo URLs: https://vimeo.com/{videoId} or https://player.vimeo.com/video/{videoId}
        const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        const videoId = match ? match[1] : null;
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    };

    // Helper function to get YouTube video ID
    const getYouTubeVideoId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    // Helper function to get YouTube thumbnail URL
    const getYouTubeThumbnail = (url: string): string => {
        const videoId = getYouTubeVideoId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
    };

    // Helper function to get Vimeo video ID
    const getVimeoVideoId = (url: string): string | null => {
        const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        return match ? match[1] : null;
    };

    // Validation functions
    const isValidYouTubeUrl = (url: string): boolean => {
        if (!url.trim()) return false;
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        return youtubeRegex.test(url) && getYouTubeVideoId(url) !== null;
    };

    const isValidLoomUrl = (url: string): boolean => {
        if (!url.trim()) return false;
        const loomRegex = /^(https?:\/\/)?(www\.)?loom\.com\/share\/[a-zA-Z0-9]+/;
        return loomRegex.test(url);
    };

    const isValidVimeoUrl = (url: string): boolean => {
        if (!url.trim()) return false;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/(\d+)/;
        return vimeoRegex.test(url) && getVimeoVideoId(url) !== null;
    };

    const validateVideoUrl = (url: string, type: "youtube" | "loom" | "vimeo"): string => {
        if (!url.trim()) {
            return "";
        }
        if (type === "youtube" && !isValidYouTubeUrl(url)) {
            return "Please enter a valid YouTube URL";
        }
        if (type === "loom" && !isValidLoomUrl(url)) {
            return "Please enter a valid Loom URL";
        }
        if (type === "vimeo" && !isValidVimeoUrl(url)) {
            return "Please enter a valid Vimeo URL";
        }
        return "";
    };

    return (
        <div className="space-y-4">
            {
                media.length === 0 && (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-[500px] bg-grey-200 rounded-[12px] flex items-center justify-center gap-2 cursor-pointer hover:bg-grey-300 transition-all duration-300">
                        <UploadIcon className="w-6 h-6 stroke-grey-700" />
                        <span className="font-semibold text-grey-600">
                            Upload videos or images
                        </span>
                    </div>
                )
            }

            {
                media.length > 0 && (
                    <div className="w-full h-[500px] rounded-[12px] overflow-hidden">
                        {media[selectedMedia].type === "image" && (
                            <Image
                                key={media[selectedMedia].id}
                                src={media[selectedMedia].url || ''}
                                width={1440}
                                height={1080}
                                alt=""
                                className="rounded-[12px] w-full h-full object-cover"
                            />
                        )}
                        {media[selectedMedia].type === "youtube" && (
                            <iframe
                                key={media[selectedMedia].id}
                                src={getYouTubeEmbedUrl(media[selectedMedia].url)}
                                className="w-full h-full rounded-[12px]"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="YouTube video player"
                            />
                        )}
                        {media[selectedMedia].type === "loom" && (
                            <iframe
                                key={media[selectedMedia].id}
                                src={getLoomEmbedUrl(media[selectedMedia].url)}
                                className="w-full h-full rounded-[12px]"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Loom video player"
                            />
                        )}
                        {media[selectedMedia].type === "vimeo" && (
                            <iframe
                                key={media[selectedMedia].id}
                                src={getVimeoEmbedUrl(media[selectedMedia].url)}
                                className="w-full h-full rounded-[12px]"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                title="Vimeo video player"
                            />
                        )}
                    </div>
                )
            }

            {/* Gallery Images */}
            <div className="relative flex items-center justify-start gap-2.5">
                {
                    media.map((item, index) => (
                        <Fragment key={item.id}>
                            {
                                item.type === "image" && (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedMedia(index)}
                                        className={cn("relative cursor-pointer group rounded-[14px]", selectedMedia === index ? "border-3 border-orange-500" : 'p-[3px]')}>
                                        <div className="z-10 absolute opacity-0 p-1 group-hover:opacity-100 hover:bg-orange-500 transition-all duration-300 cursor-pointer -top-1 -right-2 bg-white rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0">
                                            <X className="w-4 h-4 hover:text-white text-grey-900" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMedia(item.id, item.url, item.type);
                                            }} />
                                        </div>
                                        <Image
                                            className="w-[80px] h-[80px] object-cover rounded-lg flex items-center justify-center text-white text-xl font-semibold shrink-0"
                                            src={item.url || ''}
                                            alt={`media-${item.id}`}
                                            width={80}
                                            height={80}
                                        />
                                    </div>
                                )
                            }

                            {
                                item.type === "youtube" && (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedMedia(index)}
                                        className={cn("relative cursor-pointer group rounded-[14px]", selectedMedia === index ? "border-3 border-orange-500" : 'p-[3px]')}>
                                        <div className="z-10 absolute opacity-0 p-1 group-hover:opacity-100 hover:bg-orange-500 transition-all duration-300 cursor-pointer -top-1 -right-2 bg-white rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0">
                                            <X className="w-4 h-4 hover:text-white text-grey-900" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMedia(item.id, item.url, item.type);
                                            }} />
                                        </div>
                                        <div className="relative w-[80px] h-[80px] rounded-lg overflow-hidden bg-grey-200">
                                            <Image
                                                className="w-full h-full object-cover"
                                                src={getYouTubeThumbnail(item.url)}
                                                alt={`YouTube video ${item.id}`}
                                                width={80}
                                                height={80}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                item.type === "loom" && (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedMedia(index)}
                                        className={cn("relative cursor-pointer group rounded-[14px]", selectedMedia === index ? "border-3 border-orange-500" : 'p-[3px]')}>
                                        <div className="z-10 absolute opacity-0 p-1 group-hover:opacity-100 hover:bg-orange-500 transition-all duration-300 cursor-pointer -top-1 -right-2 bg-white rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0">
                                            <X className="w-4 h-4 hover:text-white text-grey-900"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMedia(item.id, item.url, item.type);
                                                }} />
                                        </div>
                                        <div className="relative w-[80px] h-[80px] rounded-lg overflow-hidden bg-grey-200 flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500" />
                                            <div className="relative flex items-center justify-center">
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            {
                                item.type === "vimeo" && (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedMedia(index)}
                                        className={cn("relative cursor-pointer group rounded-[14px]", selectedMedia === index ? "border-3 border-orange-500" : 'p-[3px]')}>
                                        <div className="z-10 absolute opacity-0 p-1 group-hover:opacity-100 hover:bg-orange-500 transition-all duration-300 cursor-pointer -top-1 -right-2 bg-white rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0">
                                            <X className="w-4 h-4 hover:text-white text-grey-900" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMedia(item.id, item.url, item.type);
                                            }} />
                                        </div>
                                        <div className="relative w-[80px] h-[80px] rounded-lg overflow-hidden bg-grey-200 flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600" />
                                            <div className="relative flex items-center justify-center">
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </Fragment>
                    ))
                }

                <div
                    onClick={() => setIsModalOpen(true)}
                    className="relative w-[80px] h-[80px] opacity-100 flex items-center justify-center hover:bg-grey-200 transition-all duration-300 rounded-lg cursor-pointer">
                    <svg
                        className="absolute inset-0 w-full h-full"
                        width="80"
                        height="80"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="0.5"
                            y="0.5"
                            width="79"
                            height="79"
                            rx="16"
                            fill="none"
                            stroke="#4B5563a0"
                            strokeWidth="1"
                            strokeDasharray="4, 4"
                        />
                    </svg>
                    <Plus className="text-orange-500 w-6 h-6" />
                </div>

            </div>

            {/* Upload Media Modal */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open);
                if (!open) {
                    // Reset form when modal closes
                    setSelectedFile(null);
                    setVideoUrl("");
                    setVideoUrlError("");
                    setActiveTab("image");
                    setVideoType("youtube");
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Media</DialogTitle>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "image" | "video")} className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value="image" className="flex-1">
                                Image
                            </TabsTrigger>
                            <TabsTrigger value="video" className="flex-1">
                                Video
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="image" className="space-y-4 mt-4 w-full max-w-full">
                            <div className="space-y-3 w-full max-w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        fileInputRef.current?.click();
                                    }}
                                >
                                    Select Image
                                </Button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSelectedFile(file);
                                        }
                                    }}
                                />

                                {/* Image Selected Indicator */}
                                {selectedFile && (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg w-full overflow-hidden">
                                        <div className="shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Check className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0 w-0 overflow-hidden">
                                            <p className="text-sm font-medium text-green-900 truncate whitespace-nowrap overflow-hidden text-ellipsis" title={selectedFile.name}>
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-green-600 truncate whitespace-nowrap overflow-hidden text-ellipsis">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value = '';
                                                }
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="video" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Video Type</label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={videoType === "youtube" ? "default" : "outline"}
                                            className={"flex-1 " + (videoType === 'youtube' ? 'rounded-md' : '')}
                                            onClick={() => {
                                                setVideoType("youtube");
                                                if (videoUrl) {
                                                    const error = validateVideoUrl(videoUrl, "youtube");
                                                    setVideoUrlError(error);
                                                }
                                            }}
                                        >
                                            YouTube
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={videoType === "loom" ? "default" : "outline"}
                                            className={"flex-1 " + (videoType === 'loom' ? 'rounded-md' : '')}
                                            onClick={() => {
                                                setVideoType("loom");
                                                if (videoUrl) {
                                                    const error = validateVideoUrl(videoUrl, "loom");
                                                    setVideoUrlError(error);
                                                }
                                            }}
                                        >
                                            Loom
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={videoType === "vimeo" ? "default" : "outline"}
                                            className={"flex-1 " + (videoType === 'vimeo' ? 'rounded-md' : '')}
                                            onClick={() => {
                                                setVideoType("vimeo");
                                                if (videoUrl) {
                                                    const error = validateVideoUrl(videoUrl, "vimeo");
                                                    setVideoUrlError(error);
                                                }
                                            }}
                                        >
                                            Vimeo
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="video-url" className="text-sm font-medium">
                                        Video URL
                                    </label>
                                    <Input
                                        id="video-url"
                                        type="url"
                                        placeholder={`Enter ${videoType} URL`}
                                        value={videoUrl}
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            setVideoUrl(url);
                                            const error = validateVideoUrl(url, videoType);
                                            setVideoUrlError(error);
                                        }}
                                        className={videoUrlError ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""}
                                    />
                                    {videoUrlError && (
                                        <p className="text-sm text-red-600">{videoUrlError}</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-md"
                            type="button"
                            disabled={isSubmitting || (activeTab === "image" && !selectedFile) || (activeTab === "video" && (!videoUrl || !!videoUrlError))}
                            onClick={async () => {
                                if (activeTab === "image" && selectedFile) {
                                    setIsSubmitting(true);
                                    try {
                                        const formData = new FormData();
                                        formData.append('file', selectedFile);
                                        formData.append('commSlug', slug);

                                        const response = await fetch('/api/commuinty/upload-media', {
                                            method: 'POST',
                                            body: formData,
                                        });

                                        const data = await response.json();

                                        if (!response.ok) {
                                            throw new Error(data.error || 'Failed to upload image');
                                        }

                                        // Reset form and close modal
                                        setSelectedFile(null);
                                        setVideoUrl("");
                                        setIsModalOpen(false);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }

                                        // Reload the page to show the new media
                                        window.location.reload();
                                    } catch (error) {
                                        console.error('Error uploading image:', error);
                                        alert(error instanceof Error ? error.message : 'Failed to upload image');
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                } else if (activeTab === "video" && videoUrl) {
                                    setIsSubmitting(true);
                                    try {
                                        const result = await addVideoMedia(slug, videoType, videoUrl);

                                        if (result.error) {
                                            throw new Error(result.error);
                                        }

                                        // Reset form and close modal
                                        setSelectedFile(null);
                                        setVideoUrl("");
                                        setIsModalOpen(false);

                                        // Reload the page to show the new media
                                        window.location.reload();
                                    } catch (error) {
                                        console.error('Error adding video:', error);
                                        alert(error instanceof Error ? error.message : 'Failed to add video');
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }
                            }}
                        >
                            {isSubmitting ? 'Uploading...' : 'Submit'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}