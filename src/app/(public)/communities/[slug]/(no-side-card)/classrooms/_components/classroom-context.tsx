"use client"
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ClassroomType, VideoType, LessonResourceType } from "@/enums/enums";
import { CreateClassroom, Step, Lesson, Resource, ModalMode } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { updateClassroomCover, createLessonResource, getClassroomById, updateClassroom } from "@/action/classroom";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

interface ClassroomContextType {
    // State
    classroomData: CreateClassroom;
    step: Step;
    selectedModuleIndex: number | null;
    selectedLessonIndex: number | null;
    isEditingLesson: boolean;
    isCancelDialogOpen: boolean;
    isOpen: boolean;
    isLoading: boolean;
    isSavingDraft: boolean;
    isPublishing: boolean;
    mode: ModalMode;
    classroomId: number | null;
    isDraft: boolean;

    // Actions
    updateClassroomData: (data: Partial<CreateClassroom>) => void;
    setStep: (step: Step) => void;
    setSelectedModuleIndex: (index: number | null) => void;
    setSelectedLessonIndex: (index: number | null) => void;
    setIsEditingLesson: (isEditing: boolean) => void;
    setIsCancelDialogOpen: (open: boolean) => void;
    setIsOpen: (open: boolean) => void;
    resetForm: () => void;
    isNextButtonDisabled: () => boolean;
    handleSaveDraft: () => void;
    handlePublish: () => void;
    handleSave: () => void;
    handleEdit: () => void;
    handleAddModule: () => void;
    handleAddLesson: (moduleIndex: number) => void;
    handleModuleSelect: (moduleIndex: number) => void;
    handleModuleNameChange: (moduleIndex: number, name: string) => void;
    handleLessonNameChange: (moduleIndex: number, lessonIndex: number, name: string) => void;
    handleUpdateLesson: (moduleIndex: number, lessonIndex: number, lesson: Partial<Lesson>) => void;
    handleCoverChange: (coverUrl: string) => void;
    handleDragEnd: (event: DragEndEvent, moduleIndex: number) => void;
    handleDuplicateModule: (moduleIndex: number) => void;
    handleDeleteModule: (moduleIndex: number) => void;
    handleDuplicateLesson: (moduleIndex: number, lessonIndex: number) => void;
    handleDeleteLesson: (moduleIndex: number, lessonId: string | number) => void;
    handleTransferLesson: (sourceModuleIndex: number, lessonId: string | number, targetModuleIndex: number) => void;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export function useClassroomContext() {
    const context = useContext(ClassroomContext);
    if (context === undefined) {
        throw new Error("useClassroomContext must be used within a ClassroomProvider");
    }
    return context;
}

interface ClassroomProviderProps {
    children: ReactNode;
    communityId: number;
    mode?: ModalMode;
    classroomId?: number | null;
    defaultOpen?: boolean;
}

export function ClassroomProvider({ children, communityId, mode = 'create', classroomId: initialClassroomId = null, defaultOpen = false }: ClassroomProviderProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    // In view mode, start at module-details step (step 2)
    const [step, setStep] = useState<Step>(mode === 'view' ? 'module-details' : 'classroom-details');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [classroomId, setClassroomId] = useState<number | null>(initialClassroomId);
    const [isDraft, setIsDraft] = useState(false);
    const router = useRouter();
    const params = useParams();

    const [classroomData, setClassroomData] = useState<CreateClassroom>({
        name: "",
        description: "",
        type: ClassroomType.PUBLIC,
        coverUrl: "",
        oneTimePayment: undefined,
        timeUnlockInDays: undefined,
        modules: [
            {
                name: "",
                index: 0,
                lessons: []
            }
        ]
    });

    useEffect(() => {
        console.log(classroomData);
    }, [classroomData]);

    // Ensure step stays at module-details in view mode
    useEffect(() => {
        if (mode === 'view' && step !== 'module-details') {
            setStep('module-details');
        }
    }, [mode, step]);

    // Load classroom data when in view or edit mode
    useEffect(() => {
        if ((mode === 'view' || mode === 'edit') && classroomId) {
            const loadClassroom = async () => {
                setIsLoading(true);
                try {
                    const result = await getClassroomById(classroomId);
                    if (result.error || !result.data) {
                        toast.error(result.error || "Failed to load classroom");
                        return;
                    }

                    const { classroom, modules } = result.data;
                    setIsDraft(classroom.is_draft);

                    // Convert database structure to CreateClassroom format
                    // Preserve number IDs from DB to distinguish from new UUID items
                    const convertedModules = modules.map(({ module, lessons }) => ({
                        id: module.id, // Preserve number ID from DB
                        name: module.name,
                        index: module.index,
                        lessons: lessons.map(({ lesson, resources }) => ({
                            id: lesson.id, // Preserve number ID from DB (not converting to string)
                            name: lesson.name,
                            index: lesson.index,
                            videoUrl: lesson.video_url || undefined,
                            videoType: lesson.video_type as VideoType | undefined,
                            textContent: lesson.text_content || undefined,
                            resources: resources.map(resource => ({
                                id: resource.id, // Preserve number ID from DB
                                name: resource.link_name || resource.file_name || '',
                                url: resource.url,
                                type: resource.type as LessonResourceType,
                            })),
                            hasVideo: !!lesson.video_url,
                            hasText: !!lesson.text_content,
                        })),
                    }));

                    setClassroomData({
                        name: classroom.name,
                        description: classroom.description,
                        type: classroom.type as ClassroomType,
                        coverUrl: classroom.cover_url || '',
                        oneTimePayment: classroom.amount_one_time ? Number(classroom.amount_one_time) : undefined,
                        timeUnlockInDays: classroom.time_unlock_in_days || undefined,
                        modules: convertedModules.length > 0 ? convertedModules : [{ name: "", index: 0, lessons: [] }],
                    });
                } catch (error) {
                    console.error("Error loading classroom:", error);
                    toast.error("Failed to load classroom");
                } finally {
                    setIsLoading(false);
                }
            };

            loadClassroom();
        }
    }, [mode, classroomId]);

    const resetForm = useCallback(() => {
        setClassroomData({
            name: "",
            description: "",
            type: ClassroomType.PUBLIC,
            coverUrl: "",
            oneTimePayment: undefined,
            timeUnlockInDays: undefined,
            modules: []
        });
        setStep('classroom-details');
        setSelectedModuleIndex(null);
        setSelectedLessonIndex(null);
        setIsEditingLesson(false);
    }, []);

    const isNextButtonDisabled = useCallback(() => {
        // Name and description are always required
        if (!classroomData.name.trim() || !classroomData.description.trim()) {
            return true;
        }

        // If ONE_TIME_PAYMENT is selected, amount must be provided and > 0
        if (classroomData.type === ClassroomType.ONE_TIME_PAYMENT) {
            return !classroomData.oneTimePayment || classroomData.oneTimePayment <= 0;
        }

        // If TIME_UNLOCK is selected, days must be provided and > 0
        if (classroomData.type === ClassroomType.TIME_UNLOCK) {
            return !classroomData.timeUnlockInDays || classroomData.timeUnlockInDays <= 0;
        }

        return false;
    }, [classroomData]);

    const updateClassroomData = useCallback((data: Partial<CreateClassroom>) => {
        setClassroomData(prev => ({ ...prev, ...data }));
    }, []);

    const handleCoverChange = useCallback((coverUrl: string) => {
        setClassroomData(prev => ({ ...prev, coverUrl }));
    }, []);

    // Helper function to convert base64 to File
    const base64ToFile = useCallback((base64String: string, fileName: string): File => {
        const arr = base64String.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, { type: mimeType });
    }, []);

