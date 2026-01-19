import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useClassroomContext } from "./classroom-context";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import TransferIcon from "@/components/icons/transfer";
import EditIcon from "@/components/icons/edit";
import TrashIcon from "@/components/icons/trash";
import { LessonEditor } from "./lesson-editor";
import { LessonContentBadge } from "./lesson-content-badge";
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
        handleTransferLesson,
        setSelectedLessonIndex,
        mode,
    } = useClassroomContext();

    const [showResources, setShowResources] = useState(false);

    const isReadOnly = mode === 'view';
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [lessonToTransfer, setLessonToTransfer] = useState<{ moduleIndex: number; lessonId: string | number } | null>(null);
    const [selectedTargetModule, setSelectedTargetModule] = useState<string>("");

    const modules = useMemo(() => {
        return classroomData.modules;
    }, [classroomData.modules]);

    const availableModules = useMemo(() => {
        if (selectedModuleIndex === null) return [];
        return modules
            .map((module, idx) => ({ module, index: idx }))
            .filter(({ index }) => index !== selectedModuleIndex);
    }, [modules, selectedModuleIndex]);

    const handleOpenTransferModal = (moduleIndex: number, lessonId: string | number) => {
        setLessonToTransfer({ moduleIndex, lessonId });
        setSelectedTargetModule("");
        setTransferModalOpen(true);
    };

    const handleConfirmTransfer = () => {
        if (lessonToTransfer && selectedTargetModule !== "") {
            const targetModuleIndex = parseInt(selectedTargetModule);
            handleTransferLesson(lessonToTransfer.moduleIndex, lessonToTransfer.lessonId, targetModuleIndex);
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

    if (selectedModuleIndex === null) {
        return (
            <>
                <div className="space-y-6">
                    {classroomData.modules.map((module) => (
                        <div key={`module-${module.index}`} className="space-y-6">
                            <input
                                className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-gray-400"
                                type="text"
                                placeholder="Module Name"
                                value={module.name}
                                onChange={(e) => !isReadOnly && handleModuleNameChange(module.index, e.target.value)}
                                readOnly={isReadOnly}
                                disabled={isReadOnly}
                            />

                            {!isReadOnly && (
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
                            )}
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

    if (selectedModuleIndex !== null && selectedLessonIndex === null) {
        return (
            <>
                <div className="space-y-6">
                    <div className="font-semibold text-xl px-4">
                        <p>
                            {classroomData.modules[selectedModuleIndex].name || "Module Name"}
                        </p>

                        <p className="flex text-sm items-center gap-1 cursor-pointer" onClick={() => setShowResources(!showResources)}>
                            View all resources in this module <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showResources ? "rotate-180" : "")} onClick={() => setShowResources(!showResources)} />
                        </p>

                        <div className={cn("w-full space-y-4 py-4 transition-all duration-300", showResources ? "opacity-100" : "opacity-0 h-0")}>
                            {
                                modules[selectedModuleIndex].lessons.flatMap((lesson) => lesson.resources).length > 0 && modules[selectedModuleIndex].lessons.map((lesson) => {
                                    if (lesson.resources?.length === 0) {
                                        return null;
                                    }
                                    return (
                                        <div key={lesson.index} className="flex flex-col justify-start items-start gap-3 pb-3 border-b border-grey-200">
                                            <p className="text-sm font-medium">{lesson.name || "Lesson Name"}</p>

                                            <div className="flex gap-6 ">
                                                {
                                                    lesson.resources?.map((resource) => (
                                                        resource.type === LessonResourceType.LINK ? (
                                                            <a
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm text-orange-500">
                                                                <span>
                                                                    {resource.name}
                                                                </span>

                                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.75 8.25156L15.9 2.10156" stroke="#F7670E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                    <path d="M16.5004 5.1V1.5H12.9004" stroke="#F7670E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                    <path d="M8.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V9.75" stroke="#F7670E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                </svg>
                                                            </a>
                                                        ) : (
                                                            <a
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 text-sm text-orange-500">
                                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.15016 8.84968L8.09263 9.90718C7.50763 10.4922 7.50763 11.4447 8.09263 12.0297C8.67763 12.6147 9.63015 12.6147 10.2151 12.0297L11.8802 10.3647C13.0502 9.19469 13.0502 7.29719 11.8802 6.11969C10.7102 4.94969 8.81264 4.94969 7.63514 6.11969L5.82016 7.93467C4.81516 8.93967 4.81516 10.5672 5.82016 11.5722" stroke="#F7670E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                    <path d="M6.75 16.5H11.25C15 16.5 16.5 15 16.5 11.25V6.75C16.5 3 15 1.5 11.25 1.5H6.75C3 1.5 1.5 3 1.5 6.75V11.25C1.5 15 3 16.5 6.75 16.5Z" stroke="#F7670E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                                </svg>

                                                                <span className="truncate max-w-[200px]">
                                                                    {resource.name}
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
                                modules[selectedModuleIndex].lessons.flatMap((lesson) => lesson.resources).length === 0 && (
                                    <div className="flex flex-col justify-start items-start gap-3 pb-3 border-b border-grey-200">
                                        <p className="text-sm font-medium">No resources found</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>

                    <div className="space-y-2 pt-3">
                        {
                            modules[selectedModuleIndex].lessons.map((lesson, arrayIndex) => {
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

                                            <LessonContentBadge lesson={lesson} />
                                        </div>

                                        {!isReadOnly && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                                    <EditIcon className="w-5 h-5 stroke-grey-900" />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenTransferModal(selectedModuleIndex, lesson.id);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                                    <TransferIcon className="w-5 h-5 stroke-grey-900" />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteLesson(selectedModuleIndex, lesson.id)
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-grey-300 transition-all duration-300 cursor-pointer">
                                                    <TrashIcon className="w-5 h-5 stroke-grey-900" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>

                    {!isReadOnly && (
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
                    )}
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

    if (selectedModuleIndex !== null && selectedLessonIndex !== null) {
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

    return (
        <TransferDialog
            open={transferModalOpen}
            onOpenChange={setTransferModalOpen}
            availableModules={availableModules}
            selectedTargetModule={selectedTargetModule}
            onSelectedTargetModuleChange={setSelectedTargetModule}
            onConfirm={handleConfirmTransfer}
            onCancel={() => {
                setTransferModalOpen(false);
                setLessonToTransfer(null);
                setSelectedTargetModule("");
            }}
        />
    );
}

interface TransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableModules: Array<{ module: Module; index: number }>;
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
                                {availableModules.map(({ module, index }) => (
                                    <SelectItem className="cursor-pointer" key={`module-${index}`} value={index.toString()}>
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
