// pages/admin/posts.tsx

"use client";

import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";

interface ApiPost {
  _id: string;
  title: string;
  post_date: string;
  state: string;
}

const PostsPage: NextPage = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("UNRESOLVED");

  // Modal state for IN PROGRESS posts
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!user?.areaPin) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/admin/posts", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch posts");

        const filtered = Array.isArray(data.posts)
          ? data.posts.filter((p: ApiPost) => p.state === activeTab)
          : [];
        setPosts(filtered);
      } catch {
        setError("Could not load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, activeTab]);

  const goBack = () => router.push("/admin/dashboard");

  const handleCheckboxChange = async (post: ApiPost) => {
    if (post.state === "UNRESOLVED") {
      try {
        const res = await fetch("http://localhost:8000/api/v1/admin/acceptProblem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: post._id }),
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          setPosts((prev) =>
            prev.map((p) => (p._id === post._id ? { ...p, state: "IN PROGRESS" } : p))
          );
        } else {
          alert(data.message || "Failed to accept the problem.");
        }
      } catch {
        alert("Error while accepting the problem.");
      }
    } else if (post.state === "IN PROGRESS") {
      setSelectedPost(post);
      setShowModal(true);
    }
  };

  const handleSubmitSolution = async () => {
    if (!title || !image) {
      alert("Please provide both title and image.");
      return;
    }

    const formData = new FormData();
    formData.append("post_id", selectedPost?._id || "");
    formData.append("title", title);
    formData.append("images", image);

    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/solution", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setPosts((prev) =>
          prev.map((p) =>
            p._id === selectedPost?._id ? { ...p, state: "ACTION TAKEN" } : p
          )
        );
        setShowModal(false);
      } else {
        alert(data.message || "Failed to update solution.");
      }
    } catch {
      alert("Error while submitting solution.");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        router.push("/login");
      } else {
        alert(data.message || "Failed to logout.");
      }
    } catch {
      alert("Error while logging out.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-screen-2xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-semibold mb-4">Posts</h2>

        {/* Tabs Navigation */}
        <div className="flex space-x-4 mb-6">
          {["UNRESOLVED", "IN PROGRESS", "ACTION TAKEN", "RESOLVED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab ? "bg-indigo-600" : "bg-gray-700"
              } px-4 py-2 rounded-md text-white`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          {loading ? (
            <div>Loading posts...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="px-4 py-2">Select</th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post._id} className="border-t border-gray-600">
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          className="text-indigo-600"
                          onChange={() => handleCheckboxChange(post)}
                        />
                      </td>
                      <td className="px-4 py-2">{post.title}</td>
                      <td className="px-4 py-2">
                        {new Date(post.post_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center text-gray-400">
                      No posts available for this tab.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 space-x-4">
          <button
            onClick={goBack}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Modal for submitting solution */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96 text-black">
            <h3 className="text-2xl mb-4">Submit Solution</h3>
            <div className="mb-4">
              <label className="block text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-white text-black"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Image</label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border rounded-md bg-white text-black"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-black py-2 px-4 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSolution}
                className="bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsPage;
