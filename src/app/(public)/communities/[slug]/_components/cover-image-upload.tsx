"use client"

import { useState, useRef } from "react";
import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface CoverImageUploadProps {
    coverImage: string | null;
    commSlug: string;
}

export function CoverImageUpload({ coverImage, commSlug }: CoverImageUploadProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(coverImage);
    const [error, setError] = useState<string | null>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image size should be less than 10MB');
            return;
        }

        setError(null);
        setIsUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        try {
            // Upload file
            const formData = new FormData();
            formData.append('file', file);
            formData.append('commSlug', commSlug);

            const response = await fetch('/api/commuinty/upload-cover', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload cover image');
            }

            const result = await response.json();
            setPreview(result.url);
            
            // Refresh the page to show the new cover image
            router.refresh();
        } catch (err) {
            console.error('Error uploading cover image:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload cover image');
            // Revert preview on error
            setPreview(coverImage);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
            />
            
            {preview ? (
                <div className="group relative">
                    <img
                        key={preview}
                        src={preview}
                        alt="Community cover"
                        className="h-56 w-full object-cover rounded-t-[20px]"
                    />

                    {/* Loading skeleton overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 w-full h-full">
                            <Skeleton className="absolute inset-0 h-56 w-full rounded-t-[20px] rounded-b-none opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="flex items-center gap-2">
                                    <UploadIcon className="w-6 h-6 stroke-white animate-pulse" />
                                    <span className="font-semibold text-white">
                                        Uploading...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload overlay - only show when not uploading */}
                    {!isUploading && (
                        <div 
                            className="absolute inset-0 bg-black/10 hover:bg-black/30 cursor-pointer flex items-center justify-center gap-2 group-hover:opacity-100 transition-all duration-300 rounded-t-[20px]"
                            onClick={handleClick}
                        >
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <UploadIcon className="w-6 h-6 stroke-white" />
                                <span className="font-semibold text-white">
                                    Upload Cover Photo
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div 
                    className="h-56 bg-gray-200 rounded-t-[20px] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-300 transition-all duration-300"
                    onClick={handleClick}
                >
                    <UploadIcon className="w-6 h-6 stroke-gray-700" />
                    <span className="font-semibold text-gray-600">
                        Upload Cover Photo
                    </span>
                </div>
            )}
            
            {error && (
                <div className="mt-2 text-sm text-red-600 px-4">
                    {error}
                </div>
            )}
        </div>
    );
}
