"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useRef } from "react";
import { useUser } from "@/context/userContext";
import ImageScroller from "@/components/ui/ImageScroller";
import { motion } from "framer-motion";
import { timeAgo } from "@/lib/utils";
import SearchWithModal from "@/components/ui/searchBox";

// ── Dynamic import of MapWidget (no SSR) ─────────────────────────────
const DashboardMap = dynamic(() => import("@/components/ui/DashboardMap"), {
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
        <div className="min-h-screen bg-black text-white flex justify-center w-full">
            <div className="flex w-full max-w-5xl">
                <div className=" w-11/12 border-r border-gray-800 p-4">
                    <h2 className="text-xl font-bold mb-4 text-center text-teal-100">
                        See what's happening at {user?.address.pincode}
                    </h2>
                    <div className="space-y-4">
                        {posts.map((post, index) => (
                            <div
                                key={post._id || index}
                                className="border-2 border-gray-700 bg-[#1A1A1A] rounded-lg shadow-md hover:shadow-xl hover:border-gray-500 transition-all duration-300 min-h-[25vh] flex flex-col justify-center"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <div className="m-2 flex flex-col justify-center h-full pl-2">
                                        <h3 className="font-bold text-2xl mb-2 text-white/90">
                                            {post.title}
                                        </h3>
                                        <ImageScroller
                                            images={post.images || []}
                                        />
                                        <p className="text-gray-300 leading-relaxed">
                                            {post.description}
                                        </p>
                                        <span className="text-gray-500 text-xs uppercase tracking-wide">
                                            {timeAgo(post.post_date)}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <SearchWithModal />
                <DashboardMap locations={posts} />
            </div>
        </div>
    );
};

export default HomePage;
