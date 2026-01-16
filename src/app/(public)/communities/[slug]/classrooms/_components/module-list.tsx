import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useClassroomContext } from "./classroom-context";
import { SortableLessonItem } from "./sortable-lesson-item";

export function ModuleList() {
    const {
        classroomData,
        selectedModuleIndex,
        selectedLessonIndex,
        handleModuleSelect,
        handleAddModule,
        handleAddLesson,
        handleDragEnd,
        setSelectedLessonIndex,
    } = useClassroomContext();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <div className="w-1/4 space-y-6">
            <div className="font-semibold">
                {classroomData.name}
            </div>

            <Button
                onClick={handleAddModule}
                variant="secondary"
                className="w-full rounded-[12px] py-5 text-sm font-semibold"
            >
                Add Module
            </Button>

            {classroomData.modules.map((module) => (
                <div key={module.index} className="">
                    <div className={cn(
                        "cursor-pointer bg-transparent py-2 group px-4 rounded-lg flex items-center justify-between",
                        selectedModuleIndex === module.index ? "bg-grey-200" : ""
                    )}>
                        <div className="font-bold text-lg">
                            {`${module.index + 1}. ${module.name || "Module Name"}`}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                className="group-hover:opacity-100 opacity-0 transition-opacity duration-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddLesson(module.index);
                                }}
                            >
                                <svg className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C17.5 2 22 6.5 22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2Z" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 12H16" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 8V16" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <button
                                className="cursor-pointer focus-visible:outline-none"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleModuleSelect(module.index);
                                }}
                            >
                                <ChevronDown className={`${selectedModuleIndex === module.index ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                    </div>
                    {selectedModuleIndex === module.index && (
                        <div className="pl-4">
                            {module.lessons.length > 0 ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) => handleDragEnd(event, module.index)}
                                >
                                    <SortableContext
                                        items={module.lessons.map(lesson => lesson.index)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {module.lessons.map((lesson) => (
                                            <SortableLessonItem
                                                key={lesson.index}
                                                lesson={lesson}
                                                moduleIndex={module.index}
                                                setSelectedLesson={setSelectedLessonIndex}
                                                selectedLesson={selectedLessonIndex}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="text-sm text-grey-500">
                                    No lessons added yet
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
