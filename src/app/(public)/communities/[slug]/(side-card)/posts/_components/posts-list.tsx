"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { PostList, getPosts } from "@/action/posts";
import PostCard from "./post-card";
import { Tables } from "@/database.types";
import { UserData } from "@/utils/get-user-data";

interface PostsListProps {
    initalPosts: PostList[];
    communityId: number;
    topic: string;
    sortBy: string;
    topics: Tables<"topics">[];
    userId?: string | null;
    user?: UserData | null;
}

export default function PostsList({ initalPosts, communityId, topic, sortBy, topics, userId, user }: PostsListProps) {
    const [posts, setPosts] = useState<PostList[]>(initalPosts);
    const [offset, setOffset] = useState(10);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initalPosts.length === 10);
    const observerTarget = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    // Reset posts when filters change (initialPosts prop changes)
    useEffect(() => {
        setPosts(initalPosts);
        setOffset(10);
        setHasMore(initalPosts.length === 10);
        loadingRef.current = false;
    }, [initalPosts]);

    const loadMorePosts = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;

        loadingRef.current = true;
        setLoading(true);
        try {
            const response = await getPosts(communityId, topic, sortBy, {
                limit: 10,
                offset: offset,
            }, userId);

            if (response.data) {
                const newPosts = response.data;
                setPosts((prev) => [...prev, ...newPosts]);
                setOffset((prev) => prev + 10);
                setHasMore(newPosts.length === 10);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading more posts:", error);
            setHasMore(false);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [communityId, topic, sortBy, offset, hasMore]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
                    loadMorePosts();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadMorePosts]);

    return (
        <div className="space-y-4 pt-4">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} topics={topics} user={user} />
            ))}
            {hasMore && (
                <div ref={observerTarget} className="h-10 flex items-center justify-center">
                    {loading && <p className="text-sm text-muted-foreground">Loading more posts...</p>}
                </div>
            )}
        </div>
    );
}