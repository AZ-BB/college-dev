import { Tables } from "@/database.types";

export type Resource = Omit<Tables<"lesson_resources">, 'id' | 'lesson_id'> & {
    id: string | number; // UUID for new, number for existing from DB
    lesson_id: number | string; // UUID for new, number for existing from DB

    isDeleted: boolean;
}

export type Lesson = Omit<Tables<"lessons">, 'id' | 'module_id'> & {
    id: string | number; // UUID for new, number for existing from DB
    module_id: number | string; // UUID for new, number for existing from DB

    resources: Resource[];

    isReorded: boolean;
    isTransefered: boolean;
    isDeleted: boolean;
    isEdited: boolean;
}

export type Module = Omit<Tables<"modules">, 'id'> & {
    id: string | number; // UUID for new, number for existing from DB
    lessons: Lesson[];

    isDeleted: boolean;
    isEdited: boolean;
}

export type Classroom = Tables<"classrooms"> & {
    modules: Module[];

    isInfoEdited: boolean;
    isCoverEdited: boolean;
}
