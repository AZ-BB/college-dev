import { ClassroomType, LessonResourceType, VideoType } from "@/enums/enums";

export interface Resource {
    name: string;
    url: string;
    type: LessonResourceType;
}

export interface Lesson {
    id: string;
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
    name: string;
    index: number;
    lessons: Lesson[];
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
