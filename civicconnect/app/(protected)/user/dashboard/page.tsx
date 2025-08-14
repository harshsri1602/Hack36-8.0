"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo, useRef } from "react";
import { useUser } from "@/context/userContext";
import ImageScroller from "@/components/ui/ImageScroller";
import { motion } from "framer-motion";
import { timeAgo } from "@/lib/utils";
import SearchWithModal from "@/components/ui/searchBox";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/post";

const DashboardMap = dynamic(() => import("@/components/ui/DashboardMap"), {
    ssr: false,
});

const HomePage: NextPage = () => {
    const { user } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    type Priority = "Low" | "Medium" | "High" | "Critical" | "None";
    const SEVERITY_COLORS: Record<Priority, string> = {
        Low: "text-green-500",
        Medium: "text-blue-500",
        High: "text-yellow-400",
        Critical: "text-red-500",
        None: "text-gray-400",
    };

    const DOWN_ARROW_COLOR = "text-gray-400";

    const PRIORITY_BORDER_COLORS: Record<Priority, string> = {
        Low: "border-green-600",
        Medium: "border-blue-600",
        High: "border-yellow-500",
        Critical: "border-red-600",
        None: "text-gray-400",
    };

    const badgePrio = (num: number) => {
        return num === 0
            ? "Low"
            : num === 1
            ? "Medium"
            : num === 2
            ? "High"
            : num === 3
            ? "Critical"
            : "Low";
    };

    const PrioVote = (num: number) => {
        return num === 0
            ? "Low"
            : num === 1
            ? "Medium"
            : num === 2
            ? "High"
            : num === 3
            ? "Critical"
            : "None";
    };

    const updateVote = async (id: string, vote: number) => {
        try {
            setLoading(true);
            console.log(id, vote, PrioVote(vote));
            const res = await fetch("http://localhost:8000/api/v1/user/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    post_id: id,
                    voteType: vote,
                }),
            });
            const data = await res.json();
            console.log("Response:", res.status, data);
        } catch (err) {
            console.error("Vote update failed:", err);
        } finally {
            setLoading(false);
        }
    };

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
                for (let i = 0; i < data.posts.length; i++) {
                    const temp = data.posts[i];
                    const num =
                        temp.lowCount +
                            temp.mediumCount +
                            temp.highCount +
                            temp.criticalCount || 1;
                    temp.weightedSeverity = Math.round(
                        (temp.lowCount * 0 +
                            temp.mediumCount * 1 +
                            temp.highCount * 2 +
                            temp.criticalCount * 3) /
                            num
                    );

                    for (let index = 0; index < temp.votes.length; index++) {
                        if (user._id === temp.votes[index].userId) {
                            temp.currentUserVoted = true;
                            temp.currentVoteType = temp.votes[index].voteType;
                        }
                    }
                }
                setPosts(Array.isArray(data.posts) ? data.posts : []);
                console.log(data.posts);
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
                <div className={`w-11/12 border-r p-4 border-gray-800`}>
                    <h2 className="text-xl font-bold mb-4 text-center text-teal-100">
                        See what's happening at {user?.address.pincode}
                    </h2>
                    <div className="space-y-4">
                        {posts.map((post, index) => (
                            <div
                                key={post._id || index}
                                onClick={() => {
                                    router.push(`/user/${post._id}`);
                                }}
                                className={`cursor-pointer border-2  ${
                                    PRIORITY_BORDER_COLORS[
                                        badgePrio(post.weightedSeverity || 0)
                                    ]
                                } bg-[#1A1A1A] rounded-lg shadow-md hover:shadow-xl hover:border-white transition-all duration-300 min-h-[25vh] flex flex-col justify-center`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.05,
                                    }}
                                >
                                    <div className="flex flex-row items-start rounded-lg p-4 gap-4">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Button
                                                onClick={(e)=> {
                                                    e.stopPropagation();
                                                    const newVoteType = Math.min(3, post.currentUserVoted ? post.currentVoteType + 1: 0)
                                                    updateVote(post._id, newVoteType);
                                                    if (post.currentUserVoted) {
                                                        if (post.currentVoteType === 0) {
                                                            post.lowCount -= 1
                                                            post.mediumCount += 1
                                                        }
                                                        else if (post.currentVoteType === 1) {
                                                            post.mediumCount -= 1
                                                            post.highCount += 1
                                                        }
                                                        else if (post.currentVoteType === 2) {
                                                            post.highCount -= 1
                                                            post.criticalCount += 1
                                                        }
                                                    }
                                                    else {
                                                        post.lowCount += 1
                                                    }
                                                    const num = post.lowCount + post.mediumCount + post.highCount + post.criticalCount || 1;
                                                    post.weightedSeverity = Math.round(
                                                        (post.lowCount * 0 +
                                                            post.mediumCount * 1 +
                                                            post.highCount * 2 +
                                                            post.criticalCount * 3) /
                                                            num
                                                    );
                                                    post.currentUserVoted = true;
                                                    post.currentVoteType = newVoteType;
                                                }}
                                                className={`${
                                                    SEVERITY_COLORS[
                                                        PrioVote(
                                                            post.currentUserVoted
                                                                ? post.currentVoteType
                                                                : -1
                                                        )
                                                    ]
                                                } hover:brightness-125 transition-colors text-3xl select-none mt-1`}
                                                aria-label="Increase severity"
                                            >
                                                ▲
                                            </Button>
                                            <button
                                                onClick={(e)=> {
                                                    if (!post.currentUserVoted) {
                                                        return;
                                                    }
                                                    e.stopPropagation();
                                                    const newVoteType = Math.max(0, post.currentUserVoted ? post.currentVoteType - 1: 0)
                                                    updateVote(post._id, newVoteType);
                                                    if (post.currentVoteType === 3) {
                                                            post.criticalCount -= 1
                                                            post.highCount += 1
                                                        }
                                                    else if (post.currentVoteType === 1) {
                                                            post.mediumCount -= 1
                                                            post.lowCount += 1
                                                        }
                                                    else if (post.currentVoteType === 2) {
                                                            post.highCount -= 1
                                                            post.mediumCount += 1
                                                        }
                                                    else {
                                                        return;
                                                    }
                                                    const num = post.lowCount + post.mediumCount + post.highCount + post.criticalCount || 1;
                                                    post.weightedSeverity = Math.round(
                                                        (post.lowCount * 0 +
                                                            post.mediumCount * 1 +
                                                            post.highCount * 2 +
                                                            post.criticalCount * 3) /
                                                            num
                                                    );
                                                    post.currentUserVoted = true;
                                                    post.currentVoteType = newVoteType;
                                                }}
                                                className={`${DOWN_ARROW_COLOR} hover:brightness-90 transition-colors text-3xl select-none`}
                                                aria-label="Decrease severity"
                                            >
                                                ▼
                                            </button>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-bold text-2xl mb-2 text-white/90">
                                                {post.title}
                                            </h3>
                                            <div className="flex justify-center mb-3">
                                                <ImageScroller
                                                    images={post.images || []}
                                                />
                                            </div>
                                            <p className="text-gray-300 leading-relaxed mb-2">
                                                {post.description}
                                            </p>
                                            <span className="text-gray-500 text-xs uppercase tracking-wide">
                                                {timeAgo(post.post_date)}
                                            </span>
                                        </div>
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
