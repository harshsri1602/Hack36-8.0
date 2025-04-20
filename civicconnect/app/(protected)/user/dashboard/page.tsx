// pages/index.tsx
"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useRef } from "react";
import { useUser } from "@/context/userContext";
import { PostCard } from "@/components/ui/user/PostCard";
import LatestPostsSidebar from "@/components/ui/user/LatestPostsSidebar";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// ── Dynamic import of MapWidget (no SSR) ─────────────────────────────
const MapWidget = dynamic(() => import("@/components/ui/user/MapWidget"), {
    ssr: false,
});

interface ApiPost {
    _id: string;
    title: string;
    description?: string;
    images?: string[];
    state: string;
    latitude: number;
    longitude: number;
    comments: any[];
    post_date: string;
    votes: { userId: string; voteType: number }[];
}

const HomePage: NextPage = () => {
    const { user } = useUser();
    const [posts, setPosts] = useState<ApiPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ApiPost[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const latestPosts = useMemo(
        () =>
            [...posts]
                .sort(
                    (a, b) =>
                        new Date(b.post_date).getTime() -
                        new Date(a.post_date).getTime()
                )
                .slice(0, 5) // or however many you want
                .map((p) => ({ id: p._id, title: p.title })),
        [posts]
    );

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            console.log(searchQuery);
            try {
                const res = await fetch(
                    `http://localhost:8000/api/v1/user/searchPosts?prefix=${searchQuery}`,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    console.log(data.message);
                }

                setSearchResults(
                    Array.isArray(data.filteredPosts)
                        ? data.filteredPosts.slice(0, 5)
                        : []
                );
            } catch (err) {
                console.error("Search error:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    useEffect(() => {
        if (!user?.address?.pincode) {
            setLoading(false);
            return;
        }

        const fetchRegionPosts = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/v1/user/viewRegion",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch posts");
                }
                setPosts(Array.isArray(data.posts) ? data.posts : []);
            } catch (err) {
                console.error(err);
                setError("Could not load posts for your region.");
            } finally {
                setLoading(false);
            }
        };

        fetchRegionPosts();
    }, [user]);

    return (
        <div className="min-h-screen bg-black text-white">
            <div
                className="
          w-full max-w-screen-2xl mx-auto
          grid grid-cols-[4fr_3fr] grid-rows-[auto_auto]
          gap-y-8 gap-x-24 py-12 px-4
        "
            >
                {/* POSTS in first column */}
                <main className="row-start-1 col-start-1 space-y-8 pl-1">
                    <div className="ml-51 transform -translate-x-1/2 z-50 w-full max-w-md px-4 relative">
                        <div className="bg-[#1F1F1F] border border-gray-700 rounded-2xl shadow-lg p-4">
                            <Input
                                placeholder="Search posts…"
                                className="bg-[#2A2A2A] text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <div className="absolute top-full left-0 w-full mt-2 rounded-lg bg-[#2A2A2A] border border-gray-700 shadow-lg overflow-hidden max-h-96 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="px-4 py-2 text-sm text-gray-400">
                                            Searching...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((result) => (
                                            <Link
                                                key={result._id}
                                                href={`/user/${result._id}`}
                                                passHref
                                            >
                                                <div className="px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer">
                                                    {result.title}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-400">
                                            No results found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div>Loading posts…</div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : posts.length === 0 ? (
                        <div>No problems reported in your region.</div>
                    ) : (
                        posts.map((p) => (
                            <PostCard
                                key={p._id}
                                id={p._id}
                                title={p.title}
                                descriptionText={p.description}
                                descriptionImageSrc={p.images?.[0]}
                                commentsCount={p.comments.length}
                                status={p.state}
                                userVoted={
                                    p.votes.some(
                                        (vote) => vote.userId === user?._id
                                    )
                                        ? true
                                        : false
                                }
                                vote={
                                    p.votes.find(
                                        (vote) => vote.userId === user?._id
                                    )?.voteType ?? 0
                                }
                            />
                        ))
                    )}
                </main>

                {/* sidebar+map in second column */}
                <div
                    className="
            row-start-1 row-span-2
            col-start-2 col-span-2
            border-l border-gray-700 pl-6 pr-[15%]
            sticky top-12 self-start
            flex flex-col space-y-8
          "
                >
                    <LatestPostsSidebar latest={latestPosts} />
                    <MapWidget posts={posts} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
