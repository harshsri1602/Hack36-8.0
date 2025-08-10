"use client";

import { useState, useEffect, useRef } from "react";

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
export default function SearchWithModal() {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ApiPost[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                return;
            }
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }
            if (e.key === "/") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

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
                console.log(data.filteredPosts);
            } catch (err) {
                console.error("Search error:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    return (
        <>
            <aside className="w-1/4 p-4">
                <div className="relative flex w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                            />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search... (Press /)"
                        className="flex-1 pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onFocus={() => setIsOpen(true)}
                    />
                </div>
            </aside>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="p-6 rounded-lg w-full max-w-lg shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative flex w-full text-white bg-black p-2 rounded-lg">
                            <div className="flex flex-col w-full">
                                <div className="relative">
                                    <input
                                        autoFocus
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full pl-3 pr-3 py-2 border border-gray-800 rounded-lg 
               bg-black text-white placeholder-gray-500 
               focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                                    />
                                </div>

                                {isSearching && searchQuery !== "" && (
                                    <p className="mt-2 text-gray-400">
                                        Searching...
                                    </p>
                                )}

                                {!isSearching && searchResults.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {searchResults.map((post, idx) => (
                                            <li
                                                key={idx}
                                                className="p-2 bg-[#1A1A1A] text-white rounded border border-gray-800 hover:bg-gray-600 transition-colors cursor-pointer"
                                            >
                                                {post.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
