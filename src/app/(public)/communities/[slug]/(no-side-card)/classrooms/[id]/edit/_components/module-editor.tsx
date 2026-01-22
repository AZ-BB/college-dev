import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import TransferIcon from "@/components/icons/transfer";
import EditIcon from "@/components/icons/edit";
import TrashIcon from "@/components/icons/trash";
import { LessonEditor } from "./lesson-editor";
import { LessonContentBadge } from "@/components/lesson-content-badge";
import { useClassroomEditorContext } from "./classroom-editor-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Module } from "./types";
import { LessonResourceType } from "@/enums/enums";
import { Tables } from "@/database.types";

export function ModuleEditor() {
    const {
        classroom,
        selectedModuleId,
        selectedLessonId,
        deleteModule,
        addLesson,
        transferLesson,
        setSelectedLessonId,
        deleteLesson,
        updateModuleInfo,
        duplicateModule,
    } = useClassroomEditorContext();

    const [showResources, setShowResources] = useState(false);

    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [lessonToTransfer, setLessonToTransfer] = useState<{ lessonId: number | string } | null>(null);
    const [selectedTargetModule, setSelectedTargetModule] = useState<string>("");

    const modules = useMemo(() => {
        return classroom.modules.filter(m => m.isDeleted === false);
    }, [classroom.modules]);

    const availableModules = useMemo(() => {
        if (selectedModuleId === null) return [];
        return modules.filter(module => module.id !== selectedModuleId);
    }, [modules, selectedModuleId]);

    const handleOpenTransferModal = (lessonId: number | string) => {
        setLessonToTransfer({ lessonId });
        setSelectedTargetModule("");
        setTransferModalOpen(true);
    };

    const handleConfirmTransfer = () => {
        if (lessonToTransfer && selectedTargetModule !== "" && selectedModuleId !== null) {
            // Find the target module to get its actual ID type (number or string)
            const targetModule = availableModules.find(m => String(m.id) === selectedTargetModule);

            if (targetModule) {
                transferLesson(
                    targetModule.id, // Use the actual ID from the module object
                    selectedModuleId,
                    lessonToTransfer.lessonId
                );
            }

            setTransferModalOpen(false);
            setLessonToTransfer(null);
            setSelectedTargetModule("");
        }
    };

    const handleCancelTransfer = () => {
        setTransferModalOpen(false);
        setLessonToTransfer(null);
        setSelectedTargetModule("");
    };

    if (selectedModuleId === null) {
        return (
            <>
                <div className="space-y-6">
                    {modules.map((module) => (
                        <div key={`module-${module.id}`} className="space-y-6">
                            <input
                                className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-gray-400"
                                type="text"
                                placeholder="Module Name"
                                value={module.name}
                                onChange={(e) => updateModuleInfo(module.id, { name: e.target.value })}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        className="rounded-[12px] py-5 text-sm font-semibold"
                                        onClick={() => addLesson(module.id)}
                                    >
                                        Add Lesson
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        className="rounded-[12px] py-5 text-sm font-semibold"
                                        onClick={() => duplicateModule(module.id)}
                                    >
                                        Duplicate module
                                    </Button>
                                </div>

                                <button
                                    className="rounded-[12px] py-5 px-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-[#EA4335] cursor-pointer"
                                    disabled={classroom.modules.length === 1}
                                    onClick={() => deleteModule(module.id)}
                                >
                                    Delete module
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <TransferDialog
                    open={transferModalOpen}
                    onOpenChange={setTransferModalOpen}
                    availableModules={availableModules}
                    selectedTargetModule={selectedTargetModule}
                    onSelectedTargetModuleChange={setSelectedTargetModule}
                    onConfirm={handleConfirmTransfer}
                    onCancel={handleCancelTransfer}
                />
            </>
        );
    }

    if (selectedModuleId !== null && selectedLessonId === null) {
        const module = classroom.modules.find(m => m.id === selectedModuleId);
        if (!module) {
            return null;
        }

        const lessons = module.lessons.filter(l => l.isDeleted === false);
        return (
            <>
                <div className="space-y-6">
                    <div className="font-semibold text-xl px-4">
                        <p>
                            {module.name || "Module Name"}
                        </p>

                        <p className="flex text-sm items-center gap-1 cursor-pointer" onClick={() => setShowResources(!showResources)}>
                            View all resources in this module <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showResources ? "rotate-180" : "")} onClick={() => setShowResources(!showResources)} />
                        </p>

                        <div className={cn("w-full space-y-4 py-4 transition-all duration-300", showResources ? "opacity-100" : "opacity-0 h-0")}>
                            {
                                lessons.flatMap((lesson) => lesson.resources).length > 0 && lessons.map((lesson) => {
                                    if (lesson.resources?.length === 0) {
                                        return null;
                                    }
                                    return (
                                        <div key={lesson.id} className="flex flex-col justify-start items-start gap-3 pb-3 border-b border-grey-200">
                                            <p className="text-sm font-medium">{lesson.name || "Lesson Name"}</p>

                                            <div className="flex gap-6 ">
                                                {
                                                    lesson.resources?.map((resource, index) => (
                                                        resource.type === LessonResourceType.LINK ? (
                                                            <a
                                                                key={index}
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm text-orange-500">
                                                                <span>
                                                                    {resource.link_name || resource.file_name || "Resource"}
                                                                </span>

                                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.75 8.25156L15.9 2.10156" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M16.5004 5.1V1.5H12.9004" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M8.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V9.75" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </a>
                                                        ) : (
                                                            <a
                                                                key={index}
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm text-orange-500">
                                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.15016 8.84968L8.09263 9.90718C7.50763 10.4922 7.50763 11.4447 8.09263 12.0297C8.67763 12.6147 9.63015 12.6147 10.2151 12.0297L11.8802 10.3647C13.0502 9.19469 13.0502 7.29719 11.8802 6.11969C10.7102 4.94969 8.81264 4.94969 7.63514 6.11969L5.82016 7.93467C4.81516 8.93967 4.81516 10.5672 5.82016 11.5722" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V6.75C16.5 3 15 1.5 11.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5Z" stroke="#F7670E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>

                                                                <span className="truncate max-w-[200px]">
                                                                    {resource.link_name || resource.file_name || "Resource"}
                                                                </span>
                                                            </a>
                                                        )
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            {
                                lessons.flatMap((lesson) => lesson.resources).length === 0 && (
                                    <div className="flex flex-col justify-start items-start gap-3 pb-3 border-b border-grey-200">
                                        <p className="text-sm font-medium">No resources found</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>

                    <div className="space-y-2 pt-3">
                        {
                            lessons.map((lesson) => {
                                const handleLessonClick = () => {
                                    // If the lesson is already selected, deselect it (go back to module view)
                                    if (selectedLessonId === lesson.id) {
                                        setSelectedLessonId(null);
                                    } else {
                                        // Otherwise, select this lesson
                                        setSelectedLessonId(lesson.id);
                                    }
                                };

                                return (
                                    <div key={`lesson-${lesson.id}`}
                                        onClick={handleLessonClick}
                                        className={cn(
                                            "cursor-pointer group hover:translate-x-2 transition-all duration-300 px-4 bg-transparent py-2 group rounded-lg flex items-center justify-between hover:bg-grey-200",
                                            selectedLessonId === lesson.id ? "bg-grey-200" : ""
                                        )}
                                    >
                                        <div className="font-medium">
                                            <div className="text-lg">
                                                {lesson.name || "Lesson Name"}
                                            </div>

                                            <LessonContentBadge lesson={lesson as unknown as Tables<"lessons"> & { lesson_resources: Tables<"lesson_resources">[] }} />
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                                <EditIcon className="w-5 h-5 stroke-grey-900" />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenTransferModal(lesson.id);
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                                <TransferIcon className="w-5 h-5 stroke-grey-900" />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteLesson(selectedModuleId, lesson.id)
                                                }}
                                                className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
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
                                onClick={() => addLesson(selectedModuleId)}
                            >
                                Add Lesson
                            </Button>

                            <Button
                                variant="secondary"
                                className="rounded-[12px] py-5 text-sm font-semibold"
                                onClick={() => duplicateModule(selectedModuleId)}
                            >
                                Duplicate module
                            </Button>
                        </div>

                        <button
                            className="rounded-[12px] py-5 px-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-[#EA4335] cursor-pointer"
                            disabled={classroom.modules.length === 1}
                            onClick={() => deleteModule(selectedModuleId)}
                        >
                            Delete module
                        </button>
                    </div>
                </div>
                <TransferDialog
                    open={transferModalOpen}
                    onOpenChange={setTransferModalOpen}
                    availableModules={availableModules}
                    selectedTargetModule={selectedTargetModule}
                    onSelectedTargetModuleChange={setSelectedTargetModule}
                    onConfirm={handleConfirmTransfer}
                    onCancel={handleCancelTransfer}
                />
            </>
        );
    }

    if (selectedModuleId !== null && selectedLessonId !== null) {
        const module = classroom.modules.find(m => m.id === selectedModuleId);
        if (!module) {
            return null;
        }
        const lesson = module.lessons.find(l => l.id === selectedLessonId);
        if (!lesson) {
            return null;
        }
        return (
            <>
                <LessonEditor />
                <TransferDialog
                    open={transferModalOpen}
                    onOpenChange={setTransferModalOpen}
                    availableModules={availableModules}
                    selectedTargetModule={selectedTargetModule}
                    onSelectedTargetModuleChange={setSelectedTargetModule}
                    onConfirm={handleConfirmTransfer}
                    onCancel={handleCancelTransfer}
                />
            </>
        );
    }

    return null;
}

interface TransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableModules: Module[];
    selectedTargetModule: string;
    onSelectedTargetModuleChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

function TransferDialog({
    open,
    onOpenChange,
    availableModules,
    selectedTargetModule,
    onSelectedTargetModuleChange,
    onConfirm,
    onCancel,
}: TransferDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Move Lesson</DialogTitle>
                    <DialogDescription className="text-grey-700">
                        Move lesson to a different module
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="target-module" className="text-sm font-medium">
                            Choose Module
                        </label>
                        <Select
                            value={selectedTargetModule}
                            onValueChange={onSelectedTargetModuleChange}
                        >
                            <SelectTrigger id="target-module" className="w-full py-6 cursor-pointer">
                                <SelectValue placeholder="Select a module..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModules.map((module) => (
                                    <SelectItem className="cursor-pointer" key={`module-${module.id}`} value={String(module.id)}>
                                        {module.name || `Module ${module.index + 1}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-2">
                    <Button
                        className="w-full py-7"
                        onClick={onConfirm} disabled={selectedTargetModule === ""}>
                        Add Topic
                    </Button>
                    <Button variant="secondary" className="w-full py-7" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
