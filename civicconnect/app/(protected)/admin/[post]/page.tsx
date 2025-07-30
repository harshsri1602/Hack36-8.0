// pages/index.tsx
"use client";
import React, { useState } from "react";
import { NextPage } from "next";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { PostCard } from "@/components/ui/user/PostCard";
import LatestPostsSidebar from "@/components/ui/user/LatestPostsSidebar";
import MapWidget from "@/components/ui/user/MapWidget";

interface Post {
    id: number;
    title: string;
    descriptionText?: string;
    descriptionImageSrc?: string;
    commentsCount?: number;
    status:
        | "Not taken"
        | "Action taken"
        | "Everyone satisfied"
        | "In progress"
        | "Completed";
    createdAt: string;
    priority?: "Low" | "Medium" | "High" | "Critical";
}

// sample data
const POSTS: Post[] = [
    {
        id: 1,
        title: "First Post in the Center",
        descriptionText: "…",
        commentsCount: 12,
        status: "Not taken",
        createdAt: "2025‑04‑18",
    },
    {
        id: 2,
        title: "Another Interesting Topic",
        descriptionImageSrc: "/images/sample2.jpg",
        commentsCount: 34,
        status: "In progress",
        createdAt: "2025‑04‑17",
        priority: "High",
    },
    {
        id: 3,
        title: "What’s Up in Tech?",
        descriptionText: "…",
        commentsCount: 7,
        status: "Completed",
        createdAt: "2025‑04‑16",
        priority: "Medium",
    },
    // …more posts
];

const HomePage: NextPage = () => {
    const [slide, setSlide] = useState(0);

    // filter for slide 2 & 3
    const inProgress = POSTS.filter((p) => p.status === "In progress");
    const completed = POSTS.filter((p) => p.status === "Completed");

    return (
        <div className="relative h-screen overflow-hidden bg-black text-white">
            <div
                className="flex h-full transition-transform duration-500"
                style={{ transform: `translateX(-${slide * 100}%)` }}
            >
                {/* ─── SLIDE 1: Your original posts + map ───────────────────────────── */}
                <div className="min-w-full flex flex-col">
                    <div className="flex-1 overflow-auto">
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
                                    {POSTS.map((post) => (
                                        <PostCard key={post.id} {...post} />
                                    ))}
                                </main>

                                {/* sidebar+map spans cols 2–3 */}
                                <div
                                    className="
                    row-start-1 row-span-2
                    col-start-2 col-span-2
                    border-l border-gray-700 pl-6 pr-[15%]
                    sticky top-12 self-start
                    flex flex-col space-y-8
                  "
                                >
                                    <LatestPostsSidebar latest={[]} />
                                    <MapWidget posts={[]} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 flex justify-end">
                        <Button onClick={() => setSlide(1)}></Button>
                    </div>
                </div>

                {/* ─── SLIDE 2: In Progress table ───────────────────────────────────── */}
                <div className="min-w-full flex flex-col p-8 overflow-auto">
                    <h2 className="text-2xl font-semibold mb-4">
                        In Progress Posts
                    </h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Priority</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inProgress.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.createdAt}</TableCell>
                                    <TableCell>{post.priority}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={() => setSlide(0)}>
                            Back
                        </Button>
                        <Button onClick={() => setSlide(2)}>Next</Button>
                    </div>
                </div>

                {/* ─── SLIDE 3: Completed table ─────────────────────────────────────── */}
                <div className="min-w-full flex flex-col p-8 overflow-auto">
                    <h2 className="text-2xl font-semibold mb-4">
                        Completed Posts
                    </h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Priority</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completed.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>{post.title}</TableCell>
                                    <TableCell>{post.createdAt}</TableCell>
                                    <TableCell>{post.priority}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-6 flex">
                        <Button variant="outline" onClick={() => setSlide(1)}>
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
