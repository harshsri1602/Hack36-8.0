// app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/userContext";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
    _id: string;
    title: string;
    state: string;
    comments: any[];
    createdAt: string;
}

const ProfilePage: React.FC = () => {
    const { user, setUser } = useUser();
    const [activeTab, setActiveTab] = useState<"profile" | "posts">("profile");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        phoneNumber: "",
        line1: "",
        area: "",
        pincode: "",
    });
    const [saving, setSaving] = useState(false);

    // Posts state
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [errorPosts, setErrorPosts] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        // populate form
        if (user) {
            setFormData({
                email: user.email || "",
                password: "",
                phoneNumber: user.phoneNumber || "",
                line1: user.address?.line1 || "",
                area: user.address?.area || "",
                pincode: user.address?.pincode || "",
            });
        }
    }, [user]);

    useEffect(() => {
        if (!user?._id) return;
        setLoadingPosts(true);
        fetch(`http://localhost:8000/api/v1/user/viewAllPosts`, {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch posts");
                return res.json();
            })
            .then((data) => {
                console.log(data);
                setPosts(data.allUserPosts.posts || []);
            })
            .catch((err) => setErrorPosts(err.message))
            .finally(() => setLoadingPosts(false));
    }, [activeTab, user]);

    if (!user) return <div className="p-8 text-white">Loading...</div>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    function calculateSeverity(
        lowCount: number,
        mediumCount: number,
        highCount: number,
        criticalCount: number
    ): string {
        const totalCount = lowCount + mediumCount + highCount + criticalCount;
        if (totalCount === 0) return "None";

        const weightedSum =
            lowCount * 0 + mediumCount * 1 + highCount * 2 + criticalCount * 3;
        const avg = weightedSum / totalCount;

        if (avg < 0.5) return "Low";
        if (avg < 1.5) return "Medium";
        if (avg < 2.5) return "High";
        return "Critical";
    }

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const res = await fetch(
                `http://localhost:8000/api/v1/user/${user._id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(formData),
                }
            );
            if (!res.ok) throw new Error("Update failed");
            const data = await res.json();
            setUser(data.user);
        } catch (err) {
            console.error("Error updating profile:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setDeletingId(postId);
        try {
            const res = await fetch(
                `http://localhost:8000/api/v1/user/deletePost/${postId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
            if (!res.ok) throw new Error("Delete failed");
            setPosts((prev) => prev.filter((p) => p._id !== postId));
        } catch (err) {
            console.error("Error deleting post:", err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="md:ml-48 px-4 py-8">
            <Card className="bg-[#1A1A1A] text-white shadow-lg border-none">
                <CardHeader className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">My Account</h1>
                    <div className="space-x-2">
                        <Button
                            variant={
                                activeTab === "profile" ? undefined : "ghost"
                            }
                            onClick={() => setActiveTab("profile")}
                        >
                            Profile
                        </Button>
                        <Button
                            variant={
                                activeTab === "posts" ? undefined : "ghost"
                            }
                            onClick={() => setActiveTab("posts")}
                        >
                            My Posts
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <AnimatePresence exitBeforeEnter>
                        {activeTab === "profile" ? (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Profile Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Email
                                        </label>
                                        <Input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="mt-1 bg-[#2A2A2A] text-white"
                                            type="email"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Password
                                        </label>
                                        <Input
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="mt-1 bg-[#2A2A2A] text-white"
                                            type="password"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Phone Number
                                        </label>
                                        <Input
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="mt-1 bg-[#2A2A2A] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Address Line 1
                                        </label>
                                        <Input
                                            name="line1"
                                            value={formData.line1}
                                            onChange={handleChange}
                                            className="mt-1 bg-[#2A2A2A] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Area
                                        </label>
                                        <Input
                                            name="area"
                                            value={formData.area}
                                            onChange={handleChange}
                                            className="mt-1 bg-[#2A2A2A] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">
                                            Pincode
                                        </label>
                                        <Input
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="mt-1 bg-[#2A2A2A] text-white"
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleUpdate}
                                            disabled={saving}
                                            className="w-full"
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "Update Profile"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="posts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Posts Table */}
                                {loadingPosts ? (
                                    <p className="text-white">
                                        Loading posts...
                                    </p>
                                ) : errorPosts ? (
                                    <p className="text-red-500">
                                        Error: {errorPosts}
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full table-auto">
                                            <thead>
                                                <tr className="bg-gray-800">
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                                                        Title
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                                                        State
                                                    </th>
                                                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">
                                                        Comment Count
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                                                        Severity
                                                    </th>
                                                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-300">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {posts.map((post) => (
                                                    <tr
                                                        key={post._id}
                                                        className="border-b border-gray-700 hover:bg-gray-900"
                                                    >
                                                        <td className="px-4 py-2 text-sm">
                                                            {post.title}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm capitalize">
                                                            {post.state}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-center">
                                                            {
                                                                post.comments
                                                                    .length
                                                            }
                                                        </td>
                                                        <td className="px-4 py-2 text-sm">
                                                            {calculateSeverity(
                                                                post.lowCount,
                                                                post.mediumCount,
                                                                post.highCount,
                                                                post.criticalCount
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        post._id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    post._id
                                                                }
                                                            >
                                                                {deletingId ===
                                                                post._id
                                                                    ? "Deleting…"
                                                                    : "Delete"}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {posts.length === 0 && (
                                            <p className="text-center text-gray-500 py-4">
                                                No posts found.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfilePage;
