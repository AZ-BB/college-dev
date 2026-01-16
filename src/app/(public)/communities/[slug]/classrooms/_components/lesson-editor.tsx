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
import { useMemo, useState, useEffect } from "react";
import { useClassroomContext } from "./classroom-context";
import UploadIcon from "@/components/icons/upload";
import TrashIcon from "@/components/icons/trash";
import { Lesson, Resource } from "./types";
import { VideoType, LessonResourceType } from "@/enums/enums";

export function LessonEditor() {
    const {
        classroomData,
        selectedModuleIndex,
        selectedLessonIndex,
        isEditingLesson,
        handleDeleteLesson,
        handleDuplicateLesson,
        handleUpdateLesson,
        setIsEditingLesson,
    } = useClassroomContext();

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
    const [resourceError, setResourceError] = useState("");

    const modules = useMemo(() => {
        return classroomData.modules;
    }, [classroomData.modules]);

    // Initialize local lesson state when entering edit mode
    useEffect(() => {
        if (isEditingLesson && selectedModuleIndex !== null && selectedLessonIndex !== null) {
            const module = modules[selectedModuleIndex];
            const lesson = module.lessons[selectedLessonIndex];
            // Deep copy the lesson to avoid mutating the original
            setLocalLesson({
                ...lesson,
                resources: lesson.resources ? lesson.resources.map(r => ({ ...r })) : [],
            });
        } else {
            setLocalLesson(null);
        }
    }, [isEditingLesson, selectedModuleIndex, selectedLessonIndex, modules]);

    if (selectedModuleIndex === null || selectedLessonIndex === null) {
        return null;
    }

    const module = modules[selectedModuleIndex];
    // Use local lesson when editing, otherwise use context lesson
    const lesson = isEditingLesson && localLesson ? localLesson : module.lessons[selectedLessonIndex];

    const handleSave = () => {
        if (localLesson && selectedModuleIndex !== null && selectedLessonIndex !== null) {
            handleUpdateLesson(selectedModuleIndex, selectedLessonIndex, localLesson);
            setIsEditingLesson(false);
        }
    };

    const handleCancel = () => {
        setLocalLesson(null);
        setIsEditingLesson(false);
    };

    const handleLocalLessonNameChange = (name: string) => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, name });
        }
    };

    const handleTextContentChange = (textContent: string) => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, textContent });
        }
    };

    const handleAddVideo = () => {
        setIsVideoModalOpen(true);
        setVideoUrlInput(localLesson?.videoUrl || "");
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
                hasVideo: true,
                videoUrl: videoUrlInput,
                videoType: validation.type,
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
            setLocalLesson({ ...localLesson, hasText: true });
        }
    };

    const handleRemoveVideo = () => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, hasVideo: false, videoUrl: "", videoType: undefined });
        }
    };

    const handleRemoveText = () => {
        if (localLesson) {
            setLocalLesson({ ...localLesson, hasText: false, textContent: "" });
        }
    };

    const handleAddResource = () => {
        setIsResourceModalOpen(true);
        setResourceName("");
        setResourceUrl("");
        setResourceFile(null);
        setResourceType("link");
        setResourceError("");
    };

    const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResourceFile(file);
            setResourceError("");
        }
    };

    const handleResourceSubmit = () => {
        if (!localLesson) return;

        if (resourceType === "link") {
            if (!resourceName.trim() || !resourceUrl.trim()) {
                setResourceError("Please provide both name and URL");
                return;
            }

            const newResource: Resource = {
                name: resourceName,
                url: resourceUrl,
                type: LessonResourceType.LINK,
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
            setResourceError("");
        } else {
            if (!resourceFile) {
                setResourceError("Please select a file");
                return;
            }

            // Convert file to base64 data URL (client-side only)
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const newResource: Resource = {
                    name: resourceFile.name,
                    url: base64String,
                    type: LessonResourceType.FILE,
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
                setResourceError("");
            };
            reader.onerror = () => {
                setResourceError("Error reading file");
            };
            reader.readAsDataURL(resourceFile);
        }
    };

    const handleRemoveResource = (index: number) => {
        if (localLesson && localLesson.resources) {
            const updatedResources = localLesson.resources.filter((_, i) => i !== index);
            setLocalLesson({
                ...localLesson,
                resources: updatedResources,
            });
        }
    };

    if (isEditingLesson) {
        return (
            <div className="space-y-4 pb-10">
                <div className="font-bold text-base">
                    {module.name || "Module Name"}
                </div>

                <input
                    className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-gray-400"
                    type="text"
                    placeholder="Lesson Name"
                    value={lesson.name}
                    onChange={(e) => handleLocalLessonNameChange(e.target.value)}
                />

                {/* Video content */}
                {lesson.hasVideo && lesson.videoUrl && lesson.videoType && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                        <iframe
                            src={getEmbedUrl(lesson.videoUrl, lesson.videoType)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Text content */}
                {lesson.hasText && (
                    <textarea
                        className="w-full min-h-[100px] p-3 border border-grey-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-grey-400"
                        placeholder="Enter your text content here..."
                        value={lesson.textContent || ""}
                        onChange={(e) => handleTextContentChange(e.target.value)}
                    />
                )}

                {/* Resources list */}
                {lesson.resources && lesson.resources.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base text-grey-900">Resources</h3>
                        <div className="space-y-2">
                            {lesson.resources.map((resource, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border border-grey-300 rounded-lg bg-grey-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-grey-900">{resource.name}</span>
                                        <span className="text-xs text-grey-600">
                                            ({resource.type === LessonResourceType.LINK ? "Link" : "File"})
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveResource(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    <div
                        className="cursor-pointer hover:bg-grey-200 transition-all duration-300 border border-dashed border-grey-300 rounded-lg px-6 py-10 flex flex-col items-center justify-center text-center space-y-3"
                        onClick={lesson.hasVideo ? handleRemoveVideo : handleAddVideo}
                    >
                        {lesson.hasVideo ? (
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
                        onClick={lesson.hasText ? handleRemoveText : handleAddText}
                    >
                        {lesson.hasText ? (
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
                            onClick={() => handleDeleteLesson(selectedModuleIndex, selectedLessonIndex)}
                        >
                            Remove
                        </Button>

                        <Button
                            variant="secondary"
                            className="rounded-[12px] py-5 text-sm font-semibold"
                            onClick={() => handleDuplicateLesson(selectedModuleIndex, selectedLessonIndex)}
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
                            <DialogTitle>Add Resource</DialogTitle>
                            <DialogDescription>
                                Add a link or upload a file
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Resource type selector */}
                            <div className="flex gap-2">
                                <Button
                                    variant={resourceType === "link" ? "default" : "secondary"}
                                    className="flex-1 rounded-[12px] py-5 text-sm font-semibold"
                                    onClick={() => {
                                        setResourceType("link");
                                        setResourceFile(null);
                                        setResourceError("");
                                    }}
                                >
                                    Link
                                </Button>
                                <Button
                                    variant={resourceType === "file" ? "default" : "secondary"}
                                    className="flex-1 rounded-[12px] py-5 text-sm font-semibold"
                                    onClick={() => {
                                        setResourceType("file");
                                        setResourceUrl("");
                                        setResourceError("");
                                    }}
                                >
                                    File
                                </Button>
                            </div>

                            {/* Resource name input - only for links */}
                            {resourceType === "link" && (
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
                                            setResourceError("");
                                        }}
                                    />
                                </div>
                            )}

                            {/* Link input */}
                            {resourceType === "link" && (
                                <div>
                                    <label className="text-sm font-medium text-grey-900 mb-1 block">
                                        URL
                                    </label>
                                    <Input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={resourceUrl}
                                        onChange={(e) => {
                                            setResourceUrl(e.target.value);
                                            setResourceError("");
                                        }}
                                    />
                                </div>
                            )}

                            {/* File input */}
                            {resourceType === "file" && (
                                <div>
                                    <label className="text-sm font-medium text-grey-900 mb-1 block">
                                        File
                                    </label>
                                    <Input
                                        key={resourceType}
                                        type="file"
                                        onChange={handleResourceFileChange}
                                        className="cursor-pointer"
                                    />
                                    {resourceFile && (
                                        <p className="text-sm text-grey-600 mt-1">
                                            Selected: {resourceFile.name} ({(resourceFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>
                            )}

                            {resourceError && (
                                <p className="text-sm text-red-500">{resourceError}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                className="rounded-[12px] py-7 text-lg font-semibold px-6 w-1/2"
                                variant="secondary"
                                onClick={() => {
                                    setIsResourceModalOpen(false);
                                    setResourceName("");
                                    setResourceUrl("");
                                    setResourceFile(null);
                                    setResourceType("link");
                                    setResourceError("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="rounded-[12px] py-7 text-lg font-semibold px-6 w-1/2"
                                onClick={handleResourceSubmit}
                            >
                                Add
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    if (!isEditingLesson) {
        return (
            <div className="space-y-4">
                <div className="font-bold text-base">
                    {module.name || "Module Name"}
                </div>

                <div className="text-xl font-semibold py-3">
                    {lesson?.name || "Lesson Name"}
                </div>

                {/* Video content */}
                {lesson.hasVideo && lesson.videoUrl && lesson.videoType && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                        <iframe
                            src={getEmbedUrl(lesson.videoUrl, lesson.videoType)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Text content */}
                {lesson.hasText && lesson.textContent && (
                    <div className="whitespace-pre-wrap text-sm text-grey-900">
                        {lesson.textContent}
                    </div>
                )}

                {/* Resources list */}
                {lesson.resources && lesson.resources.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base text-grey-900">Resources</h3>
                        <div className="space-y-2">
                            {lesson.resources.map((resource, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 border border-grey-300 rounded-lg bg-grey-50"
                                >
                                    <div className="flex items-center gap-2">
                                        {resource.type === LessonResourceType.LINK ? (
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-blue-600 hover:underline"
                                            >
                                                {resource.name}
                                            </a>
                                        ) : (
                                            <a
                                                href={resource.url}
                                                download={resource.name}
                                                className="text-sm font-medium text-blue-600 hover:underline"
                                            >
                                                {resource.name}
                                            </a>
                                        )}
                                        <span className="text-xs text-grey-600">
                                            ({resource.type === LessonResourceType.LINK ? "Link" : "File"})
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        className="rounded-[12px] py-5 text-sm font-semibold"
                        onClick={() => handleDuplicateLesson(selectedModuleIndex, selectedLessonIndex)}
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
