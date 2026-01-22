"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Classroom, Lesson, Module } from "./types";
import { ClassroomType } from "@/enums/enums";
import { v4 as uuidv4 } from 'uuid';
import { getClassroom, getClassroomById } from "@/action/classroom";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

interface ClassroomEditorContextType {
    classroom: Classroom;

    updateClassroomData: (data: {
        name: string;
        description: string;
        type: ClassroomType;
        oneTimeAmount: number;
        timeUnlockInDays: number;
    }) => void;
    selectedModuleId: number | string | null;
    selectedLessonId: number | string | null;
    setSelectedModuleId: (id: number | string | null) => void;
    setSelectedLessonId: (id: number | string | null) => void;

    addLesson: (moduleId: number | string) => void;
    addModule: () => void;

    updateModuleInfo: (moduleId: number | string, info: { name?: string; description?: string }) => void;

    duplicateModule: (moduleId: number | string) => void;
    duplicateLesson: (moduleId: number | string, lessonId: number | string) => void;

    deleteModule: (moduleId: number | string) => void;
    deleteLesson: (moduleId: number | string, lessonId: number | string) => void;

    transferLesson: (targetModuleId: number | string, sourceModuleId: number | string, lessonId: number | string) => void;
    reorderLessons: (moduleId: number | string, lessonIds: (number | string)[]) => void;

    isEditingLesson: boolean;
    setIsEditingLesson: (isEditingLesson: boolean) => void;

    updateLesson: (moduleId: number | string, lessonId: number | string, newLesson: Lesson) => void;
    updateCoverData: (coverUrl: string) => void;
    saveClassroom: () => Promise<void>;
    saveAndPublishClassroom: () => Promise<void>;
    isSaving: boolean;
    isPublishing: boolean;
}

const ClassroomEditorContext = createContext<ClassroomEditorContextType | undefined>(undefined);

export function useClassroomEditorContext() {
    const context = useContext(ClassroomEditorContext);
    if (context === undefined) {
        throw new Error("useClassroomEditorContext must be used within a ClassroomEditorProvider");
    }
    return context;
}

interface ClassroomEditorProviderProps {
    children: ReactNode;
    initialClassroom: Awaited<ReturnType<typeof getClassroom>>;
}

