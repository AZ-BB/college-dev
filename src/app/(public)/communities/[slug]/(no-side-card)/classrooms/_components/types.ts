import { ClassroomType, LessonResourceType, VideoType } from "@/enums/enums";

export interface Resource {
    id?: string | number; // UUID for new, number for existing from DB
    name: string;
    url: string;
    type: LessonResourceType;
}

export interface Lesson {
    id: string | number; // UUID for new, number for existing from DB
    name: string;
    index: number;
    videoUrl?: string;
    videoType?: VideoType;
    textContent?: string;
    resources?: Resource[];

    hasVideo: boolean;
    hasText: boolean;
}

export interface Module {
    id?: string | number; // UUID for new, number for existing from DB
    name: string;
    index: number;
    lessons: Lesson[];
}

// Helper functions to check if an ID represents a new item (UUID) or existing item (number)
export function isNewItem(id: string | number | undefined): boolean {
    if (id === undefined) return true;
    return typeof id === 'string';
}

export function isExistingItem(id: string | number | undefined): boolean {
    if (id === undefined) return false;
    return typeof id === 'number';
}

export interface CreateClassroom {
    name: string;
    description: string;
    type: ClassroomType;
    coverUrl: string;
    oneTimePayment?: number;
    timeUnlockInDays?: number;
    modules: Module[];
}

export type Step = 'classroom-details' | 'module-details';
export type ModalMode = 'view' | 'create' | 'edit';
