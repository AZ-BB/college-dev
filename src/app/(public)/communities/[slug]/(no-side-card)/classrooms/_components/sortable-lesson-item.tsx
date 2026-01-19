import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Lesson } from "./types";
import { LessonContentBadge } from "./lesson-content-badge";

interface SortableLessonItemProps {
    lesson: Lesson;
    moduleIndex: number;
    selectedLesson: number | null;
    setSelectedLesson: (index: number | null) => void;
}

export function SortableLessonItem({
    lesson,
    moduleIndex,
    selectedLesson,
    setSelectedLesson,
}: SortableLessonItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: String(lesson.index) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleLessonClick = () => {
        // If the lesson is already selected, deselect it (go back to module view)
        if (selectedLesson === lesson.index) {
            setSelectedLesson(null);
        } else {
            // Otherwise, select this lesson
            setSelectedLesson(lesson.index);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="border-l-2 border-grey-200 pl-2 py-1 pr-4"
            onClick={handleLessonClick}
        >
            <div className={cn(
                "cursor-pointer group hover:bg-grey-300 transition-all h-16 px-4 rounded-lg space-y-1 flex items-center justify-between",
                selectedLesson === lesson.index ? "bg-grey-200" : ""
            )}>
                <div>
                    <div className="font-medium text-base">
                        {lesson.name || "Lesson Name"}
                    </div>
                    <LessonContentBadge lesson={lesson} />
                </div>

                {
                    selectedLesson === lesson.index && (
                        <button
                            className="cursor-grab active:cursor-grabbing"
                            {...attributes}
                            {...listeners}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M8.25 7.125C8.25 6.97726 8.2791 6.83097 8.33564 6.69448C8.39217 6.55799 8.47504 6.43397 8.5795 6.3295C8.68397 6.22504 8.80799 6.14217 8.94448 6.08564C9.08097 6.0291 9.22726 6 9.375 6C9.52274 6 9.66903 6.0291 9.80552 6.08564C9.94201 6.14217 10.066 6.22504 10.1705 6.3295C10.275 6.43397 10.3578 6.55799 10.4144 6.69448C10.4709 6.83097 10.5 6.97726 10.5 7.125C10.5 7.42337 10.3815 7.70952 10.1705 7.9205C9.95952 8.13147 9.67337 8.25 9.375 8.25C9.07663 8.25 8.79048 8.13147 8.5795 7.9205C8.36853 7.70952 8.25 7.42337 8.25 7.125ZM13.5 7.125C13.5 6.82663 13.6185 6.54048 13.8295 6.3295C14.0405 6.11853 14.3266 6 14.625 6C14.9234 6 15.2095 6.11853 15.4205 6.3295C15.6315 6.54048 15.75 6.82663 15.75 7.125C15.75 7.42337 15.6315 7.70952 15.4205 7.9205C15.2095 8.13147 14.9234 8.25 14.625 8.25C14.3266 8.25 14.0405 8.13147 13.8295 7.9205C13.6185 7.70952 13.5 7.42337 13.5 7.125ZM8.25 11.9925C8.25 11.8448 8.2791 11.6985 8.33564 11.562C8.39217 11.4255 8.47504 11.3015 8.5795 11.197C8.68397 11.0925 8.80799 11.0097 8.94448 10.9531C9.08097 10.8966 9.22726 10.8675 9.375 10.8675C9.52274 10.8675 9.66903 10.8966 9.80552 10.9531C9.94201 11.0097 10.066 11.0925 10.1705 11.197C10.275 11.3015 10.3578 11.4255 10.4144 11.562C10.4709 11.6985 10.5 11.8448 10.5 11.9925C10.5 12.2909 10.3815 12.577 10.1705 12.788C9.95952 12.999 9.67337 13.1175 9.375 13.1175C9.07663 13.1175 8.79048 12.999 8.5795 12.788C8.36853 12.577 8.25 12.2909 8.25 11.9925ZM13.5 11.9925C13.5 11.6941 13.6185 11.408 13.8295 11.197C14.0405 10.986 14.3266 10.8675 14.625 10.8675C14.9234 10.8675 15.2095 10.986 15.4205 11.197C15.6315 11.408 15.75 11.6941 15.75 11.9925C15.75 12.2909 15.6315 12.577 15.4205 12.788C15.2095 12.999 14.9234 13.1175 14.625 13.1175C14.3266 13.1175 14.0405 12.999 13.8295 12.788C13.6185 12.577 13.5 12.2909 13.5 11.9925ZM8.25 16.875C8.25 16.7273 8.2791 16.581 8.33564 16.4445C8.39217 16.308 8.47504 16.184 8.5795 16.0795C8.68397 15.975 8.80799 15.8922 8.94448 15.8356C9.08097 15.7791 9.22726 15.75 9.375 15.75C9.52274 15.75 9.66903 15.7791 9.80552 15.8356C9.94201 15.8922 10.066 15.975 10.1705 16.0795C10.275 16.184 10.3578 16.308 10.4144 16.4445C10.4709 16.581 10.5 16.7273 10.5 16.875C10.5 17.1734 10.3815 17.4595 10.1705 17.6705C9.95952 17.8815 9.67337 18 9.375 18C9.07663 18 8.79048 17.8815 8.5795 17.6705C8.36853 17.4595 8.25 17.1734 8.25 16.875ZM13.5 16.875C13.5 16.5766 13.6185 16.2905 13.8295 16.0795C14.0405 15.8685 14.3266 15.75 14.625 15.75C14.9234 15.75 15.2095 15.8685 15.4205 16.0795C15.6315 16.2905 15.75 16.5766 15.75 16.875C15.75 17.1734 15.6315 17.4595 15.4205 17.6705C15.2095 17.8815 14.9234 18 14.625 18C14.3266 18 14.0405 17.8815 13.8295 17.6705C13.6185 17.4595 13.5 17.1734 13.5 16.875Z" fill="#0E1011" />
                            </svg>
                        </button>
                    )
                }
            </div>
        </div>
    );
}
