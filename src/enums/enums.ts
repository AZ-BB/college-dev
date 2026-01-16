export enum CommunityRole {
    OWNER = "OWNER",
    MEMBER = "MEMBER",
    ADMIN = "ADMIN"
}

export enum AudienceSize {
    UNDER_10K = "UNDER_10K",
    _10K_TO_100K = "10K_TO_100K",
    _100K_TO_1M = "100K_TO_1M",
    OVER_1M = "OVER_1M"
}

export enum CommunityMemberStatus {
    PENDING = "PENDING",
    BANNED = "BANNED",
    ACTIVE = "ACTIVE",
    LEAVING_SOON = "LEAVING_SOON",
    CHURNED = "CHURNED"
}

export enum VideoType {
    YOUTUBE = "YOUTUBE",
    LOOM = "LOOM",
    VIMEO = "VIMEO"
}

export enum LessonResourceType {
    FILE = "FILE",
    LINK = "LINK"
}

export enum ClassroomType {
    PRIVATE = "PRIVATE",
    PUBLIC = "PUBLIC",
    ONE_TIME_PAYMENT = "ONE_TIME_PAYMENT",
    TIME_UNLOCK = "TIME_UNLOCK"
}

export enum CommunityPricingType {
    FREE = "FREE",
    SUB = "SUB",
    ONE_TIME = "ONE_TIME"
}