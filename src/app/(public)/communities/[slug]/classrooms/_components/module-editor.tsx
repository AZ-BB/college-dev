import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useClassroomContext } from "./classroom-context";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import TransferIcon from "@/components/icons/transfer";
import EditIcon from "@/components/icons/edit";
import TrashIcon from "@/components/icons/trash";
import { LessonEditor } from "./lesson-editor";

export function ModuleEditor() {
    const {
        classroomData,
        selectedModuleIndex,
        selectedLessonIndex,
        handleModuleNameChange,
        handleLessonNameChange,
        handleAddLesson,
        handleDuplicateModule,
        handleDeleteModule,
        handleDuplicateLesson,
        handleDeleteLesson,
        setSelectedLessonIndex,
    } = useClassroomContext();

    const modules = useMemo(() => {
        return classroomData.modules;
    }, [classroomData.modules]);

    if (selectedModuleIndex === null) {
        return (
            <div className="space-y-6">
                {classroomData.modules.map((module) => (
                    <div key={`module-${module.index}`} className="space-y-6">
                        <input
                            className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-gray-400"
                            type="text"
                            placeholder="Module Name"
                            value={module.name}
                            onChange={(e) => handleModuleNameChange(module.index, e.target.value)}
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    className="rounded-[12px] py-5 text-sm font-semibold"
                                    onClick={() => handleAddLesson(module.index)}
                                >
                                    Add Lesson
                                </Button>

                                <Button
                                    variant="secondary"
                                    className="rounded-[12px] py-5 text-sm font-semibold"
                                    onClick={() => handleDuplicateModule(module.index)}
                                >
                                    Duplicate module
                                </Button>
                            </div>

                            <button
                                className="rounded-[12px] py-5 px-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-[#EA4335] cursor-pointer"
                                disabled={classroomData.modules.length === 1}
                                onClick={() => handleDeleteModule(module.index)}
                            >
                                Delete module
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (selectedModuleIndex !== null && selectedLessonIndex === null) {
        return (
            <div className="space-y-6">
                <div className="font-semibold text-xl px-4">
                    <p>
                        {classroomData.modules[selectedModuleIndex].name || "Module Name"}
                    </p>

                    <p className="flex text-sm">
                        View all resources in this module <ChevronDown className="w-4 h-4" />
                    </p>
                </div>

                <div className="space-y-2 pt-3">
                    {
                        modules[selectedModuleIndex].lessons.map((lesson) => {
                            const handleLessonClick = () => {
                                // If the lesson is already selected, deselect it (go back to module view)
                                if (selectedLessonIndex === lesson.index) {
                                    setSelectedLessonIndex(null);
                                } else {
                                    // Otherwise, select this lesson
                                    setSelectedLessonIndex(lesson.index);
                                }
                            };

                            return (
                                <div key={`lesson-${lesson.index}`}
                                    onClick={handleLessonClick}
                                    className={cn(
                                        "cursor-pointer group hover:translate-x-2 transition-all duration-300 px-4 bg-transparent py-2 group rounded-lg flex items-center justify-between hover:bg-grey-200",
                                        selectedLessonIndex === lesson.index ? "bg-grey-200" : ""
                                    )}
                                >
                                    <div className="font-medium">
                                        <div className="text-lg">
                                            {lesson.name || "Lesson Name"}
                                        </div>

                                        <div className="text-sm flex items-center gap-1 text-grey-600">
                                            Video <span className="h-1 w-1 bg-grey-600 rounded-full inline-block mx-1" /> 2 Resources
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                            <EditIcon className="w-5 h-5 stroke-grey-900" />
                                        </button>

                                        <button className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                            <TransferIcon className="w-5 h-5 stroke-grey-900" />
                                        </button>

                                        <button className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                            <TrashIcon className="w-5 h-5 stroke-grey-900" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            className="rounded-[12px] py-5 text-sm font-semibold"
                            onClick={() => handleAddLesson(selectedModuleIndex)}
                        >
                            Add Lesson
                        </Button>

                        <Button
                            variant="secondary"
                            className="rounded-[12px] py-5 text-sm font-semibold"
                            onClick={() => handleDuplicateModule(selectedModuleIndex)}
                        >
                            Duplicate module
                        </Button>
                    </div>

                    <button
                        className="rounded-[12px] py-5 px-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-[#EA4335] cursor-pointer"
                        disabled={classroomData.modules.length === 1}
                        onClick={() => handleDeleteModule(selectedModuleIndex)}
                    >
                        Delete module
                    </button>
                </div>
            </div>
        );
    }

    if (selectedModuleIndex !== null && selectedLessonIndex !== null) {
        return <LessonEditor />;
    }

    return null;
}
