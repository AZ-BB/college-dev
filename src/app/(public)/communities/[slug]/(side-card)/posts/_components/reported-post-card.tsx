"use client";
import { PostReportWithDetails } from "@/action/posts-reports";
import { Card } from "@/components/ui/card";
import UserAvatar from "@/components/user-avatart";
import VideoThumbnail from "@/components/video-thumbnail";
import { formatFullName } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tables } from "@/database.types";
import { getRules } from "@/action/rules";
import { useEffect, useState } from "react";
import { deletePostReport } from "@/action/posts-reports";
import { deletePost } from "@/action/posts";
import { toast } from "sonner";

export default function ReportedPostCard({ 
    report, 
    topics 
}: { 
    report: PostReportWithDetails; 
    topics: Tables<"topics">[] 
}) {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const post = report.posts;
    const [rules, setRules] = useState<Tables<"community_rules">[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (post.community_id) {
            loadRules();
        }
    }, [post.community_id]);

    const loadRules = async () => {
        const result = await getRules(post.community_id);
        if (!result.error && result.data) {
            setRules(result.data);
        }
    };

    const handleCardClick = () => {
        router.push(`/communities/${slug}/posts/${post.id}`);
    };

    const handleKeepPost = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessing) return;

        setIsProcessing(true);
        const result = await deletePostReport(report.id);

        if (result.error) {
            toast.error(result.message || "Failed to delete report");
        } else {
            toast.success(result.message || "Report deleted successfully");
            router.refresh();
        }
        setIsProcessing(false);
    };

    const handleRemovePost = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessing) return;

        setIsProcessing(true);
        const result = await deletePost(post.id);

        if (result.error) {
            toast.error(result.message || "Failed to delete post");
        } else {
            toast.success(result.message || "Post deleted successfully");
            router.refresh();
        }
        setIsProcessing(false);
    };

    // Parse rules_ids string to array of numbers
    const ruleIds = report.rules_ids
        ? report.rules_ids.split(",").map((id) => parseInt(id.trim())).filter((id) => !isNaN(id))
        : [];

    // Get rule texts
    const reportedRules = rules.filter((rule) => ruleIds.includes(rule.id));

    return (
        <Card 
            className="shadow-none border-grey-200 px-6 py-4 flex flex-col gap-4 cursor-pointer hover:shadow-sm transition-all duration-300"
            onClick={handleCardClick}
        >
            {/* Original Post Content */}
            <div className="flex flex-row gap-4 justify-between">
                <div className="flex flex-col gap-4 justify-between flex-1">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Link href={`/profile/${post.users.username}`} onClick={(e) => e.stopPropagation()}>
                                <UserAvatar className="w-11 h-11 rounded-[16px]" user={post.users} />
                            </Link>
                            <div className="flex flex-col gap-0.5 items-start text-base font-medium">
                                <Link 
                                    href={`/profile/${post.users.username}`} 
                                    className="font-semibold hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {formatFullName(post.users.first_name, post.users.last_name)}
                                </Link>
                                <span className="text-grey-700 text-sm font-medium">
                                    {format(new Date(post.created_at), "MMM d, yyyy")} | {topics.find((t) => t.id === post.topic_id)?.name ?? ""}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold">{post.title}</h3>
                            <p className="text-sm text-grey-600 font-medium line-clamp-2">{post.content}</p>
                        </div>

                        {post.poll && (
                            <div className="w-fit text-sm font-medium text-orange-500 bg-orange-50 rounded-full px-2 py-1 flex items-center gap-1">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_36878_5161)">
                                        <path d="M1.3335 14.6693H14.6668M6.00016 5.73594C6.00016 5.45304 5.88778 5.18173 5.68774 4.98169C5.4877 4.78165 5.21639 4.66927 4.9335 4.66927H3.06683C2.78393 4.66927 2.51262 4.78165 2.31258 4.98169C2.11254 5.18173 2.00016 5.45304 2.00016 5.73594V14.6693M6.00016 14.6693V2.4026C6.00016 2.11971 6.11254 1.8484 6.31258 1.64836C6.51262 1.44832 6.78393 1.33594 7.06683 1.33594H8.9335C9.21639 1.33594 9.4877 1.44832 9.68774 1.64836C9.88778 1.8484 10.0002 2.11971 10.0002 2.4026V14.6693M14.0002 14.6693V9.06927C14.0002 8.78637 13.8878 8.51506 13.6877 8.31502C13.4877 8.11498 13.2164 8.0026 12.9335 8.0026H11.0668C10.7839 8.0026 10.5126 8.11498 10.3126 8.31502C10.1125 8.51506 10.0002 8.78637 10.0002 9.06927" stroke="#F7670E" strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_36878_5161">
                                            <rect width="16" height="16" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                Poll
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.47998 18.3505L10.58 20.7505C10.98 21.1505 11.88 21.3505 12.48 21.3505H16.28C17.48 21.3505 18.78 20.4505 19.08 19.2505L21.48 11.9505C21.98 10.5505 21.08 9.35046 19.58 9.35046H15.58C14.98 9.35046 14.48 8.85046 14.58 8.15046L15.08 4.95046C15.28 4.05046 14.68 3.05046 13.78 2.75046C12.98 2.45046 11.98 2.85046 11.58 3.45046L7.47998 9.55046" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" />
                                <path d="M2.37988 18.3484V8.54844C2.37988 7.14844 2.97988 6.64844 4.37988 6.64844H5.37988C6.77988 6.64844 7.37988 7.14844 7.37988 8.54844V18.3484C7.37988 19.7484 6.77988 20.2484 5.37988 20.2484H4.37988C2.97988 20.2484 2.37988 19.7484 2.37988 18.3484Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{post.likes_count ?? 0}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <svg className="size-6" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.4698 16.83L18.8598 19.99C18.9598 20.82 18.0698 21.4 17.3598 20.97L13.1698 18.48C12.7098 18.48 12.2599 18.45 11.8199 18.39C12.5599 17.52 12.9998 16.42 12.9998 15.23C12.9998 12.39 10.5398 10.09 7.49985 10.09C6.33985 10.09 5.26985 10.42 4.37985 11C4.34985 10.75 4.33984 10.5 4.33984 10.24C4.33984 5.68999 8.28985 2 13.1698 2C18.0498 2 21.9998 5.68999 21.9998 10.24C21.9998 12.94 20.6098 15.33 18.4698 16.83Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13 15.2337C13 16.4237 12.56 17.5237 11.82 18.3937C10.83 19.5937 9.26 20.3637 7.5 20.3637L4.89 21.9137C4.45 22.1837 3.89 21.8137 3.95 21.3037L4.2 19.3337C2.86 18.4037 2 16.9137 2 15.2337C2 13.4737 2.94 11.9237 4.38 11.0037C5.27 10.4237 6.34 10.0938 7.5 10.0938C10.54 10.0938 13 12.3937 13 15.2337Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{post.comment_count ?? 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    {post.video_url && (
                        <div className="py-4">
                            <VideoThumbnail url={post.video_url} className="w-48 h-32 mt-5" />
                        </div>
                    )}

                    {post.video_url === null && post.attachments.length > 0 && (
                        <div>
                            <Image 
                                src={post.attachments[0].url} 
                                alt={post.attachments[0].name} 
                                width={160} 
                                height={160} 
                                className="w-40 h-40 rounded-md object-cover mt-8" 
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Report Details Section */}
            <div className="border-t border-grey-200 pt-4 mt-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="text-sm font-medium text-grey-900">
                            Reported by{" "}
                            <span className="text-orange-500 font-semibold">
                                {formatFullName(report.users.first_name, report.users.last_name)}
                            </span>
                        </div>
                        
                        {reportedRules.length > 0 && (
                            <div className="text-sm text-grey-700">
                                {reportedRules.map((rule, index) => (
                                    <span key={rule.id}>
                                        Breaks Rule #{rule.index + 1}: {rule.rule}
                                        {index < reportedRules.length - 1 && ", "}
                                    </span>
                                ))}
                            </div>
                        )}

                        {report.description && (
                            <div className="text-sm text-grey-600 mt-1">
                                {report.description}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                            onClick={handleKeepPost}
                            disabled={isProcessing}
                            className="bg-green-500 hover:bg-green-600 text-white text-sm rounded-[10px] px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Processing..." : "Keep Post"}
                        </Button>
                        <Button
                            onClick={handleRemovePost}
                            disabled={isProcessing}
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white text-sm rounded-[10px] px-5 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? "Processing..." : "Remove Post"}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
