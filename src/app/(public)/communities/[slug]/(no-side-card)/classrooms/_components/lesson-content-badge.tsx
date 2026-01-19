import { Lesson } from "./types";

export function LessonContentBadge({
    lesson,
}: {
    lesson: Lesson;
}) {

    const hasVideo = lesson.hasVideo;
    const hasResources = lesson.resources && lesson.resources.length > 0;
    const hasText = lesson.hasText;

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
                            Resources {hasResources ? lesson.resources?.length : 0}
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