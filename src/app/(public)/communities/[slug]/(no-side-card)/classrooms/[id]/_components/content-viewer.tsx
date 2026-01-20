'use client';
import { Tables } from "@/database.types";
import { LessonResourceType, VideoType } from "@/enums/enums";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeftIcon } from "lucide-react";
import { useState } from "react";
import { LessonContentBadge } from "./lesson-content-badge";
import { Classroom } from "../page";

export function ContentViewer({
    selectedModuleIndex,
    setSelectedModuleIndex,
    selectedLessonIndex,
    setSelectedLessonIndex,
    classroom
}: {
    selectedModuleIndex: number | null;
    setSelectedModuleIndex: (index: number | null) => void;
    selectedLessonIndex: number | null;
    setSelectedLessonIndex: (index: number | null) => void;
    classroom: Classroom
}) {
    const [showResources, setShowResources] = useState(false);

    if (selectedModuleIndex === null) {
        return (
            <>
                <div className="space-y-6">
                    {classroom.modules.map((module: any) => (
                        <div key={`module-${module.index}`} className="space-y-6">
                            <input
                                className="w-full text-xl font-medium border-none outline-none ring-0 placeholder:text-gray-400"
                                type="text"
                                placeholder="Module Name"
                                value={module.name || "Module Name"}
                                readOnly={true}
                            />
                        </div>
                    ))}
                </div>
            </>
        );
    }

    if (selectedModuleIndex !== null && selectedLessonIndex === null) {
        return (
            <>
                <div className="space-y-6">
                    <div className="font-semibold text-xl px-4">
                        <p>
                            {classroom.modules[selectedModuleIndex].name || "Module Name"}
                        </p>

                        <p className="flex text-sm items-center gap-1 cursor-pointer"
                            onClick={() => setShowResources(!showResources)}
                        >
                            View all resources in this module <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showResources ? "rotate-180" : "")} />
                        </p>

                        {
                            showResources && (
                                <div className="w-full space-y-4 py-4 transition-all duration-300">
                                    {
                                        classroom.modules[selectedModuleIndex].lessons.flatMap((lesson: any) => lesson.lesson_resources).length > 0 &&
                                        classroom.modules[selectedModuleIndex].lessons.map((lesson: any) => {
                                            if (lesson.lesson_resources?.length === 0) {
                                                return null;
                                            }
                                            return (
                                                <div key={lesson.index} className="flex flex-col justify-start items-start gap-3 pb-3 border-b border-grey-200">
                                                    <p className="text-sm font-medium">{lesson.name || "Lesson Name"}</p>

                                                    <div className="flex gap-6 ">
                                                        {
                                                            lesson.lesson_resources?.map((resource: any, index: number) => (
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
                                        classroom.modules[selectedModuleIndex].lessons.flatMap((lesson: any) => lesson.lesson_resources).length === 0 && (
                                            <div className="flex flex-col justify-start items-start gap-3 pb-3 border-b border-grey-200">
                                                <p className="text-sm font-medium">No resources for this module</p>
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }

                    </div>

                    <div className="space-y-2 pt-3">
                        {
                            classroom.modules[selectedModuleIndex].lessons.map((lesson: any, arrayIndex: number) => {
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
                                    </div>
                                );
                            })
                        }
                    </div>

                </div>
            </>
        );
    }


    const getEmbedUrl = (videoUrl: string, videoType?: VideoType): string => {
        if (!videoType) return "";

        switch (videoType) {
            case VideoType.YOUTUBE:
                const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
                if (youtubeMatch) {
                    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                }
                break;
            case VideoType.LOOM:
                const loomMatch = videoUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
                if (loomMatch) {
                    return `https://www.loom.com/embed/${loomMatch[1]}`;
                }
                break;
            case VideoType.VIMEO:
                const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
                if (vimeoMatch) {
                    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                }
                break;
        }
        return "";
    };


    if (selectedModuleIndex !== null && selectedLessonIndex !== null) {
        return (
            <div className="space-y-4">
                <div
                    className="font-semibold text-base cursor-pointer flex items-center gap-1 hover:underline"
                    onClick={() => setSelectedLessonIndex(null)}
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    {classroom.modules[selectedModuleIndex].name || "Module Name"}
                </div>

                <div className="text-xl font-semibold py-3">
                    {classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex]?.name || "Lesson Name"}
                </div>

                {/* Video content */}
                {classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].video_url && classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].video_type && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                        <iframe
                            src={getEmbedUrl(classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].video_url || "", classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].video_type as VideoType)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Text content */}
                {classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].text_content && (
                    <div className="whitespace-pre-wrap text-sm text-grey-900">
                        {classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].text_content || ""}
                    </div>
                )}

                {/* Resources list */}
                {classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].lesson_resources && classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].lesson_resources.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base text-grey-900">Resources</h3>
                        <div className="space-y-2">
                            {classroom.modules[selectedModuleIndex].lessons[selectedLessonIndex].lesson_resources.map((resource: Tables<"lesson_resources">, index: number) => (
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={index}
                                    className="flex items-center justify-between py-1.5 pl-3 pr-3 rounded-[14px] bg-grey-200 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        {
                                            resource.type === LessonResourceType.LINK ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M13.0598 10.9375C15.3098 13.1875 15.3098 16.8275 13.0598 19.0675C10.8098 21.3075 7.16985 21.3175 4.92985 19.0675C2.68985 16.8175 2.67985 13.1775 4.92985 10.9375" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M10.5909 13.4128C8.25094 11.0728 8.25094 7.27281 10.5909 4.92281C12.9309 2.57281 16.7309 2.58281 19.0809 4.92281C21.4309 7.26281 21.4209 11.0628 19.0809 13.4128" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12.2009 11.8022L10.7908 13.2122C10.0108 13.9922 10.0108 15.2622 10.7908 16.0422C11.5708 16.8222 12.8408 16.8222 13.6208 16.0422L15.8409 13.8222C17.4009 12.2622 17.4009 9.73219 15.8409 8.16219C14.2809 6.60219 11.7508 6.60219 10.1808 8.16219L7.76086 10.5822C6.42086 11.9222 6.42086 14.0922 7.76086 15.4322" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )
                                        }
                                        <span className="text-sm font-medium text-grey-900">{resource.link_name || resource.file_name || "Resource"}</span>

                                    </div>

                                    <div className="cursor-pointer">
                                        <svg className="size-5" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.834 9.16927L17.6673 2.33594" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M18.334 5.66406V1.66406H14.334" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M9.16602 1.66406H7.49935C3.33268 1.66406 1.66602 3.33073 1.66602 7.4974V12.4974C1.66602 16.6641 3.33268 18.3307 7.49935 18.3307H12.4993C16.666 18.3307 18.3327 16.6641 18.3327 12.4974V10.8307" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>

                                </a>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        );
    }
}