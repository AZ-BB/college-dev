'use client';
import BookIcon from "@/components/icons/book";
import GroupIcon from "@/components/icons/group";
import InfoIcon from "@/components/icons/info";
import MemberIcon from "@/components/icons/member";
import Tabs from "@/components/tabs";
import { useUserAccess } from "@/contexts/access-context";
import { CommunityMemberStatus, UserAccess } from "@/enums/enums";

export default function CommunityTabs({ slug }: { slug: string }) {
    const { userAccess, isCommunityPrivate, userStatus } = useUserAccess();
    const hideTabs = (userAccess === UserAccess.ANONYMOUS ||
        userAccess === UserAccess.NOT_MEMBER ||
        userStatus === CommunityMemberStatus.PENDING) && isCommunityPrivate;

    if (hideTabs) {
        return null;
    }

    const tabs = [
        { label: "Community", value: "community", href: `/communities/${slug}/posts`, icon: GroupIcon },
        { label: "Classrooms", value: "classrooms", href: `/communities/${slug}/classrooms`, icon: BookIcon },
        { label: "Members", value: "members", href: `/communities/${slug}/members`, icon: MemberIcon },
        { label: "About", value: "about", href: `/communities/${slug}`, icon: InfoIcon }
    ]

    return <Tabs tabs={tabs} />;
}