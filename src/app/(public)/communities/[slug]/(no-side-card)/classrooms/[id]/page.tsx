import { getCommunityBySlug } from "@/action/communities";
import { notFound } from "next/navigation";
import ClassroomModal from "../_components/create-classroom-modal";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ClassroomViewer from "./_components/classroom-viewer";
import { Tables } from "@/database.types";
import { getClassroom, createMemberClassroomProgress } from "@/action/classroom";
import { getUserMembership } from "@/utils/get-user-membership";
import { getUserData } from "@/utils/get-user-data";
import { CommunityMemberStatus } from "@/enums/enums";

export default async function ClassroomPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
    const { slug, id } = await params;

    // Get community to get communityId
    const { data: community, error: communityError } = await getCommunityBySlug(slug);

    if (communityError || !community) {
        return notFound();
    }

    // Parse classroom ID from URL
    const classroomId = parseInt(id, 10);
    if (isNaN(classroomId)) {
        return notFound();
    }

    // Get user first to pass to getClassroom
    const user = await getUserData();
    
    const classroom: Awaited<ReturnType<typeof getClassroom>> = await getClassroom(classroomId, user?.id || '');
    if (classroom.error || !classroom.data) {
        return notFound();
    }

    // Get membership data
    const membership = await getUserMembership(community.id);

    // Get progress data for this classroom
    const supabase = await createSupabaseServerClient();
    let progressLessons: number[] = [];
    
    if (user) {
        const { data: progressData } = await supabase
            .from("community_member_classrooms")
            .select("progress_lessons")
            .eq("user_id", user.id)
            .eq("community_id", community.id)
            .eq("classroom_id", classroomId)
            .single();

        if (progressData?.progress_lessons) {
            try {
                progressLessons = JSON.parse(progressData.progress_lessons);
            } catch (e) {
                progressLessons = [];
            }
        }

        // Create progress row for free classrooms if user is active member
        if (membership?.member_status === CommunityMemberStatus.ACTIVE) {
            const classroomData = classroom.data as any;
            
            // For PUBLIC and PRIVATE (free) classrooms, create progress record
            if (classroomData.type === "PUBLIC" || classroomData.type === "PRIVATE") {
                await createMemberClassroomProgress(user.id, community.id, classroomId);
            }
        }
    }

    return (
        <>
            <ClassroomViewer 
                classroom={classroom.data} 
                userId={user?.id || null}
                communityId={community.id}
                progressLessons={progressLessons}
            />
        </>
    );
}