export function ClassroomEditorProvider({ children, initialClassroom }: ClassroomEditorProviderProps) {
    const [classroom, setClassroom] = useState<Classroom>({} as Classroom);
    const [selectedModuleId, setSelectedModuleId] = useState<number | string | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<number | string | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [isEditingLesson, setIsEditingLesson] = useState(false);

    const router = useRouter();
    const params = useParams();

    const value: ClassroomEditorContextType = {
        classroom,
        updateClassroomData,
        selectedModuleId,
        selectedLessonId,
        setSelectedModuleId,
        setSelectedLessonId,
        addLesson,
        addModule,
        updateModuleInfo,
        duplicateModule,
        duplicateLesson,
        deleteModule,
        deleteLesson,
        transferLesson,
        reorderLessons,
        isEditingLesson,
        setIsEditingLesson,
        updateLesson,
        updateCoverData,
        saveClassroom,
        saveAndPublishClassroom,
        isSaving,
        isPublishing,
    };

    useEffect(() => {
        if (!initialClassroom.data) return;

        const classroomData = initialClassroom.data;
        const mappedClassroom: Classroom = {
            id: classroomData.id,
            name: classroomData.name,
            description: classroomData.description,
            type: classroomData.type,
            cover_url: classroomData.cover_url,
            amount_one_time: classroomData.amount_one_time,
            time_unlock_in_days: classroomData.time_unlock_in_days,
            is_draft: classroomData.is_draft,
            community_id: classroomData.community_id,
            slug: classroomData.slug,
            created_at: classroomData.created_at,
            updated_at: classroomData.updated_at,
            modules: classroomData.modules.map((module) => {
                const mappedModule: Module = {
                    id: module.id,
                    name: module.name,
                    description: module.description,
                    index: module.index,
                    classroom_id: module.classroom_id,
                    created_at: module.created_at,
                    updated_at: module.updated_at,
                    lessons: module.lessons.map((lesson) => {
                        const mappedLesson: Lesson = {
                            id: lesson.id,
                            name: lesson.name,
                            index: lesson.index,
                            module_id: lesson.module_id,
                            video_url: lesson.video_url,
                            video_type: lesson.video_type,
                            text_content: lesson.text_content,
                            created_at: lesson.created_at,
                            updated_at: lesson.updated_at,
                            resources: lesson.lesson_resources.map((resource) => {
                                const mappedResource = {
                                    id: resource.id,
                                    lesson_id: resource.lesson_id,
                                    url: resource.url,
                                    type: resource.type,
                                    link_name: resource.link_name,
                                    file_name: resource.file_name,
                                    file_type: resource.file_type,
                                    file_size: resource.file_size,
                                    created_at: resource.created_at,
                                    updated_at: resource.updated_at,
                                    isDeleted: false,
                                };
                                return mappedResource;
                            }),
                            isReorded: false,
                            isTransefered: false,
                            isDeleted: false,
                            isEdited: false,
                        };
                        return mappedLesson;
                    }),
                    isDeleted: false,
                    isEdited: false,
                };
                return mappedModule;
            }),
            isInfoEdited: false,
            isCoverEdited: false,
        };

        setClassroom(mappedClassroom);
    }, [initialClassroom]);

    useEffect(() => {
        console.log(classroom);
    }, [classroom]);

    // Update classroom data
    function updateClassroomData({
        name,
        description,
        type,
        oneTimeAmount,
        timeUnlockInDays,
    }: {
        name: string;
        description: string;
        type: ClassroomType;
        oneTimeAmount: number;
        timeUnlockInDays: number;
    }) {
        setClassroom(prev => ({
            ...prev,
            name, description,
            type, amount_one_time: oneTimeAmount,
            time_unlock_in_days: timeUnlockInDays,
            isInfoEdited: true
        }));
    }

    function updateCoverData(coverUrl: string): void {
        setClassroom(prev => ({
            ...prev,
            cover_url: coverUrl,
            isCoverEdited: true
        }));
    }

    // Module actions
    function addModule(): void {
        const newModule: Module = {
            id: uuidv4(),
            name: "",
            index: classroom.modules.length,
            classroom_id: classroom.id,
            created_at: new Date().toISOString(),
            description: "",
            updated_at: new Date().toISOString(),
            lessons: [],
            isDeleted: false,
            isEdited: false,
        };

        setClassroom(prev => ({
            ...prev,
            modules: [...prev.modules, newModule],
        }));
    }

    function deleteModule(moduleId: number | string): void {
        const module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }


        const isTempModule = typeof moduleId === 'string' ? true : false;

        setClassroom(prev => ({
            ...prev,
            modules:
                isTempModule ?
                    prev.modules.filter(m => m.id !== moduleId) :
                    prev.modules.map(m => m.id === moduleId ? { ...m, isDeleted: true } : m),
        }));
    }

    function updateModuleInfo(moduleId: number | string, info: { name?: string; description?: string }): void {

        let module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }

        module.isEdited = true;
        module = { ...module, ...info };

        setClassroom(prev => ({
            ...prev,
            modules: prev.modules.map(m => m.id === moduleId ? module : m),
        }));
    }

    function duplicateModule(moduleId: number | string): void {
        const module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }

        const newModuleId = uuidv4();
        const now = new Date().toISOString();

        // Duplicate all non-deleted lessons with new UUIDs
        const nonDeletedLessons = module.lessons.filter(lesson => !lesson.isDeleted);
        const duplicatedLessons: Lesson[] = nonDeletedLessons.map((lesson, index) => {
            const newLessonId = uuidv4();

            // Duplicate all non-deleted resources with new UUIDs
            const nonDeletedResources = lesson.resources.filter(resource => !resource.isDeleted);
            const duplicatedResources = nonDeletedResources.map(resource => ({
                ...resource,
                id: uuidv4(),
                lesson_id: newLessonId,
                created_at: now,
                updated_at: now,
                isDeleted: false,
            }));

            return {
                ...lesson,
                id: newLessonId,
                module_id: newModuleId,
                index: index,
                resources: duplicatedResources,
                created_at: now,
                updated_at: now,
                isReorded: false,
                isTransefered: false,
                isDeleted: false,
                isEdited: false,
            };
        });

        setClassroom(prev => {
            const duplicatedModule: Module = {
                ...module,
                id: newModuleId,
                index: prev.modules.length,
                lessons: duplicatedLessons,
                created_at: now,
                updated_at: now,
                isDeleted: false,
                isEdited: false,
            };

            return {
                ...prev,
                modules: [...prev.modules, duplicatedModule],
            };
        });
    }

    function duplicateLesson(moduleId: number | string, lessonId: number | string): void {
        const module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }

        const lesson = module.lessons.find(l => l.id === lessonId);
        if (!lesson || lesson.isDeleted) {
            return;
        }

        const newLessonId = uuidv4();
        const now = new Date().toISOString();

        // Duplicate all non-deleted resources with new UUIDs
        const nonDeletedResources = lesson.resources.filter(resource => !resource.isDeleted);
        const duplicatedResources = nonDeletedResources.map(resource => ({
            ...resource,
            id: uuidv4(),
            lesson_id: newLessonId,
            created_at: now,
            updated_at: now,
            isDeleted: false,
        }));

        setClassroom(prev => {
            const targetModule = prev.modules.find(m => m.id === moduleId);
            if (!targetModule) {
                return prev;
            }

            const duplicatedLesson: Lesson = {
                ...lesson,
                id: newLessonId,
                module_id: moduleId,
                index: targetModule.lessons.length,
                resources: duplicatedResources,
                created_at: now,
                updated_at: now,
                isReorded: false,
                isTransefered: false,
                isDeleted: false,
                isEdited: false,
            };

            return {
                ...prev,
                modules: prev.modules.map(m =>
                    m.id === moduleId
                        ? { ...m, lessons: [...m.lessons, duplicatedLesson] }
                        : m
                ),
            };
        });
    }

    // Lesson actions
    function addLesson(moduleId: number | string): void {

        const module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }

        const newLesson: Lesson = {
            id: uuidv4(),
            name: "",
            index: module.lessons.length,
            video_url: null,
            video_type: null,
            text_content: null,
            resources: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            module_id: moduleId,
            isReorded: false,
            isTransefered: false,
            isDeleted: false,
            isEdited: false,
        }

        setClassroom(prev => ({
            ...prev,
            modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m),
        }));
    }

    function deleteLesson(moduleId: number | string, lessonId: number | string): void {
        const module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }

        const lesson = module.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            return;
        }

        const isTempLesson = typeof lessonId === 'string' ? true : false;
        setClassroom(prev => ({
            ...prev,
            modules: prev.modules.map(m => m.id === moduleId ?
                {
                    ...m, lessons: isTempLesson ?
                        m.lessons.filter(l => l.id !== lessonId) : m.lessons.map(l => l.id === lessonId ? { ...l, isDeleted: true } : l)
                } : m),
        }));
    }

    function transferLesson(targetModuleId: number | string, sourceModuleId: number | string, lessonId: number | string): void {

        const sourceModule = classroom.modules.find(m => m.id === sourceModuleId);
        if (!sourceModule) {
            return;
        }

        const targetModule = classroom.modules.find(m => m.id === targetModuleId);
        if (!targetModule) {
            return;
        }

        const lesson = sourceModule.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            return;
        }

        setClassroom(prev => {
            // Get the target module from prev state to get the correct lesson count
            const targetModuleFromPrev = prev.modules.find(m => m.id === targetModuleId);
            const sourceModuleFromPrev = prev.modules.find(m => m.id === sourceModuleId);

            // Count only non-deleted lessons for the new index
            const nonDeletedTargetLessons = targetModuleFromPrev ? targetModuleFromPrev.lessons.filter(l => !l.isDeleted) : [];
            const newIndex = nonDeletedTargetLessons.length;

            return {
                ...prev,
                modules: prev.modules.map(module => {
                    // Remove lesson from source module and update indices for remaining lessons
                    if (module.id === sourceModuleId) {
                        const remainingLessons = module.lessons
                            .filter(l => l.id !== lessonId)
                            .map((l, index) => ({
                                ...l,
                                index: index,
                                isReorded: true, // Mark all remaining lessons as reordered
                            }));

                        return {
                            ...module,
                            lessons: remainingLessons,
                        };
                    }
                    // Add lesson to target module and update indices for all lessons
                    if (module.id === targetModuleId) {
                        const transferredLesson = {
                            ...lesson,
                            module_id: targetModuleId,
                            index: newIndex,
                            isTransefered: true,
                        };

                        // Update indices for all lessons in target module (including the transferred one)
                        const updatedLessons = [...module.lessons, transferredLesson]
                            .map((l, index) => ({
                                ...l,
                                index: index,
                                isReorded: true, // Mark all lessons in target module as reordered
                            }));

                        return {
                            ...module,
                            lessons: updatedLessons,
                        };
                    }
                    return module;
                }),
            };
        });
    }

    function reorderLessons(moduleId: number | string, lessonIds: (number | string)[]): void {
        const module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }

        // Check if the order actually changed by comparing IDs
        const currentOrder = module.lessons.map(l => l.id);
        const orderChanged = currentOrder.length !== lessonIds.length ||
            currentOrder.some((id, index) => id !== lessonIds[index]);

        // Create a map of lessons by their id for quick lookup
        const lessonMap = new Map<number | string, Lesson>();
        module.lessons.forEach(lesson => {
            lessonMap.set(lesson.id, lesson);
        });

        // Reorder lessons according to the new lessonIds array
        const reorderedLessons: Lesson[] = lessonIds
            .map((lessonId, newIndex) => {
                const lesson = lessonMap.get(lessonId);
                if (!lesson) {
                    return null;
                }

                return {
                    ...lesson,
                    index: newIndex,
                    // Mark all lessons as reordered if the order changed
                    isReorded: orderChanged ? true : lesson.isReorded,
                };
            })
            .filter((lesson): lesson is Lesson => lesson !== null);

        setClassroom(prev => ({
            ...prev,
            modules: prev.modules.map(m =>
                m.id === moduleId
                    ? { ...m, lessons: reorderedLessons }
                    : m
            ),
        }));
    }

    function updateLesson(moduleId: number | string, lessonId: number | string, newLesson: Lesson): void {
        const module = classroom.modules.find(m => m.id === moduleId);
        if (!module) {
            return;
        }

        let lesson = module.lessons.find(l => l.id === lessonId);
        if (!lesson) {
            return;
        }

        lesson = { ...lesson, ...newLesson, isEdited: true };

        setClassroom(prev => ({
            ...prev,
            modules: prev.modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.map(l => l.id === lessonId ? lesson : l) } : m),
        }));
    }

    // Save
    async function saveClassroom(): Promise<void> {
        try {
            setIsSaving(true);
            const response = await fetch('/api/classroom/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    classroom: {
                        ...classroom,
                        is_draft: true, // Keep as draft when saving
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving classroom:', errorData);
                throw new Error(errorData.error || 'Failed to save classroom');
            }

            const result = await response.json();
            console.log('Classroom saved successfully:', result);
        } catch (error) {
            console.error('Error saving classroom:', error);
            throw error;
        } finally {
            setIsSaving(false);
            router.push(`/communities/${params.slug}/classrooms/${classroom.id}`);
        }
    }

    async function saveAndPublishClassroom(): Promise<void> {
        try {
            setIsPublishing(true);
            const updatedClassroom = {
                ...classroom,
                is_draft: false, // Publish the classroom
            };

            const response = await fetch('/api/classroom/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    classroom: updatedClassroom,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error publishing classroom:', errorData);
                throw new Error(errorData.error || 'Failed to publish classroom');
            }

            const result = await response.json();
            console.log('Classroom published successfully:', result);

            // Update state only after successful API call
            setClassroom(prev => ({
                ...prev,
                is_draft: false,
            }));
        } catch (error) {
            console.error('Error publishing classroom:', error);
            throw error;
        } finally {
            setIsPublishing(false);
            router.push(`/communities/${params.slug}/classrooms/${classroom.id}`);
        }
    }

    return (
        <ClassroomEditorContext.Provider value={value}>
            {children}
        </ClassroomEditorContext.Provider>
    );
}
