import { Tables } from "@/database.types";

export function LessonContentBadge({
    lesson,
}: {
    lesson: Tables<"lessons"> & { lesson_resources: Tables<"lesson_resources">[] };
}) {

    const hasVideo = lesson.video_url !== null;
    const hasResources = lesson.lesson_resources && lesson.lesson_resources.length > 0;
    const hasText = lesson.text_content !== null;

    return (
        <div className="text-sm flex items-center gap-1 text-grey-600 min-h-6">
            {
                hasVideo && (
                    <>
                        <div className="text-sm flex items-center gap-1 text-grey-600">
                            Video
                        </div>
                        <span className="last:hidden h-1 w-1 bg-grey-600 rounded-full inline-block mx-1" />
                    </>
                )
            }

            {
                hasResources && (
                    <>
                        <div className="text-sm flex items-center gap-1 text-grey-600">
                            Resources {hasResources ? lesson.lesson_resources?.length : 0}
                        </div>
                        <span className="last:hidden h-1 w-1 bg-grey-600 rounded-full inline-block mx-1" />
                    </>
                )
            }

            {
                !hasVideo && !hasResources && hasText && (
                    <>
                        <div className="text-sm flex items-center gap-1 text-grey-600">
                            Text
                        </div>
                        <span className="last:hidden h-1 w-1 bg-grey-600 rounded-full inline-block mx-1" />
                    </>
                )
            }

            {
                !hasVideo && !hasResources && !hasText && (
                    <div className="text-sm flex items-center gap-1 text-grey-600">
                        No content
                    </div>
                )
            }
        </div >
    );
}