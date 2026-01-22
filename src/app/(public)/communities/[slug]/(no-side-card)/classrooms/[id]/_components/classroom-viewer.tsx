'use client';
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { LessonContentBadge } from "../../../../../../../../components/lesson-content-badge";
import { ContentViewer } from "./content-viewer";
import { Tables } from "@/database.types";
import { getClassroom } from "@/action/classroom";
import { Button } from "@/components/ui/button";


export default function ClassroomViewer({ classroom }: { classroom: Awaited<ReturnType<typeof getClassroom>>["data"] }) {
    const params = useParams();

    const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);

    const handleModuleSelect = (moduleIndex: number) => {
        if (selectedModuleIndex === moduleIndex) {
            setSelectedModuleIndex(null);
        } else {
            setSelectedModuleIndex(moduleIndex);
        }
    };

    const handleLessonSelect = (lessonIndex: number) => {
        if (selectedLessonIndex === lessonIndex) {
            setSelectedLessonIndex(null);
        } else {
            setSelectedLessonIndex(lessonIndex);
        }
    };

    return (
        <Dialog open={true} onOpenChange={() => { }}>

            <DialogContent fullScreen showCloseButton={false} className="overflow-y-auto pt-16">
                <DialogTitle>
                    <div className="w-full border-b h-16 fixed top-0 left-0 right-0 bg-white z-10">
                        <div className="max-w-6xl h-full mx-auto w-full flex justify-between items-center">
                            <div className="flex gap-2 items-center">

                                <Link href={`/communities/${params.slug}/classrooms`}>
                                    <ArrowLeft className="size-5" />
                                </Link>


                                <span className="font-bold text-base">
                                    {classroom?.name}
                                </span>
                            </div>

                            <Link href={`/communities/${params.slug}/classrooms/${classroom?.id}/edit`}>
                                <Button variant="secondary" className="rounded-[12px] py-5 px-8 text-sm font-semibold">
                                    Edit Course
                                </Button>
                            </Link>
                        </div>
                    </div>
                </DialogTitle>


                <div className="max-w-6xl mx-auto gap-10 w-full h-[calc(100vh-100px)] flex items-start">

                    <div className="w-1/4 space-y-6">
                        {classroom?.modules?.map((module: any, moduleArrayIndex: number) => (
                            <div key={moduleArrayIndex} className="">
                                <div className={cn(
                                    "cursor-pointer bg-transparent py-2 group px-4 rounded-lg flex items-center justify-between",
                                    selectedModuleIndex === moduleArrayIndex ? "bg-grey-200" : ""
                                )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleModuleSelect(moduleArrayIndex);
                                    }}
                                >
                                    <div className="font-bold text-lg">
                                        {`${moduleArrayIndex + 1}. ${module.name || "Module Name"}`}
                                    </div>
                                    <div className="flex items-center gap-1">

                                        <button
                                            className="cursor-pointer focus-visible:outline-none"

                                        >
                                            <ChevronDown className={`${selectedModuleIndex === moduleArrayIndex ? "rotate-180" : ""}`} />
                                        </button>
                                    </div>
                                </div>

                                {
                                    selectedModuleIndex === moduleArrayIndex && (
                                        <div className="flex flex-col pl-4">
                                            {module.lessons.map((lesson: Tables<"lessons"> & { lesson_resources: Tables<"lesson_resources">[] }, lessonArrayIndex: number) => (
                                                <div
                                                    key={lessonArrayIndex}
                                                    className="border-l-2 border-grey-200 pl-2 py-0.5 pr-4 first:pt-2"
                                                    onClick={() => handleLessonSelect(lessonArrayIndex)}
                                                >
                                                    <div className={cn(
                                                        "cursor-pointer group hover:bg-grey-300 transition-all h-16 px-4 rounded-lg space-y-1 flex items-center justify-between",
                                                        selectedLessonIndex === lessonArrayIndex ? "bg-grey-200" : ""
                                                    )}>
                                                        <div>
                                                            <div className="font-medium text-base">
                                                                {lesson.name || "Lesson Name"}
                                                            </div>
                                                            <LessonContentBadge lesson={lesson} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }

                            </div>
                        ))}
                    </div>

                    <div className="w-3/4 pb-20">
                        <ContentViewer
                            selectedModuleIndex={selectedModuleIndex}
                            setSelectedModuleIndex={setSelectedModuleIndex}
                            selectedLessonIndex={selectedLessonIndex}
                            setSelectedLessonIndex={setSelectedLessonIndex}
                            classroom={classroom}
                        />
                    </div>
                </div>


            </DialogContent>
        </Dialog>
    );
}