// app/user/[post]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
    ChevronUp,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Loader2,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ── Leaflet icon override ───────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
});

type Priority = "Low" | "Medium" | "High" | "Critical";
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const PRIORITY_COLORS: Record<string, string> = {
    Low: "bg-green-800",
    Medium: "bg-blue-800",
    High: "bg-yellow-800",
    Critical: "bg-red-800",
};

interface Comment {
    _id: string;
    comment: string;
    upvotes: number;
    downvotes: number;
    written_by: string;
}

interface Solution {
    description: string;
    _id: string;
    img: string[];
}

interface Post {
    _id: string;
    title: string;
    description?: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    state: string;
    weightedSeverity?: number;
    user: {
        _id: string;
        name: string;
    };
    comments: Comment[];
    lowCount: number;
    mediumCount: number;
    highCount: number;
    criticalCount: number;
    solution: Solution[];
}

const Page: React.FC = () => {
    const { post: postParam } = useParams();
    const postId = typeof postParam === "string" ? postParam : "";

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commenters, setCommenters] = useState<Record<string, string>>({});
    const [leftIdx, setLeftIdx] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [showSolution, setShowSolution] = useState(false);

    // Fetch the post
    useEffect(() => {
        if (!postId) return;
        setLoading(true);
        fetch(`http://localhost:8000/api/v1/user/post/${postId}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched post data:", data);
                const post = data.post;

                const den =
                    post.lowCount +
                        post.mediumCount +
                        post.highCount +
                        post.criticalCount || 1;

                post.weightedSeverity = Math.round(
                    (post.lowCount * 0 +
                        post.mediumCount * 1 +
                        post.highCount * 2 +
                        post.criticalCount * 3) /
                        den
                );
                if (data.success) {
                    setPost(data.post);
                    console.log(post);
                } else {
                    throw new Error(data.error || "Failed to load post");
                }
            })
            .catch((err) => {
                console.error("Error fetching post:", err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    }, [postId]);

    // Fetch commenter names
    useEffect(() => {
        if (!post) return;
        const uniqueIds = Array.from(
            new Set(post.comments.map((c) => c.written_by))
        );
        Promise.all(
            uniqueIds.map((uid) =>
                fetch(`http://localhost:8000/api/v1/user/${uid}`, {
                    method: "GET",
                    credentials: "include",
                })
                    .then((r) => r.json())
                    .then((d) => {
                        console.log(`Fetched user for comment ${uid}:`, d);
                        return { uid, name: d.name };
                    })
            )
        ).then((arr) => {
            const map: Record<string, string> = {};
            arr.forEach(({ uid, name }) => {
                map[uid] = name;
            });
            console.log("All comment authors:", map);
            setCommenters(map);
        });
    }, [post]);

    // Handler to vote on a comment
    const voteComment = async (
        commentId: string,
        voteType: "upvote" | "downvote"
    ) => {
        try {
            const res = await fetch(
                "http://localhost:8000/api/v1/user/voteComment",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ commentId, voteType }),
                }
            );
            const data = await res.json();
            console.log("Vote response:", data);
            if (!res.ok) throw new Error(data.error || "Vote failed");

            // update the specific comment in state
            setPost((prev) => {
                if (!prev) return prev;
                const updatedComments = prev.comments.map((c) =>
                    c._id === commentId ? data.comment : c
                );
                return { ...prev, comments: updatedComments };
            });
        } catch (err) {
            console.error("Error voting comment:", err);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading…</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!post) return <div className="p-8 text-white">Post not found</div>;

    const badgePrio: Priority = (() => {
        switch (post.weightedSeverity) {
            case 0:
                return "Low";
            case 1:
                return "Medium";
            case 2:
                return "High";
            case 3:
                return "Critical";
            default:
                return "Low";
        }
    })();

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;

        try {
            setCommentLoading(true);
            const res = await fetch(
                "http://localhost:8000/api/v1/user/comment",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        post_id: postId,
                        comment: commentText.trim(),
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add comment");

            const newComment: Comment = data.comment;

            // Add new commenter name if missing
            if (!commenters[newComment.written_by]) {
                const userRes = await fetch(
                    `http://localhost:8000/api/v1/user/${newComment.written_by}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                const userData = await userRes.json();
                setCommenters((prev) => ({
                    ...prev,
                    [newComment.written_by]: userData.name,
                }));
            }

            // Append new comment to state
            setPost((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    comments: [newComment, ...prev.comments],
                };
            });

            setCommentText("");
        } catch (error) {
            console.error("Failed to submit comment:", error);
        } finally {
            setCommentLoading(false);
        }
    };

    return (
        <div className="md:ml-48 px-4 flex justify-center">
            <div className="w-full max-w-4xl space-y-6">
                {/* Post Card */}
                <div className="relative bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden">
                    {/* Content */}
                    <div className="pl-8 pr-6 py-6 space-y-4">
                        {/* Title + author + badge */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {post.title}
                                </h1>
                                <p className="text-sm text-gray-400">
                                    by {post.user.name}
                                </p>
                            </div>
                            <span
                                className={`px-2 py-1 text-xs font-medium text-white rounded ${PRIORITY_COLORS[badgePrio]}`}
                            >
                                {badgePrio.replace("-", " ")}
                            </span>
                        </div>

                        {/* Image */}
                        {post.images?.[0] && (
                            <div className="h-64 rounded-md overflow-hidden items-center flex justify-center">
                                <img
                                    src={post.images[0]}
                                    alt={post.title}
                                    className="object-cover h-full"
                                />
                            </div>
                        )}

                        {/* Map */}
                        {typeof post.latitude === "number" &&
                            typeof post.longitude === "number" && (
                                <div className="w-full rounded-md overflow-hidden shadow-lg relative h-64">
                                    <div
                                        className={`absolute inset-0 transition-opacity duration-300 ${
                                            showSolution
                                                ? "opacity-30 pointer-events-none"
                                                : "opacity-100"
                                        }`}
                                    >
                                        <MapContainer
                                            center={[
                                                post.latitude,
                                                post.longitude,
                                            ]}
                                            zoom={13}
                                            className="h-full w-full z-0"
                                        >
                                            <TileLayer
                                                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                                attribution="© Stadia Maps, © OSM"
                                            />
                                            <Marker
                                                position={[
                                                    post.latitude,
                                                    post.longitude,
                                                ]}
                                            />
                                        </MapContainer>
                                    </div>
                                </div>
                            )}

                        {/* Description */}
                        {post.description && (
                            <p className="text-gray-200">{post.description}</p>
                        )}

                        {post.solution && post.solution.length > 0 && (
                            <div className="mt-4">
                                <Button
                                    onClick={() => setShowSolution(true)}
                                    variant="outline"
                                    className="text-white"
                                >
                                    Show Solution
                                </Button>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>💬 {post.comments.length} comments</span>
                            <span>Status: {post.state}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-2 flex flex-col gap-2 w-full">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="bg-[#2A2A2A] text-sm text-white rounded-md p-2 resize-none h-20"
                    />
                    <Button
                        onClick={handleCommentSubmit}
                        disabled={commentLoading || !commentText.trim()}
                        className="self-end"
                    >
                        {commentLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Post Comment
                    </Button>
                </div>

                {/* Comments */}
                {post.comments.length > 0 ? (
                    <div className="space-y-4">
                        {post.comments.map((c) => (
                            <Card
                                key={c._id}
                                className="bg-[#262626] border-none"
                            >
                                <CardHeader className="flex justify-between items-center py-2 px-4">
                                    <span className="font-medium text-white">
                                        {commenters[c.written_by] ?? "..."}
                                    </span>
                                    <div className="flex items-center space-x-2 text-gray-300">
                                        <button
                                            onClick={() =>
                                                voteComment(c._id, "upvote")
                                            }
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <span>{c.upvotes}</span>
                                        <button
                                            onClick={() =>
                                                voteComment(c._id, "downvote")
                                            }
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                        <span>{c.downvotes}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-2 px-4 text-gray-200">
                                    {c.comment}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No comments yet.</p>
                )}
            </div>
            {showSolution && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-[#1F1F1F] text-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl"
                            onClick={() => setShowSolution(false)}
                        >
                            &times;
                        </button>

                        {/* Modal Title */}
                        <h2 className="text-xl font-semibold mb-6 text-center">
                            Solution
                        </h2>

                        {/* Solutions */}
                        {post.solution.map((sol) => (
                            <div key={sol._id} className="mb-6 text-center">
                                {/* Centered Description */}
                                <p className="mb-4 text-sm text-gray-300">
                                    {sol.description}
                                </p>

                                {/* Images with click-to-expand */}
                                {sol.img?.length > 0 && (
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {sol.img.map((url, i) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Solution ${i + 1}`}
                                                    className="h-48 w-auto object-contain rounded hover:scale-105 transition-transform"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