    // Helper function to upload cover image
    const uploadCoverImage = useCallback(async (classroomId: number, coverBase64: string): Promise<string | null> => {
        try {
            const file = base64ToFile(coverBase64, 'cover.jpg');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('classroomId', classroomId.toString());

            const response = await fetch('/api/classroom/upload-cover', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Upload cover error response:', errorData);
                throw new Error(errorData.error || `Failed to upload cover: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error uploading cover:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            return null;
        }
    }, [base64ToFile]);

    // Helper function to upload resource file
    const uploadResourceFile = useCallback(async (classroomId: number, resourceBase64: string, fileName: string): Promise<{ url: string; fileSize: number } | null> => {
        try {
            const file = base64ToFile(resourceBase64, fileName);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('classroomId', classroomId.toString());

            const response = await fetch('/api/classroom/upload-resource', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Upload resource error response:', errorData);
                throw new Error(errorData.error || `Failed to upload resource: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                url: data.url,
                fileSize: data.fileSize,
            };
        } catch (error) {
            console.error('Error uploading resource:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
            }
            return null;
        }
    }, [base64ToFile]);

    const handleSaveDraft = useCallback(async () => {
        if (isSavingDraft || isPublishing) return;
        
        setIsSavingDraft(true);
        const loadingToast = toast.loading("Saving classroom as draft...");

        try {
            // Step 1: Create classroom (without base64 files)
            const response = await fetch('/api/classroom/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    communityId,
                    classroomData,
                    isDraft: true,
                }),
            });

            const result = await response.json();
            
            if (result.error || !result.data) {
                toast.error(result.error || "Failed to save classroom", { id: loadingToast });
                return;
            }

            const { classroomId, lessons } = result.data;

            // Step 2: Upload cover image if it's base64
            if (classroomData.coverUrl && classroomData.coverUrl.startsWith('data:')) {
                toast.loading("Uploading cover image...", { id: loadingToast });
                const coverUrl = await uploadCoverImage(classroomId, classroomData.coverUrl);
                if (coverUrl) {
                    await updateClassroomCover(classroomId, coverUrl);
                }
            }

            // Step 3: Upload resource files and create lesson resources
            const fileResources: Array<{ lessonId: number; resource: Resource; moduleIndex: number; lessonIndex: number }> = [];
            
            // Collect all base64 file resources
            classroomData.modules.forEach((module, moduleIndex) => {
                module.lessons.forEach((lesson, lessonIndex) => {
                    if (lesson.resources) {
                        lesson.resources.forEach((resource) => {
                            if (resource.type === "FILE" && resource.url.startsWith('data:')) {
                                const lessonData = lessons.find(
                                    l => l.moduleIndex === moduleIndex && l.lessonIndex === lessonIndex
                                );
                                if (lessonData) {
                                    fileResources.push({
                                        lessonId: lessonData.id,
                                        resource,
                                        moduleIndex,
                                        lessonIndex,
                                    });
                                }
                            }
                        });
                    }
                });
            });

            // Upload files and create resources
            if (fileResources.length > 0) {
                toast.loading(`Uploading ${fileResources.length} resource file(s)...`, { id: loadingToast });
                
                for (const { lessonId, resource } of fileResources) {
                    const uploadResult = await uploadResourceFile(classroomId, resource.url, resource.name);
                    if (uploadResult) {
                        const fileExt = resource.name.split('.').pop() || '';
                        await createLessonResource(lessonId, {
                            url: uploadResult.url,
                            type: "FILE",
                            name: resource.name,
                            fileType: fileExt,
                            fileSize: uploadResult.fileSize,
                        });
                    }
                }
            }

            toast.success("Classroom saved as draft successfully", { id: loadingToast });
            resetForm();
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error saving draft:", error);
            toast.error("Failed to save classroom", { id: loadingToast });
        } finally {
            setIsSavingDraft(false);
        }
    }, [classroomData, communityId, isSavingDraft, isPublishing, router, resetForm, setIsOpen, uploadCoverImage, uploadResourceFile]);

    const handlePublish = useCallback(async () => {
        if (isPublishing || isSavingDraft) return;
        
        setIsPublishing(true);
        const loadingToast = toast.loading("Publishing classroom...");

        try {
            let result;
            let lessons;
            let publishedClassroomId: number;

            if (mode === 'edit' && classroomId) {
                // Update existing classroom in edit mode
                result = await updateClassroom(classroomId, classroomData, false);
                if (result.error || !result.data) {
                    toast.error(result.error || "Failed to publish classroom", { id: loadingToast });
                    return;
                }
                publishedClassroomId = classroomId;
                lessons = result.data.lessons;
            } else {
                // Create new classroom in create mode
                const response = await fetch('/api/classroom/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        communityId,
                        classroomData,
                        isDraft: false,
                    }),
                });

                result = await response.json();
                if (result.error || !result.data) {
                    toast.error(result.error || "Failed to publish classroom", { id: loadingToast });
                    return;
                }
                publishedClassroomId = result.data.classroomId;
                lessons = result.data.lessons;
            }

            // Step 2: Upload cover image if it's base64
            if (classroomData.coverUrl && classroomData.coverUrl.startsWith('data:')) {
                toast.loading("Uploading cover image...", { id: loadingToast });
                const coverUrl = await uploadCoverImage(publishedClassroomId, classroomData.coverUrl);
                if (coverUrl) {
                    await updateClassroomCover(publishedClassroomId, coverUrl);
                }
            }

            // Step 3: Upload resource files and create lesson resources
            const fileResources: Array<{ lessonId: number; resource: Resource; moduleIndex: number; lessonIndex: number }> = [];
            
            // Collect all base64 file resources
            classroomData.modules.forEach((module, moduleIndex) => {
                module.lessons.forEach((lesson, lessonIndex) => {
                    if (lesson.resources) {
                        lesson.resources.forEach((resource) => {
                            if (resource.type === "FILE" && resource.url.startsWith('data:')) {
                                const lessonData = lessons.find(
                                    l => l.moduleIndex === moduleIndex && l.lessonIndex === lessonIndex
                                );
                                if (lessonData) {
                                    fileResources.push({
                                        lessonId: lessonData.id,
                                        resource,
                                        moduleIndex,
                                        lessonIndex,
                                    });
                                }
                            }
                        });
                    }
                });
            });

            // Upload files and create resources
            if (fileResources.length > 0) {
                toast.loading(`Uploading ${fileResources.length} resource file(s)...`, { id: loadingToast });
                
                for (const { lessonId, resource } of fileResources) {
                    const uploadResult = await uploadResourceFile(publishedClassroomId, resource.url, resource.name);
                    if (uploadResult) {
                        const fileExt = resource.name.split('.').pop() || '';
                        await createLessonResource(lessonId, {
                            url: uploadResult.url,
                            type: "FILE",
                            name: resource.name,
                            fileType: fileExt,
                            fileSize: uploadResult.fileSize,
                        });
                    }
                }
            }

            toast.success("Classroom published successfully", { id: loadingToast });
            resetForm();
            setIsOpen(false);
            router.refresh();
            // Redirect to view page after publishing in edit mode
            if (mode === 'edit' && publishedClassroomId && params.slug) {
                router.push(`/communities/${params.slug}/classrooms/${publishedClassroomId}`);
            }
        } catch (error) {
            console.error("Error publishing classroom:", error);
            toast.error("Failed to publish classroom", { id: loadingToast });
        } finally {
            setIsPublishing(false);
        }
    }, [classroomData, communityId, classroomId, isPublishing, isSavingDraft, mode, router, params.slug, resetForm, setIsOpen, uploadCoverImage, uploadResourceFile]);

    const handleSave = useCallback(async () => {
        if (isLoading || isPublishing || !classroomId || mode !== 'edit') return;
        
        setIsLoading(true);
        const loadingToast = toast.loading("Saving classroom...");

        try {
            // Step 1: Update classroom (without base64 files)
            const result = await updateClassroom(classroomId, classroomData, isDraft);
            
            if (result.error || !result.data) {
                toast.error(result.error || "Failed to save classroom", { id: loadingToast });
                return;
            }

            const { lessons } = result.data;

            // Step 2: Upload cover image if it's base64
            if (classroomData.coverUrl && classroomData.coverUrl.startsWith('data:')) {
                toast.loading("Uploading cover image...", { id: loadingToast });
                const coverUrl = await uploadCoverImage(classroomId, classroomData.coverUrl);
                if (coverUrl) {
                    await updateClassroomCover(classroomId, coverUrl);
                }
            }

            // Step 3: Upload resource files and create lesson resources
            const fileResources: Array<{ lessonId: number; resource: Resource; moduleIndex: number; lessonIndex: number }> = [];
            
            // Collect all base64 file resources
            classroomData.modules.forEach((module, moduleIndex) => {
                module.lessons.forEach((lesson, lessonIndex) => {
                    if (lesson.resources) {
                        lesson.resources.forEach((resource) => {
                            if (resource.type === "FILE" && resource.url.startsWith('data:')) {
                                const lessonData = lessons.find(
                                    l => l.moduleIndex === moduleIndex && l.lessonIndex === lessonIndex
                                );
                                if (lessonData) {
                                    fileResources.push({
                                        lessonId: lessonData.id,
                                        resource,
                                        moduleIndex,
                                        lessonIndex,
                                    });
                                }
                            }
                        });
                    }
                });
            });

            // Upload files and create resources
            if (fileResources.length > 0) {
                toast.loading(`Uploading ${fileResources.length} resource file(s)...`, { id: loadingToast });
                
                for (const { lessonId, resource } of fileResources) {
                    const uploadResult = await uploadResourceFile(classroomId, resource.url, resource.name);
                    if (uploadResult) {
                        const fileExt = resource.name.split('.').pop() || '';
                        await createLessonResource(lessonId, {
                            url: uploadResult.url,
                            type: "FILE",
                            name: resource.name,
                            fileType: fileExt,
                            fileSize: uploadResult.fileSize,
                        });
                    }
                }
            }

            toast.success("Classroom saved successfully", { id: loadingToast });
            setIsOpen(false);
            router.refresh();
            // Redirect to view page after saving in edit mode
            if (mode === 'edit' && classroomId && params.slug) {
                router.push(`/communities/${params.slug}/classrooms/${classroomId}`);
            }
        } catch (error) {
            console.error("Error saving classroom:", error);
            toast.error("Failed to save classroom", { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    }, [classroomData, classroomId, isDraft, isLoading, isPublishing, mode, router, params.slug, setIsOpen, uploadCoverImage, uploadResourceFile]);

    const handleEdit = useCallback(() => {
        // Switch to edit mode - this will be handled by the parent component
        // For now, we'll just close the modal and let the parent handle reopening in edit mode
        setIsOpen(false);
    }, [setIsOpen]);

    const handleAddModule = useCallback(() => {
        setClassroomData(prev => ({
            ...prev,
            modules: [
                ...prev.modules,
                {
                    id: uuidv4(), // UUID for new module
                    name: "",
                    index: prev.modules.length,
                    lessons: []
                }
            ]
        }));
    }, []);

    const handleAddLesson = useCallback((moduleIndex: number) => {
        setSelectedModuleIndex(moduleIndex);
        
        // Calculate the new lesson index before updating state
        const currentModule = classroomData.modules[moduleIndex];
        const newLessonIndex = currentModule.lessons.length;
        
        setClassroomData(prev => ({
            ...prev,
            modules: prev.modules.map((m, index) =>
                index === moduleIndex
                    ? {
                        ...m,
                        lessons: [
                            ...m.lessons,
                            {
                                id: uuidv4(),
                                name: "",
                                index: newLessonIndex,
                                videoUrl: "",
                                videoType: undefined,
                                textContent: "",
                                resources: [],
                                hasVideo: false,
                                hasText: false
                            }
                        ]
                    }
                    : m
            )
        }));
        
        // Select the newly added lesson and set editing state
        setSelectedLessonIndex(newLessonIndex);
        setIsEditingLesson(true);
    }, [classroomData.modules]);

    const handleModuleSelect = useCallback((moduleIndex: number) => {
        setSelectedModuleIndex(prev => prev === moduleIndex ? null : moduleIndex);
    }, []);

    const handleModuleNameChange = useCallback((moduleIndex: number, name: string) => {
        setClassroomData(prev => ({
            ...prev,
            modules: prev.modules.map((m, idx) =>
                idx === moduleIndex ? { ...m, name } : m
            )
        }));
    }, []);

    const handleLessonNameChange = useCallback((moduleIndex: number, lessonIndex: number, name: string) => {
        setClassroomData(prev => ({
            ...prev,
            modules: prev.modules.map((m, idx) =>
                idx === moduleIndex
                    ? {
                        ...m,
                        lessons: m.lessons.map((lesson, lIdx) =>
                            lIdx === lessonIndex ? { ...lesson, name } : lesson
                        )
                    }
                    : m
            )
        }));
    }, []);

    const handleUpdateLesson = useCallback((moduleIndex: number, lessonIndex: number, lessonUpdates: Partial<Lesson>) => {
        setClassroomData(prev => ({
            ...prev,
            modules: prev.modules.map((m, idx) =>
                idx === moduleIndex
                    ? {
                        ...m,
                        lessons: m.lessons.map((lesson, lIdx) =>
                            lIdx === lessonIndex ? { ...lesson, ...lessonUpdates } : lesson
                        )
                    }
                    : m
            )
        }));
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent, moduleIndex: number) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setClassroomData(prev => {
            const module = prev.modules[moduleIndex];
            if (!module || !module.lessons || module.lessons.length === 0) {
                return prev;
            }

            // Convert string IDs back to numbers for comparison
            const activeId = Number(active.id);
            const overId = Number(over.id);
            
            // Ensure lessons are sorted by index to match the display order
            const sortedLessons = [...module.lessons].sort((a, b) => a.index - b.index);
            
            // Find the array positions of lessons with matching index values
            const oldIndex = sortedLessons.findIndex(lesson => lesson.index === activeId);
            const newIndex = sortedLessons.findIndex(lesson => lesson.index === overId);

            if (oldIndex === -1 || newIndex === -1) {
                console.warn('Could not find lesson indices:', { 
                    activeId, 
                    overId, 
                    oldIndex, 
                    newIndex,
                    lessonIndices: sortedLessons.map(l => l.index)
                });
                return prev; // Invalid indices, don't update
            }

            // Use arrayMove to reorder the lessons array
            const reorderedLessons = arrayMove(sortedLessons, oldIndex, newIndex);
            
            // Update all lesson indices to match their new positions
            const updatedLessons = reorderedLessons.map((lesson, index) => ({
                ...lesson,
                index: index
            }));

            return {
                ...prev,
                modules: prev.modules.map((m, idx) =>
                    idx === moduleIndex
                        ? { ...m, lessons: updatedLessons }
                        : m
                )
            };
        });
    }, []);

    const handleDuplicateModule = useCallback((moduleIndex: number) => {
        setClassroomData(prev => {
            const moduleToDuplicate = prev.modules[moduleIndex];
            // Deep copy the module with all its lessons
            // Assign new UUID since this is a new item (not existing from DB)
            const { id: _moduleId, ...moduleWithoutId } = moduleToDuplicate;
            const duplicatedModule = {
                ...moduleWithoutId,
                id: uuidv4(), // New UUID for duplicated module - always generate new UUID
                name: `${moduleToDuplicate.name} (Copy)`,
                index: prev.modules.length,
                lessons: moduleToDuplicate.lessons.map((lesson, lessonIndex) => {
                    const { id: _lessonId, ...lessonWithoutId } = lesson;
                    return {
                        ...lessonWithoutId,
                        id: uuidv4(), // New UUID for duplicated lesson - always generate new UUID
                        index: lessonIndex,
                        // Deep copy lesson properties
                        videoUrl: lesson.videoUrl,
                        videoType: lesson.videoType,
                        textContent: lesson.textContent,
                        resources: lesson.resources ? lesson.resources.map(resource => {
                            const { id: _resourceId, ...resourceWithoutId } = resource;
                            return {
                                ...resourceWithoutId,
                                id: uuidv4(), // New UUID for duplicated resource - always generate new UUID
                            };
                        }) : [],
                    };
                }),
            };

            // Insert the duplicated module right after the original
            const newModules = [...prev.modules];
            newModules.splice(moduleIndex + 1, 0, duplicatedModule);

            // Reindex all modules after insertion
            const reindexedModules = newModules.map((m, idx) => ({
                ...m,
                index: idx,
            }));

            return {
                ...prev,
                modules: reindexedModules,
            };
        });
    }, []);

    const handleDeleteModule = useCallback((moduleIndex: number) => {
        setClassroomData(prev => {
            // Don't allow deleting if there's only one module
            if (prev.modules.length <= 1) {
                return prev;
            }

            // Remove the module
            const newModules = prev.modules.filter((_, idx) => idx !== moduleIndex);

            // Reindex all remaining modules
            const reindexedModules = newModules.map((m, idx) => ({
                ...m,
                index: idx,
            }));

            return {
                ...prev,
                modules: reindexedModules,
            };
        });

        // Clear selections if the deleted module was selected
        setSelectedModuleIndex(prev => {
            if (prev === moduleIndex) {
                return null;
            }
            // Adjust selection index if a module before the selected one was deleted
            if (prev !== null && prev > moduleIndex) {
                return prev - 1;
            }
            return prev;
        });
        setSelectedLessonIndex(null);
        setIsEditingLesson(false);
    }, []);

    const handleDuplicateLesson = useCallback((moduleIndex: number, lessonIndex: number) => {
        setClassroomData(prev => {
            const module = prev.modules[moduleIndex];
            const lessonToDuplicate = module.lessons[lessonIndex];
            
            // Deep copy the lesson with all its content
            // Assign new UUID since this is a new item (not existing from DB)
            const { id: _lessonId, ...lessonWithoutId } = lessonToDuplicate;
            const duplicatedLesson = {
                ...lessonWithoutId,
                id: uuidv4(), // New UUID for duplicated lesson - always generate new UUID
                name: `${lessonToDuplicate.name} (Copy)`,
                index: module.lessons.length,
                videoUrl: lessonToDuplicate.videoUrl,
                videoType: lessonToDuplicate.videoType,
                textContent: lessonToDuplicate.textContent,
                resources: lessonToDuplicate.resources ? lessonToDuplicate.resources.map(resource => {
                    const { id: _resourceId, ...resourceWithoutId } = resource;
                    return {
                        ...resourceWithoutId,
                        id: uuidv4(), // New UUID for duplicated resource - always generate new UUID
                    };
                }) : [],
            };

            // Insert the duplicated lesson right after the original
            const newLessons = [...module.lessons];
            newLessons.splice(lessonIndex + 1, 0, duplicatedLesson);

            // Reindex all lessons after insertion
            const reindexedLessons = newLessons.map((lesson, idx) => ({
                ...lesson,
                index: idx,
            }));

            return {
                ...prev,
                modules: prev.modules.map((m, idx) =>
                    idx === moduleIndex
                        ? { ...m, lessons: reindexedLessons }
                        : m
                ),
            };
        });
    }, []);

    const handleDeleteLesson = useCallback((moduleIndex: number, lessonId: string | number) => {
        console.log("moduleIndex", moduleIndex);
        console.log("lessonId", lessonId);
        setClassroomData(prev => {
            const module = prev.modules[moduleIndex];
            
            // Don't allow deleting if there's only one lesson (or none)
            if (module.lessons.length <= 1) {
                return prev;
            }

            // Find the lesson by ID
            const lessonToDelete = module.lessons.find(lesson => lesson.id === lessonId);
            if (!lessonToDelete) {
                console.warn('Lesson not found with ID:', lessonId);
                return prev;
            }

            // Remove the lesson by ID
            const newLessons = module.lessons.filter(lesson => lesson.id !== lessonId);

            // Reindex all remaining lessons
            const reindexedLessons = newLessons.map((lesson, idx) => ({
                ...lesson,
                index: idx,
            }));

            return {
                ...prev,
                modules: prev.modules.map((m, idx) =>
                    idx === moduleIndex
                        ? { ...m, lessons: reindexedLessons }
                        : m
                ),
            };
        });

        // Clear selection if the deleted lesson was selected
        setSelectedLessonIndex(prev => {
            const module = classroomData.modules[moduleIndex];
            const deletedLessonIndex = module?.lessons.findIndex(lesson => lesson.id === lessonId);
            if (deletedLessonIndex !== undefined && deletedLessonIndex !== -1) {
                if (prev === deletedLessonIndex) {
                    // If the deleted lesson was selected, clear selection
                    setIsEditingLesson(false);
                    return null;
                } else if (prev !== null && prev > deletedLessonIndex) {
                    // Adjust selection index if a lesson before the selected one was deleted
                    setIsEditingLesson(false);
                    return prev - 1;
                }
            }
            return prev;
        });
    }, [classroomData.modules]);

    const handleTransferLesson = useCallback((sourceModuleIndex: number, lessonId: string | number, targetModuleIndex: number) => {
        setClassroomData(prev => {
            const sourceModule = prev.modules[sourceModuleIndex];
            const targetModule = prev.modules[targetModuleIndex];
            
            // Don't allow transferring if it's the same module
            if (sourceModuleIndex === targetModuleIndex) {
                return prev;
            }

            // Find the lesson to transfer by ID
            const lessonToTransfer = sourceModule.lessons.find(lesson => lesson.id === lessonId);
            if (!lessonToTransfer) {
                console.warn('Lesson not found with ID:', lessonId);
                return prev;
            }

            // Remove lesson from source module by ID
            const newSourceLessons = sourceModule.lessons.filter(lesson => lesson.id !== lessonId);
            
            // Reindex source module lessons
            const reindexedSourceLessons = newSourceLessons.map((lesson, idx) => ({
                ...lesson,
                index: idx,
            }));

            // Add lesson to target module with new index
            const newTargetLessonIndex = targetModule.lessons.length;
            const transferredLesson = {
                ...lessonToTransfer,
                index: newTargetLessonIndex,
            };

            return {
                ...prev,
                modules: prev.modules.map((m, idx) => {
                    if (idx === sourceModuleIndex) {
                        return { ...m, lessons: reindexedSourceLessons };
                    }
                    if (idx === targetModuleIndex) {
                        return {
                            ...m,
                            lessons: [...m.lessons, transferredLesson],
                        };
                    }
                    return m;
                }),
            };
        });

        // Clear selection if the transferred lesson was selected
        setSelectedLessonIndex(prev => {
            const sourceModule = classroomData.modules[sourceModuleIndex];
            const transferredLessonIndex = sourceModule?.lessons.findIndex(lesson => lesson.id === lessonId);
            if (transferredLessonIndex !== undefined && transferredLessonIndex !== -1 && prev === transferredLessonIndex && selectedModuleIndex === sourceModuleIndex) {
                setIsEditingLesson(false);
                return null;
            }
            return prev;
        });
    }, [selectedModuleIndex, classroomData.modules]);

    // Wrapper for setSelectedLessonIndex that also manages isEditingLesson
    const handleSetSelectedLessonIndex = useCallback((index: number | null) => {
        setSelectedLessonIndex(index);
        setIsEditingLesson(false);
    }, []);

    const value: ClassroomContextType = {
        classroomData,
        step,
        selectedModuleIndex,
        selectedLessonIndex,
        isEditingLesson,
        isCancelDialogOpen,
        isOpen,
        isLoading,
        isSavingDraft,
        isPublishing,
        mode,
        classroomId,
        isDraft,
        updateClassroomData,
        setStep,
        setSelectedModuleIndex,
        setSelectedLessonIndex: handleSetSelectedLessonIndex,
        setIsEditingLesson,
        setIsCancelDialogOpen,
        setIsOpen,
        resetForm,
        isNextButtonDisabled,
        handleSaveDraft,
        handlePublish,
        handleSave,
        handleEdit,
        handleAddModule,
        handleAddLesson,
        handleModuleSelect,
        handleModuleNameChange,
        handleLessonNameChange,
        handleUpdateLesson,
        handleCoverChange,
        handleDragEnd,
        handleDuplicateModule,
        handleDeleteModule,
        handleDuplicateLesson,
        handleDeleteLesson,
        handleTransferLesson,
    };

    return (
        <ClassroomContext.Provider value={value}>
            {children}
        </ClassroomContext.Provider>
    );
}
