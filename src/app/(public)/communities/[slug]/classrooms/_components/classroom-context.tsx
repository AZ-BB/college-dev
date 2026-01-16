"use client"
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ClassroomType } from "@/enums/enums";
import { CreateClassroom, Step, Lesson, Resource } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { createClassroom, updateClassroomCover, createLessonResource } from "@/action/classroom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    handleDeleteLesson: (moduleIndex: number, lessonIndex: number) => void;
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
}

export function ClassroomProvider({ children, communityId }: ClassroomProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>('classroom-details');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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
        if (isLoading) return;
        
        setIsLoading(true);
        const loadingToast = toast.loading("Saving classroom as draft...");

        try {
            // Step 1: Create classroom (without base64 files)
            const result = await createClassroom(communityId, classroomData, true);
            
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
            setIsLoading(false);
        }
    }, [classroomData, communityId, isLoading, router, resetForm, setIsOpen, uploadCoverImage, uploadResourceFile]);

    const handlePublish = useCallback(async () => {
        if (isLoading) return;
        
        setIsLoading(true);
        const loadingToast = toast.loading("Publishing classroom...");

        try {
            // Step 1: Create classroom (without base64 files)
            const result = await createClassroom(communityId, classroomData, false);
            
            if (result.error || !result.data) {
                toast.error(result.error || "Failed to publish classroom", { id: loadingToast });
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

            toast.success("Classroom published successfully", { id: loadingToast });
            resetForm();
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error publishing classroom:", error);
            toast.error("Failed to publish classroom", { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    }, [classroomData, communityId, isLoading, router, resetForm, setIsOpen, uploadCoverImage, uploadResourceFile]);

    const handleAddModule = useCallback(() => {
        setClassroomData(prev => ({
            ...prev,
            modules: [
                ...prev.modules,
                {
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

        if (over && active.id !== over.id) {
            setClassroomData(prev => {
                const module = prev.modules[moduleIndex];
                const oldIndex = module.lessons.findIndex(lesson => lesson.index === active.id);
                const newIndex = module.lessons.findIndex(lesson => lesson.index === over.id);

                const reorderedLessons = arrayMove(module.lessons, oldIndex, newIndex);
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
        }
    }, []);

    const handleDuplicateModule = useCallback((moduleIndex: number) => {
        setClassroomData(prev => {
            const moduleToDuplicate = prev.modules[moduleIndex];
            // Deep copy the module with all its lessons
            const duplicatedModule = {
                ...moduleToDuplicate,
                name: `${moduleToDuplicate.name} (Copy)`,
                index: prev.modules.length,
                lessons: moduleToDuplicate.lessons.map((lesson, lessonIndex) => ({
                    ...lesson,
                    index: lessonIndex,
                    // Deep copy lesson properties
                    videoUrl: lesson.videoUrl,
                    videoType: lesson.videoType,
                    textContent: lesson.textContent,
                    resources: lesson.resources ? lesson.resources.map(resource => ({ ...resource })) : [],
                })),
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
            const duplicatedLesson = {
                ...lessonToDuplicate,
                name: `${lessonToDuplicate.name} (Copy)`,
                index: module.lessons.length,
                videoUrl: lessonToDuplicate.videoUrl,
                videoType: lessonToDuplicate.videoType,
                textContent: lessonToDuplicate.textContent,
                resources: lessonToDuplicate.resources ? lessonToDuplicate.resources.map(resource => ({ ...resource })) : [],
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

    const handleDeleteLesson = useCallback((moduleIndex: number, lessonIndex: number) => {
        setClassroomData(prev => {
            const module = prev.modules[moduleIndex];
            
            // Don't allow deleting if there's only one lesson (or none)
            if (module.lessons.length <= 1) {
                return prev;
            }

            // Remove the lesson
            const newLessons = module.lessons.filter((_, idx) => idx !== lessonIndex);

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

        // Clear or adjust selection
        setSelectedLessonIndex(prev => {
            // Only adjust if we're deleting from the currently selected module
            // Note: This assumes the component calling this is managing the module context correctly
            if (prev === lessonIndex) {
                // If the deleted lesson was selected, clear selection
                setIsEditingLesson(false);
                return null;
            } else if (prev !== null && prev > lessonIndex) {
                // Adjust selection index if a lesson before the selected one was deleted
                setIsEditingLesson(false);
                return prev - 1;
            }
            return prev;
        });
    }, []);

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
    };

    return (
        <ClassroomContext.Provider value={value}>
            {children}
        </ClassroomContext.Provider>
    );
}
