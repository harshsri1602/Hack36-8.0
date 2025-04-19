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

  const router = useRouter();

  useEffect(() => {
    if (!user?.address?.pincode) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/user/viewRegion", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch posts");
        }

        const filteredPosts = Array.isArray(data.posts)
          ? data.posts.filter((post: ApiPost) => post.state === activeTab)
          : [];

        setPosts(filteredPosts);
        console.log(data)
      } catch (err) {
        console.error(err);
        setError("Could not load posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user, activeTab]);

  const goBack = () => {
    router.push("/admin/dashboard");
  };

  const handleCheckboxChange = async (post: ApiPost) => {
    if (post.state === "UNRESOLVED") {
      // Log the data being sent to AcceptProblem
      console.log("Data being sent to AcceptProblem API:", {
        post_id: post._id,
      });
  
      // Call the AcceptProblem API to update the state of the post
      try {
        const res = await fetch("http://localhost:8000/api/v1/admin/acceptProblem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post_id: post._id, // Sending post ID to the backend
          }),
          credentials: "include",
        });
  
        const data = await res.json();
  
        if (res.ok) {
          alert(data.message);
          // After accepting the problem, update the post state locally
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p._id === post._id ? { ...p, state: "IN PROGRESS" } : p
            )
          );
        } else {
          alert(data.message || "Failed to accept the problem.");
        }
      } catch (err) {
        console.error(err);
        alert("Error while accepting the problem.");
      }
    }
  };
  
  

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-screen-2xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-semibold mb-4">Posts</h2>

        {/* Tabs Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("UNRESOLVED")}
            className={`${
              activeTab === "UNRESOLVED" ? "bg-indigo-600" : "bg-gray-700"
            } px-4 py-2 rounded-md text-white`}
          >
            Unresolved
          </button>
          <button
            onClick={() => setActiveTab("IN PROGRESS")}
            className={`${
              activeTab === "IN PROGRESS" ? "bg-indigo-600" : "bg-gray-700"
            } px-4 py-2 rounded-md text-white`}
          >
            In Progress
          </button>
          <button
            onClick={() => setActiveTab("ACTION TAKEN")}
            className={`${
              activeTab === "ACTION TAKEN" ? "bg-indigo-600" : "bg-gray-700"
            } px-4 py-2 rounded-md text-white`}
          >
            Action Taken
          </button>
          <button
            onClick={() => setActiveTab("RESOLVED")}
            className={`${
              activeTab === "RESOLVED" ? "bg-indigo-600" : "bg-gray-700"
            } px-4 py-2 rounded-md text-white`}
          >
            Resolved
          </button>
        </div>

        {/* Posts Table */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          {loading ? (
            <div>Loading posts...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Button to go back */}
        <button
          onClick={goBack}
          className="mt-6 bg-indigo-600 text-white py-2 px-4 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PostsPage;
