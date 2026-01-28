/**
 * Utilities for posts filters (topic, sortBy).
 * Canonical URL shape and validation.
 */

export const VALID_SORT_VALUES = ["new", "top"] as const;
export type PostsSortBy = "default" | (typeof VALID_SORT_VALUES)[number];

/** Build canonical query string: omits "all" and "default". */
export function buildPostsQueryString(topic: string, sortBy: string): string {
    const p = new URLSearchParams();
    if (topic !== "all") p.set("topic", topic);
    if (sortBy !== "default") p.set("sortBy", sortBy);
    return p.toString();
}

/** Validate sortBy from raw search param; fallback to "default". */
export function validateSortBy(raw: string | undefined): PostsSortBy {
    const normalized = typeof raw === "string" ? raw.trim().toLowerCase() : undefined;
    return normalized && VALID_SORT_VALUES.includes(normalized as "new" | "top")
        ? (normalized as PostsSortBy)
        : "default";
}

/** Validate topic from raw search param against allowed ids; fallback to "all". */
export function validateTopic(
    raw: string | undefined,
    validTopicIds: Set<string>
): string {
    const normalized = typeof raw === "string" ? raw.trim() : undefined;
    return normalized && validTopicIds.has(normalized) ? normalized : "all";
}

/** Human-readable label for sortBy (e.g. "default" → "Default"). */
export function formatSortByLabel(sortBy: string): string {
    return sortBy ? sortBy.charAt(0).toUpperCase() + sortBy.slice(1) : "Default";
}
