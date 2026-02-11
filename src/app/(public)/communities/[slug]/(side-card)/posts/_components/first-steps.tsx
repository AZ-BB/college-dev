import { Community } from "@/action/communities";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { Check } from "lucide-react";
import { CommunityMemberStatus } from "@/enums/enums";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { cn } from "@/lib/utils";

export default async function FirstSteps({ community }: { community: Community }) {

    const hasAboutSection = community.community_text_blocks.length > 0;
    const hasCoverImage = community.cover_image !== null && community.cover_image !== "";
    const hasPosts = community.posts_count.length > 0;

    const supabase = await createSupabaseServerClient();
    const { data: members, error: membersError } = await supabase.from("community_members").select("id")
        .eq("community_id", community.id)
        .in("member_status", [CommunityMemberStatus.ACTIVE, CommunityMemberStatus.PENDING])
        .limit(3);

    const hasInviteSection = members?.length && members.length > 0;

    const isFirstStepCompleted = hasAboutSection && hasCoverImage && hasPosts && hasInviteSection;

    if (isFirstStepCompleted) {
        return null;
    }

    return (
        <Card className="p-4">
            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1" className="py-0">
                    <AccordionTrigger className="cursor-pointer pl-1 hover:no-underline py-0 text-lg font-bold" iconClassName="size-7">
                        First Steps
                    </AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 py-2">
                        <div className="space-y-4">
                            <Link
                                href={`/communities/${community.slug}`}
                                className="justify-between text-sm py-3 items-center bg-grey-200 font-medium flex rounded-lg p-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.99984 18.3307C14.5832 18.3307 18.3332 14.5807 18.3332 9.9974C18.3332 5.41406 14.5832 1.66406 9.99984 1.66406C5.4165 1.66406 1.6665 5.41406 1.6665 9.9974C1.6665 14.5807 5.4165 18.3307 9.99984 18.3307Z" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10 6.66406V10.8307" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.99561 13.3359H10.0031" stroke="#0E1011" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

                                    Complete "About" section
                                </div>

                                <div className={cn("rounded-full flex items-center justify-center", hasAboutSection ? "bg-orange-500 text-white p-1" : "border-2 p-0.5 border-grey-600 text-grey-600")}>
                                    <Check className="size-4" />
                                </div>
                            </Link>

                            <Link
                                href={`/communities/${community.slug}`}
                                className="justify-between text-sm py-3 items-center bg-grey-200 font-medium flex rounded-lg p-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.0002 9.9974C12.3013 9.9974 14.1668 8.13192 14.1668 5.83073C14.1668 3.52954 12.3013 1.66406 10.0002 1.66406C7.69898 1.66406 5.8335 3.52954 5.8335 5.83073C5.8335 8.13192 7.69898 9.9974 10.0002 9.9974Z" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2.8418 18.3333C2.8418 15.1083 6.05013 12.5 10.0001 12.5C10.8001 12.5 11.5751 12.6083 12.3001 12.8083" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M18.3332 14.9974C18.3332 15.2641 18.2998 15.5224 18.2332 15.7724C18.1582 16.1057 18.0248 16.4307 17.8498 16.7141C17.2748 17.6807 16.2165 18.3307 14.9998 18.3307C14.1415 18.3307 13.3665 18.0057 12.7832 17.4724C12.5332 17.2557 12.3165 16.9974 12.1498 16.7141C11.8415 16.2141 11.6665 15.6224 11.6665 14.9974C11.6665 14.0974 12.0248 13.2724 12.6082 12.6724C13.2165 12.0474 14.0665 11.6641 14.9998 11.6641C15.9832 11.6641 16.8748 12.0891 17.4748 12.7724C18.0082 13.3641 18.3332 14.1474 18.3332 14.9974Z" stroke="#0E1011" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16.2416 14.9844H13.7583" stroke="#0E1011" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15 13.7656V16.2573" stroke="#0E1011" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>


                                    Invite 3 people
                                </div>

                                <div className={cn("rounded-full flex items-center justify-center", hasInviteSection ? "bg-orange-500 text-white p-1" : "border-2 p-0.5 border-grey-600 text-grey-600")}>
                                    <Check className="size-4" />
                                </div>
                            </Link>

                        </div>

                        <div className="space-y-4 font-medium">
                            <Link
                                href={`/communities/${community.slug}`}
                                className="justify-between text-sm py-3 items-center bg-grey-200 font-medium flex rounded-lg p-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.50016 8.33333C8.42064 8.33333 9.16683 7.58714 9.16683 6.66667C9.16683 5.74619 8.42064 5 7.50016 5C6.57969 5 5.8335 5.74619 5.8335 6.66667C5.8335 7.58714 6.57969 8.33333 7.50016 8.33333Z" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M10.8332 1.66406H7.49984C3.33317 1.66406 1.6665 3.33073 1.6665 7.4974V12.4974C1.6665 16.6641 3.33317 18.3307 7.49984 18.3307H12.4998C16.6665 18.3307 18.3332 16.6641 18.3332 12.4974V8.33073" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M13.125 4.16406H17.7083" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M15.4165 6.45833V1.875" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M2.2251 15.7938L6.33343 13.0354C6.99176 12.5938 7.94176 12.6437 8.53343 13.1521L8.80843 13.3937C9.45843 13.9521 10.5084 13.9521 11.1584 13.3937L14.6251 10.4188C15.2751 9.86042 16.3251 9.86042 16.9751 10.4188L18.3334 11.5854" stroke="#0E1011" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>



                                    Set cover image
                                </div>

                                <div className={cn("rounded-full flex items-center justify-center", hasCoverImage ? "bg-orange-500 text-white p-1" : "border-2 p-0.5 border-grey-600 text-grey-600")}>
                                    <Check className="size-4" />
                                </div>
                            </Link>


                            <Link
                                href={`/communities/${community.slug}`}
                                className="justify-between text-sm py-3 items-center bg-grey-200 font-medium flex rounded-lg p-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.99984 17.0807H5.83317C3.33317 17.0807 1.6665 15.8307 1.6665 12.9141V7.08073C1.6665 4.16406 3.33317 2.91406 5.83317 2.91406H14.1665C16.6665 2.91406 18.3332 4.16406 18.3332 7.08073V9.58073" stroke="#0E1011" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M14.1668 7.5L11.5585 9.58333C10.7002 10.2667 9.29183 10.2667 8.43349 9.58333L5.8335 7.5" stroke="#0E1011" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16.0085 12.3056L13.0585 15.2556C12.9419 15.3723 12.8335 15.589 12.8085 15.7473L12.6502 16.8723C12.5919 17.2806 12.8752 17.564 13.2835 17.5057L14.4085 17.3473C14.5669 17.3223 14.7919 17.214 14.9002 17.0973L17.8502 14.1473C18.3585 13.639 18.6002 13.0473 17.8502 12.2973C17.1085 11.5557 16.5169 11.7973 16.0085 12.3056Z" stroke="#0E1011" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M15.5835 12.7344C15.8335 13.6344 16.5335 14.3344 17.4335 14.5844" stroke="#0E1011" strokeWidth="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

                                    Write your first post
                                </div>

                                <div className={cn("rounded-full  flex items-center justify-center", hasPosts ? "bg-orange-500 text-white p-1" : "border-2 p-0.5 border-grey-600 text-grey-600")}>
                                    <Check className="size-4" />
                                </div>
                            </Link>

                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    )
}