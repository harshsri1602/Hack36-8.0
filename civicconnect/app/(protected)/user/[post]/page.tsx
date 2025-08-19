// app/user/[post]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";
import { ArrowUp, ArrowDown, Loader2, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageScroller from "@/components/ui/ImageScroller";
import SolutionModal from "@/components/ui/SolutionModal";
import { Post, Comment } from "@/types/post";
import { useUser } from "@/context/userContext";
import SolvedBadge from "@/components/ui/SolvedBadge";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
});

type Priority = "Low" | "Medium" | "High" | "Critical";
const PRIORITY_COLORS: Record<Priority, string> = {
    Low: "bg-gradient-to-r from-green-600 to-green-800",
    Medium: "bg-gradient-to-r from-blue-600 to-blue-800",
    High: "bg-gradient-to-r from-yellow-500 to-yellow-700",
    Critical: "bg-gradient-to-r from-red-600 to-red-800",
};

export default function Page() {
    const { post: postParam } = useParams();
    const { user } = useUser();
    const postId = typeof postParam === "string" ? postParam : "";

    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commenters, setCommenters] = useState<Record<string, string>>({});
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [showSolution, setShowSolution] = useState(false);

    const customIcon = new Icon({ iconUrl: "/marker.png", iconSize: [38, 38] });

    useEffect(() => {
        if (!postId) return;
        setLoading(true);
        fetch(`http://localhost:8000/api/v1/user/post/${postId}`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                const p = data.post;
                const den =
                    p.lowCount +
                        p.mediumCount +
                        p.highCount +
                        p.criticalCount || 1;
                p.weightedSeverity = Math.round(
                    (p.lowCount * 0 +
                        p.mediumCount * 1 +
                        p.highCount * 2 +
                        p.criticalCount * 3) /
                        den
                );
                if (data.success) setPost(p);
                else throw new Error(data.error || "Failed to load post");
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [postId]);

    useEffect(() => {
        if (!post) return;
        const ids = Array.from(new Set(post.comments.map((c) => c.written_by)));
        Promise.all(
            ids.map((uid) =>
                fetch(`http://localhost:8000/api/v1/user/${uid}`, {
                    method: "GET",
                    credentials: "include",
                })
                    .then((r) => r.json())
                    .then((d) => ({ uid, name: d.name }))
            )
        ).then((arr) => {
            const map: Record<string, string> = {};
            arr.forEach(({ uid, name }) => (map[uid] = name));
            setCommenters(map);
        });
    }, [post]);

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
            if (!res.ok) throw new Error(data.error || "Vote failed");

            setPost((prev) =>
                prev
                    ? {
                          ...prev,
                          comments: prev.comments.map((c) =>
                              c._id === commentId ? data.comment : c
                          ),
                      }
                    : prev
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;
        try {
            setCommentLoading(true);
            const res = await fetch(
                "http://localhost:8000/api/v1/user/comment",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
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

            setPost((prev) =>
                prev
                    ? { ...prev, comments: [newComment, ...prev.comments] }
                    : prev
            );
            setCommentText("");
        } catch (error) {
            console.error(error);
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading…</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!post) return <div className="p-8 text-white">Post not found</div>;

    const badgePrio: Priority =
        post.weightedSeverity === 1
            ? "Medium"
            : post.weightedSeverity === 2
            ? "High"
            : post.weightedSeverity === 3
            ? "Critical"
            : "Low";

    return (
        <div className="md:ml-48 px-4 flex justify-center">
            <div className="w-full max-w-4xl space-y-8">
                {/* Post Card */}
                <Card className="bg-[#1A1A1A] border border-white/5 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Title + Author */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight">
                                    {post.title}
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    by {post.user.name}
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span
                                    className={`px-3 py-1 text-xs font-medium text-white rounded-full ${PRIORITY_COLORS[badgePrio]}`}
                                >
                                    {badgePrio}
                                </span>

                                <SolvedBadge solved={!!post.solution?.length} />
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {post.images?.length ? (
                            <ImageScroller images={post.images} />
                        ) : null}

                        {/* Map */}
                        {typeof post.latitude === "number" &&
                            typeof post.longitude === "number" &&
                            !showSolution && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <MapPin size={16} />
                                        <span>{post.state}</span>
                                    </div>
                                    <div className="rounded-2xl overflow-hidden shadow-lg">
                                        <MapContainer
                                            center={[
                                                post.latitude,
                                                post.longitude,
                                            ]}
                                            zoom={15}
                                            className="h-64 w-full"
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
                                                icon={customIcon}
                                            />
                                        </MapContainer>
                                    </div>
                                </div>
                            )}

                        {/* Description */}
                        {post.description && (
                            <p className="text-gray-300 leading-relaxed">
                                {post.description}
                            </p>
                        )}

                        {/* Show Solution */}
                        {post.solution?.length > 0 && (
                            <Button
                                onClick={() => setShowSolution(true)}
                                className="bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-green-500/30 transform hover:scale-105 transition-all flex items-center gap-2"
                            >
                                💡 View Solution
                            </Button>
                        )}
                    </div>
                </Card>
                <div className="space-y-3">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="bg-[#2A2A2A] text-sm text-white rounded-md p-3 resize-none h-20 w-full"
                    />
                    <Button
                        onClick={handleCommentSubmit}
                        disabled={commentLoading || !commentText.trim()}
                        className="bg-gradient-to-r from-[#2A2A2A] to-[#3A3A3A] rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {commentLoading && (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Post Comment
                    </Button>
                </div>

                {post.comments.length ? (
                    <div className="space-y-4">
                        {post.comments.map((c) => (
                            <Card
                                key={c._id}
                                className={`p-3 mb-3 border-none ${
                                    c.written_by === user?._id
                                        ? "bg-emerald-950 border border-emerald-700 shadow-lg shadow-emerald-900/30"
                                        : "bg-[#262626]"
                                }`}
                            >
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="font-medium text-white text-sm truncate flex items-center gap-2">
                                        {commenters[c.written_by] ?? "..."}
                                        {c.written_by === user?._id && (
                                            <span className="bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                You
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <button
                                            onClick={() =>
                                                voteComment(c._id, "upvote")
                                            }
                                            className="p-1 rounded hover:bg-white/10 hover:text-green-400 transition"
                                        >
                                            <ArrowUp size={14} />
                                        </button>
                                        {c.upvotes}
                                        <button
                                            onClick={() =>
                                                voteComment(c._id, "downvote")
                                            }
                                            className="p-1 rounded hover:bg-white/10 hover:text-red-400 transition"
                                        >
                                            <ArrowDown size={14} />
                                        </button>
                                        {c.downvotes}
                                    </div>
                                </div>
                                <p
                                    className={`text-sm mt-2 ${
                                        c.written_by === user?._id
                                            ? "text-emerald-200"
                                            : "text-gray-300"
                                    }`}
                                >
                                    {c.comment}
                                </p>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 mb-3">No comments yet.</p>
                )}
            </div>

            {/* Solution Modal */}
            {showSolution && (
                <SolutionModal post={post} setShowSolution={setShowSolution} />
            )}
        </div>
    );
}
