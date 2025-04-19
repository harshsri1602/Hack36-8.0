// pages/index.tsx
"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/context/userContext";
import { PostCard } from "@/components/ui/user/PostCard";
import LatestPostsSidebar from "@/components/ui/user/LatestPostsSidebar";

// ── Dynamic import of MapWidget (no SSR) ─────────────────────────────
const MapWidget = dynamic(
  () => import("@/components/ui/user/MapWidget"),
  { ssr: false }
);

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

    useEffect(() => {
        console.log(posts);
    }, [posts]);

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
