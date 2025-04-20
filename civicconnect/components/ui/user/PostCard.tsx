"use client";

import { useEffect, useState } from "react";
import {
    ChevronUp,
    ChevronDown,
    Loader2, // 👈 Spinner icon
} from "lucide-react";

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Priority = "very-low" | "low" | "high" | "very-high";
const PRIORITIES: Priority[] = ["very-low", "low", "high", "very-high"];
const PRIORITY_VALUES: Record<Priority, number> = {
    "very-low": 0,
    low: 1,
    high: 2,
    "very-high": 3,
};
const PRIORITY_COLORS: Record<Priority, string> = {
    "very-low": "bg-green-800",
    low: "bg-blue-800",
    high: "bg-yellow-800",
    "very-high": "bg-red-800",
};

interface PostCardProps {
    id: string;
    title: string;
    descriptionText?: string;
    descriptionImageSrc?: string;
    commentsCount: number;
    status: string;
    userVoted: boolean;
    vote?: number;
}

export function PostCard({
    id,
    title,
    descriptionText,
    descriptionImageSrc,
    commentsCount,
    status,
    userVoted,
    vote,
}: PostCardProps) {
    const router = useRouter();
    const [idx, setIdx] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userVoted && typeof vote === "number") {
            setIdx(vote);
        }
    }, []);

    const updateVote = async (newIdx: number) => {
        try {
            setLoading(true);
            await fetch("http://localhost:8000/api/v1/user/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    post_id: id,
                    voteType: PRIORITY_VALUES[PRIORITIES[newIdx]],
                }),
            });
            setIdx(newIdx);
        } catch (err) {
            console.error("Vote update failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const increase = () => {
        if (idx === null) {
            updateVote(0); // First vote
        } else if (idx < PRIORITIES.length - 1) {
            updateVote(idx + 1);
        }
    };

    const decrease = () => {
        if (idx !== null && idx > 0) {
            updateVote(idx - 1);
        }
    };

    const handleClick = () => {
        router.push(`/user/${id}`);
    };

    return (
        <Card className="relative flex overflow-hidden rounded-lg bg-[#1A1A1A] border border-black">
            {/* Priority bar */}
            <div
                className={`absolute inset-y-0 left-0 w-6 ${
                    idx !== null
                        ? PRIORITY_COLORS[PRIORITIES[idx]]
                        : "bg-gray-700"
                } flex flex-col items-center justify-center`}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={increase}
                    disabled={idx === PRIORITIES.length - 1 || loading}
                    className="p-0 hover:bg-transparent focus:ring-0"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrease}
                    disabled={idx === 0 || loading}
                    className="p-0 hover:bg-transparent focus:ring-0"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </Button>
            </div>

            {/* Main content */}
            <div className="flex-1 pl-6 flex flex-col" onClick={handleClick}>
                <CardHeader className="pb-0">
                    <CardTitle className="text-base line-clamp-2 text-white">
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-2 pb-1">
                    {descriptionImageSrc && (
                        <div className="relative h-48 w-full rounded-md overflow-hidden mb-2">
                            <img
                                src={descriptionImageSrc}
                                alt="Post image"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
                    {descriptionText && (
                        <p className="text-sm text-gray-200 line-clamp-3 mb-2">
                            {descriptionText}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="pt-0">
                    <div className="w-full flex justify-between text-xs text-gray-400">
                        <span>💬 {commentsCount} comments</span>
                        <span>Status: {status}</span>
                    </div>
                </CardFooter>
            </div>
        </Card>
    );
}
