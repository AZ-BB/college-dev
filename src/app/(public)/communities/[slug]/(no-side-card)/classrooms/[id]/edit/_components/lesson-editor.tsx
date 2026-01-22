import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import UploadIcon from "@/components/icons/upload";
import TrashIcon from "@/components/icons/trash";
import { Lesson, Resource } from "./types";
import { VideoType, LessonResourceType } from "@/enums/enums";
import { ChevronLeftIcon, X } from "lucide-react";
import { MarkdownEditor } from "@/components/markdown-editor/markdown-editor";
import { useClassroomEditorContext } from "./classroom-editor-context";
import { v4 as uuidv4 } from "uuid";

export function LessonEditor() {
    const {
        classroom,
        selectedModuleId,
        selectedLessonId,
        deleteLesson,
        duplicateLesson,
        setSelectedLessonId,
        isEditingLesson,
        setIsEditingLesson,
        updateLesson,
    } = useClassroomEditorContext();

    // Local state for editing lesson
    const [localLesson, setLocalLesson] = useState<Lesson | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoUrlInput, setVideoUrlInput] = useState("");
    const [videoUrlError, setVideoUrlError] = useState("");

    // Resource modal state
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [resourceName, setResourceName] = useState("");
    const [resourceUrl, setResourceUrl] = useState("");
    const [resourceFile, setResourceFile] = useState<File | null>(null);
    const [resourceType, setResourceType] = useState<"link" | "file">("link");
    const [fileInputKey, setFileInputKey] = useState(0);
    const [urlError, setUrlError] = useState("");

    // URL validation function
    const validateUrl = (url: string): boolean => {
        if (!url.trim()) {
            return false;
        }
        try {
            const urlObj = new URL(url);
            // Check if it's http or https
            return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch {
            return false;
        }
    };

    // Check if form is valid for submission
    const isResourceFormValid = useMemo(() => {
        // If file is selected, form is valid
        if (resourceFile) {
            return true;
        }
        // If no file, both name and URL must be filled and URL must be valid
        return resourceName.trim() !== "" && resourceUrl.trim() !== "" && validateUrl(resourceUrl);
    }, [resourceFile, resourceName, resourceUrl]);

    const modules = useMemo(() => {
        return classroom.modules.filter(m => m.isDeleted === false);
    }, [classroom.modules]);

    // Initialize local lesson state when entering edit mode
    useEffect(() => {
        if (selectedLessonId !== null) {
            const module = modules.find(m => m.id === selectedModuleId);
            if (!module) {
                return;
            }
            const lesson = module.lessons.find(l => l.id === selectedLessonId);
            if (!lesson) {
                return;
            }
            // Deep copy the lesson to avoid mutating the original
            setLocalLesson({
                ...lesson,
                resources: lesson.resources ? lesson.resources.map(r => ({ ...r })) : [],
            });
        } else {
            setLocalLesson(null);
        }
    }, [isEditingLesson, selectedModuleId, selectedLessonId, modules]);

    if (selectedModuleId === null || selectedLessonId === null) {
        return null;
    }

    const module = modules.find(m => m.id === selectedModuleId);
    if (!module) {
        return null;
    }

    // Use local lesson when editing, otherwise use context lesson
    const originalLesson = module.lessons.find(l => l.id === selectedLessonId);
    const lesson = isEditingLesson && localLesson ? localLesson : originalLesson;

    // Derive hasVideo and hasText from the current lesson (works in both edit and view modes)
    const hasVideo = useMemo(() => {
        if (!lesson) return false;
        return lesson.video_url !== null && lesson.video_url !== "" && lesson.video_type !== null;
    }, [lesson?.video_url, lesson?.video_type]);

    const hasText = useMemo(() => {
        if (!lesson) return false;
        // In editing mode, show textarea if text_content is not null (even if empty)
        // In view mode, only show if there's actual content
        if (isEditingLesson && localLesson) {
            return localLesson.text_content !== null;
        }
        return lesson.text_content !== null && lesson.text_content !== "";
    }, [lesson?.text_content, isEditingLesson, localLesson?.text_content]);

    const handleCancel = () => {
        setLocalLesson(null);
        setIsEditingLesson(false);
    };

    const handleSave = () => {
        if (localLesson && selectedModuleId !== null && selectedLessonId !== null) {
            updateLesson(selectedModuleId, selectedLessonId, localLesson);
            setIsEditingLesson(false);
            setLocalLesson(null);
        }
    };

    const handleLocalLessonNameChange = (name: string) => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, name });
        }
    };

    const handleTextContentChange = (textContent: string) => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, text_content: textContent });
        }
    };

    const handleAddVideo = () => {
        setIsVideoModalOpen(true);
        setVideoUrlInput(localLesson?.video_url || "");
        setVideoUrlError("");
    };

    const validateVideoUrl = (url: string): { valid: boolean; type?: VideoType; videoId?: string; error?: string } => {
        if (!url.trim()) {
            return { valid: false, error: "Please enter a video URL" };
        }

        // YouTube patterns
        const youtubePatterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of youtubePatterns) {
            const match = url.match(pattern);
            if (match) {
                return { valid: true, type: VideoType.YOUTUBE, videoId: match[1] };
            }
        }

        // Loom patterns
        const loomPatterns = [
            /loom\.com\/share\/([a-zA-Z0-9]+)/,
            /loom\.com\/embed\/([a-zA-Z0-9]+)/,
        ];
        for (const pattern of loomPatterns) {
            const match = url.match(pattern);
            if (match) {
                return { valid: true, type: VideoType.LOOM, videoId: match[1] };
            }
        }

        // Vimeo patterns
        const vimeoPatterns = [
            /vimeo\.com\/(\d+)/,
            /vimeo\.com\/video\/(\d+)/,
            /player\.vimeo\.com\/video\/(\d+)/,
        ];
        for (const pattern of vimeoPatterns) {
            const match = url.match(pattern);
            if (match) {
                return { valid: true, type: VideoType.VIMEO, videoId: match[1] };
            }
        }

        return { valid: false, error: "Please enter a valid YouTube, Loom, or Vimeo URL" };
    };

    const handleVideoUrlSubmit = () => {
        const validation = validateVideoUrl(videoUrlInput);
        if (!validation.valid) {
            setVideoUrlError(validation.error || "Invalid video URL");
            return;
        }

        if (localLesson && validation.type && validation.videoId) {
            setLocalLesson({
                ...localLesson,
                video_url: videoUrlInput,
                video_type: validation.type,
            });
            setIsVideoModalOpen(false);
            setVideoUrlInput("");
            setVideoUrlError("");
        }
    };

    const getEmbedUrl = (videoUrl: string, videoType?: VideoType): string => {
        if (!videoType) return "";

        switch (videoType) {
            case VideoType.YOUTUBE:
                const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                if (youtubeMatch) {
                    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                }
                break;
            case VideoType.LOOM:
                const loomMatch = videoUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
                if (loomMatch) {
                    return `https://www.loom.com/embed/${loomMatch[1]}`;
                }
                break;
            case VideoType.VIMEO:
                const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
                if (vimeoMatch) {
                    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                }
                break;
        }
        return "";
    };

    const handleAddText = () => {
        if (localLesson) {
            // Initialize with empty string if text_content is null
            setLocalLesson({ ...localLesson, text_content: localLesson.text_content || "" });
        }
    };

    const handleRemoveVideo = () => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, video_url: null, video_type: null });
        }
    };

    const handleRemoveText = () => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, text_content: null });
        }
    };

    const handleAddResource = () => {
        setIsResourceModalOpen(true);
        setResourceName("");
        setResourceUrl("");
        setResourceFile(null);
        setResourceType("link");
        setUrlError("");
        setFileInputKey(prev => prev + 1);
    };

    const handleResourceFileChange = (files: File[]) => {
        const file = files[0];
        if (file) {
            setResourceFile(file);
            setUrlError("");
            // Clear text inputs when file is selected
            setResourceName("");
            setResourceUrl("");
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleResourceFileChange,
        disabled: !!(resourceName.trim() || resourceUrl.trim()),
        multiple: false,
        noClick: !!(resourceName.trim() || resourceUrl.trim()),
    });

    const handleResourceSubmit = () => {
        if (!localLesson) return;

        // Check if file is selected
        if (resourceFile) {
            // Convert file to base64 data URL (client-side only)
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newResource: Resource = {
                    file_name: resourceFile.name,
                    url: base64String,
                    type: LessonResourceType.FILE,
                    file_type: resourceFile.type,
                    file_size: resourceFile.size,
                    link_name: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    id: uuidv4(),
                    lesson_id: localLesson.id,
                    isDeleted: false,
                };

                setLocalLesson({
                    ...localLesson,
                    resources: [...(localLesson.resources || []), newResource],
                });

                // Reset and close modal after file is read
                setIsResourceModalOpen(false);
                setResourceName("");
                setResourceUrl("");
                setResourceFile(null);
                setResourceType("link");
                setUrlError("");
                setFileInputKey(prev => prev + 1);
            };
            reader.onerror = () => {
                // Error reading file - could show a toast or error message here if needed
            };
            reader.readAsDataURL(resourceFile);
        } else {
            // Validation is handled by disabled state on button, but double-check here
            if (!resourceName.trim() || !resourceUrl.trim() || !validateUrl(resourceUrl)) {
                return;
            }

            const newResource: Resource = {
                link_name: resourceName,
                url: resourceUrl,
                type: LessonResourceType.LINK,
                file_name: null,
                file_type: null,
                file_size: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                id: uuidv4(),
                lesson_id: localLesson.id,
                isDeleted: false,
            };

            setLocalLesson({
                ...localLesson,
                resources: [...(localLesson.resources || []), newResource],
            });

            // Reset and close modal
            setIsResourceModalOpen(false);
            setResourceName("");
            setResourceUrl("");
            setResourceFile(null);
            setResourceType("link");
            setUrlError("");
            setFileInputKey(prev => prev + 1);
        }
    };

    const handleRemoveResource = (index: number) => {
        if (localLesson && localLesson.resources) {
            setLocalLesson({
                ...localLesson,
                resources: localLesson.resources.map((resource, i) => i !== index ? resource : { ...resource, isDeleted: true }),
            });
        }
    };

    if (isEditingLesson) {
        return (
            <div className="space-y-4 pb-10">
                <div
                    className="font-semibold text-base cursor-pointer flex items-center gap-1 hover:underline"
                    onClick={() => setSelectedLessonId(null)}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    {module.name || "Module Name"}
                </div>

                <input
                    className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-gray-400"
                    type="text"
                    placeholder="Lesson Name"
                    value={lesson?.name || ""}
                    onChange={(e) => handleLocalLessonNameChange(e.target.value)}
                />

                {/* Video content */}
                {hasVideo && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                        <iframe
                            src={getEmbedUrl(lesson?.video_url || "", lesson?.video_type as VideoType)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Text content */}
                {hasText && (
                    <MarkdownEditor
                        className="w-full min-h-[100px] p-3 border border-grey-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-grey-400"
                        placeholder="Enter your text content here..."
                        value={localLesson?.text_content || ""}
                        onChange={(value) => handleTextContentChange(value)}
                    />
                )}

                {/* Resources list */}
                {lesson?.resources && lesson?.resources.filter(resource => !resource.isDeleted).length > 0 && (
                    <div className="space-y-2">
                        <div className="space-y-2">
                            {lesson?.resources.filter(resource => !resource.isDeleted).map((resource, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-1 pl-3 rounded-[14px] bg-grey-200"
                                >
                                    <div className="flex items-center gap-2">
                                        {
                                            resource.type === LessonResourceType.LINK ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M13.0598 10.9375C15.3098 13.1875 15.3098 16.8275 13.0598 19.0675C10.8098 21.3075 7.16985 21.3175 4.92985 19.0675C2.68985 16.8175 2.67985 13.1775 4.92985 10.9375" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M10.5909 13.4128C8.25094 11.0728 8.25094 7.27281 10.5909 4.92281C12.9309 2.57281 16.7309 2.58281 19.0809 4.92281C21.4309 7.26281 21.4209 11.0628 19.0809 13.4128" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.2009 11.8022L10.7908 13.2122C10.0108 13.9922 10.0108 15.2622 10.7908 16.0422C11.5708 16.8222 12.8408 16.8222 13.6208 16.0422L15.8409 13.8222C17.4009 12.2622 17.4009 9.73219 15.8409 8.16219C14.2809 6.60219 11.7508 6.60219 10.1808 8.16219L7.76086 10.5822C6.42086 11.9222 6.42086 14.0922 7.76086 15.4322" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )
                                        }
                                        <span className="text-sm font-medium text-grey-900">{resource.link_name || resource.file_name || ""}</span>

                                    </div>

                                    <div className="flex items-center gap-1">
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cursor-pointer">
                                            <svg className="size-5" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.834 9.16927L17.6673 2.33594" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M18.334 5.66406V1.66406H14.334" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9.16602 1.66406H7.49935C3.33268 1.66406 1.66602 3.33073 1.66602 7.4974V12.4974C1.66602 16.6641 3.33268 18.3307 7.49935 18.3307H12.4993C16.666 18.3307 18.3327 16.6641 18.3327 12.4974V10.8307" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </a>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveResource(index)}
                                        >
                                            <svg className="size-5" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15.834 4.16406L4.1681 15.8299" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M15.8339 15.8299L4.16797 4.16406" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
                }

                <div className="grid grid-cols-3 gap-4">
                    <div
                        className="cursor-pointer hover:bg-grey-200 transition-all duration-300 border border-dashed border-grey-300 rounded-lg px-6 py-10 flex flex-col items-center justify-center text-center space-y-3"
                        onClick={hasVideo ? handleRemoveVideo : handleAddVideo}
                    >
                        {hasVideo ? (
                            <>
                                <div className="flex items-center gap-2 text-grey-900 font-semibold text-base">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.16992 14.8319L14.8299 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M14.8299 14.8319L9.16992 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Remove Video
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <UploadIcon className="w-6 h-6 stroke-grey-900" />
                                    <h3 className="font-semibold text-base text-grey-900">Add Video</h3>
                                </div>
                                <p className="text-sm text-grey-600">
                                    You can add YouTube, Google Drive Videos, Zoom recording, Loom, or Vimeo link.
                                </p>
                            </>
                        )}
                    </div>


                    <div
                        className="cursor-pointer hover:bg-grey-200 transition-all duration-300 border border-dashed border-grey-300 rounded-lg px-6 py-10 flex flex-col items-center justify-center text-center space-y-3"
                        onClick={hasText ? handleRemoveText : handleAddText}
                    >
                        {hasText ? (
                            <>
                                <div className="flex items-center gap-2 text-grey-900 font-semibold text-base">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.16992 14.8319L14.8299 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M14.8299 14.8319L9.16992 9.17188" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Remove Text
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <UploadIcon className="w-6 h-6 stroke-grey-900" />
                                    <h3 className="font-semibold text-base text-grey-900">Add Text</h3>
                                </div>
                                <p className="text-sm text-grey-600">
                                    You can add headings, format your text, add code etc.
                                </p>
                            </>
                        )}
                    </div>

                    <div
                        className="cursor-pointer hover:bg-grey-200 transition-all duration-300 border border-dashed border-grey-300 rounded-lg px-6 py-10 flex flex-col items-center justify-center text-center space-y-3"
                        onClick={handleAddResource}
                    >
                        <div className="flex items-center gap-2">
                            <UploadIcon className="w-6 h-6 stroke-grey-900" />
                            <h3 className="font-semibold text-base text-grey-900">Add resource</h3>
                        </div>
                        <p className="text-sm text-grey-600">
                            You can add links, PDFs, docx, excel files etc.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-[12px] py-5 text-sm font-semibold"
                            onClick={() => {
                                if (lesson) {
                                    deleteLesson(selectedModuleId, lesson.id);
                                }
                            }}
                        >
                            Remove
                        </Button>

                        <Button
                            variant="secondary"
                            className="rounded-[12px] py-5 text-sm font-semibold"
                            onClick={() => duplicateLesson(selectedModuleId, selectedLessonId)}
                        >
                            Duplicate lesson
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-[12px] py-5 text-sm font-semibold px-5"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            className="rounded-[12px] py-5 text-sm font-semibold px-6"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>

                </div>

                {/* Video URL Modal */}
                <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Video</DialogTitle>
                            <DialogDescription>
                                You can add YouTube, Loom, or Vimeo link.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="url"
                                    placeholder="Paste video link"
                                    value={videoUrlInput}
                                    onChange={(e) => {
                                        setVideoUrlInput(e.target.value);
                                        setVideoUrlError("");
                                    }}
                                    className={videoUrlError ? "border-red-500" : ""}
                                />
                                {videoUrlError && (
                                    <p className="text-sm text-red-500 mt-1">{videoUrlError}</p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                className="rounded-[12px] py-7 text-lg font-semibold px-6 w-1/2"
                                variant="secondary"
                                onClick={() => {
                                    setIsVideoModalOpen(false);
                                    setVideoUrlInput("");
                                    setVideoUrlError("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button className="rounded-[12px] py-7 text-lg font-semibold px-6 w-1/2" onClick={handleVideoUrlSubmit}>
                                Add
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Resource Modal */}
                <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Resources</DialogTitle>
                            <DialogDescription>
                                You can add resource link or attach a resource file here
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Resource name input */}
                            <div>
                                <label className="text-sm font-medium text-grey-900 mb-1 block">
                                    Name
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter resource name"
                                    value={resourceName}
                                    onChange={(e) => {
                                        setResourceName(e.target.value);
                                        // Clear file when text input is used
                                        if (e.target.value.trim()) {
                                            setResourceFile(null);
                                            setFileInputKey(prev => prev + 1);
                                        }
                                    }}
                                    disabled={!!resourceFile}
                                />
                            </div>

                            {/* Link URL input */}
                            <div>
                                <label className="text-sm font-medium text-grey-900 mb-1 block">
                                    URL
                                </label>
                                <Input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={resourceUrl}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setResourceUrl(url);
                                        // Validate URL in real-time if it has content
                                        if (url.trim() && !validateUrl(url)) {
                                            setUrlError("Please enter a valid URL (must start with http:// or https://)");
                                        } else {
                                            setUrlError("");
                                        }
                                        // Clear file when URL input is used
                                        if (url.trim()) {
                                            setResourceFile(null);
                                            setFileInputKey(prev => prev + 1);
                                        }
                                    }}
                                    disabled={!!resourceFile}
                                    className={urlError ? "border-red-500" : ""}
                                />
                                {urlError && (
                                    <p className="text-sm text-red-500 mt-1">{urlError}</p>
                                )}
                            </div>

                            {/* Separator */}
                            <Separator />

                            {/* File input */}
                            <div>
                                <label className="text-sm font-medium text-grey-900 mb-1 block">
                                    File
                                </label>
                                <div
                                    {...getRootProps()}
                                    className={`border border-dashed rounded-lg py-20 cursor-pointer transition-colors ${isDragActive
                                        ? "border-grey-400 bg-grey-100"
                                        : "border-grey-300 bg-transparent"
                                        } ${!!(resourceName.trim() || resourceUrl.trim())
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:border-grey-400"
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex  items-center justify-center text-orange-500 text-center gap-2 font-semibold">
                                        <UploadIcon className="w-6 h-6 stroke-orange-500" />
                                        {isDragActive ? (
                                            <p className="text-base">Drop the file here...</p>
                                        ) : (
                                            <p className="text-base">
                                                Drag and drop your file here or <span className="underline">select file</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {resourceFile && (
                                    <p className="text-sm text-grey-600 mt-1">
                                        Selected: {resourceFile.name} ({(resourceFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>

                        </div>
                        <DialogFooter>
                            <Button
                                className="rounded-[12px] py-7 font-semibold px-6 w-1/2"
                                variant="secondary"
                                onClick={() => {
                                    setIsResourceModalOpen(false);
                                    setResourceName("");
                                    setResourceUrl("");
                                    setResourceFile(null);
                                    setResourceType("link");
                                    setUrlError("");
                                    setFileInputKey(prev => prev + 1);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="rounded-[12px] py-7 font-semibold px-6 w-1/2"
                                onClick={handleResourceSubmit}
                                disabled={!isResourceFormValid}
                            >
                                Add
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div >
        );
    }

    if (!isEditingLesson) {
        return (
            <div className="space-y-4">
                <div
                    className="font-semibold text-base cursor-pointer flex items-center gap-1 hover:underline"
                    onClick={() => setSelectedLessonId(null)}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    {module.name || "Module Name"}
                </div>

                <div className="text-xl font-semibold py-3">
                    {lesson?.name || "Lesson Name"}
                </div>

                {/* Video content */}
                {hasVideo && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                        <iframe
                            src={getEmbedUrl(lesson?.video_url || "", lesson?.video_type as VideoType)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Text content */}
                {hasText && (
                    <MarkdownEditor
                        className="whitespace-pre-wrap text-sm text-grey-900 border-none outline-none ring-0"
                        placeholder="Enter your text content here..."
                        value={lesson?.text_content || ""}
                        onChange={(value) => { }}
                        readonly={true}
                    />
                )}

                {/* Resources list */}
                {lesson?.resources && lesson?.resources.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base text-grey-900">Resources</h3>
                        <div className="space-y-2">
                            {lesson?.resources.filter(resource => !resource.isDeleted).map((resource, index) => (
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={index}
                                    className="flex items-center justify-between py-1.5 pl-3 pr-3 rounded-[14px] bg-grey-200 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        {
                                            resource.type === LessonResourceType.LINK ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M13.0598 10.9375C15.3098 13.1875 15.3098 16.8275 13.0598 19.0675C10.8098 21.3075 7.16985 21.3175 4.92985 19.0675C2.68985 16.8175 2.67985 13.1775 4.92985 10.9375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M10.5909 13.4128C8.25094 11.0728 8.25094 7.27281 10.5909 4.92281C12.9309 2.57281 16.7309 2.58281 19.0809 4.92281C21.4309 7.26281 21.4209 11.0628 19.0809 13.4128" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.2009 11.8022L10.7908 13.2122C10.0108 13.9922 10.0108 15.2622 10.7908 16.0422C11.5708 16.8222 12.8408 16.8222 13.6208 16.0422L15.8409 13.8222C17.4009 12.2622 17.4009 9.73219 15.8409 8.16219C14.2809 6.60219 11.7508 6.60219 10.1808 8.16219L7.76086 10.5822C6.42086 11.9222 6.42086 14.0922 7.76086 15.4322" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )
                                        }
                                        <span className="text-sm font-medium text-grey-900">{resource.link_name || resource.file_name || ""}</span>

                                    </div>

                                    <div className="cursor-pointer">
                                        <svg className="size-5" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.834 9.16927L17.6673 2.33594" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M18.334 5.66406V1.66406H14.334" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9.16602 1.66406H7.49935C3.33268 1.66406 1.66602 3.33073 1.66602 7.4974V12.4974C1.66602 16.6641 3.33268 18.3307 7.49935 18.3307H12.4993C16.666 18.3307 18.3327 16.6641 18.3327 12.4974V10.8307" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        className="rounded-[12px] py-5 text-sm font-semibold"
                        onClick={() => duplicateLesson(selectedModuleId, selectedLessonId)}
                    >
                        Duplicate lesson
                    </Button>

                    <Button
                        variant="default"
                        className="rounded-[12px] py-5 text-sm font-semibold"
                        onClick={() => setIsEditingLesson(true)}
                    >
                        Edit lesson
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
