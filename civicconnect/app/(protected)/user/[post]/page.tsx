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
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

// ── Leaflet icon override ───────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl:       "/marker-icon.png",
  shadowUrl:     "/marker-shadow.png",
});

type Priority = "very-low" | "low" | "high" | "very-high";
const PRIORITIES: Priority[] = ["very-low", "low", "high", "very-high"];
const PRIORITY_COLORS: Record<Priority, string> = {
  "very-low":  "bg-green-800",
  low:         "bg-blue-800",
  high:        "bg-yellow-800",
  "very-high": "bg-red-800",
};

interface Comment {
  _id: string;
  comment: string;
  upvotes: number;
  downvotes: number;
  written_by: string;
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
}

const LocationMarker = ({
  onSelect,
}: {
  onSelect: (latlng: { lat: number; lng: number }) => void;
}) => {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  useMapEvents({
    click(e) {
      setPos(e.latlng);
      onSelect(e.latlng);
    },
  });
  return pos ? <Marker position={pos} /> : null;
};

const Page: React.FC = () => {
  const { post: postParam } = useParams();
  const postId = typeof postParam === "string" ? postParam : "";

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commenters, setCommenters] = useState<Record<string, string>>({});
  const [leftIdx, setLeftIdx] = useState(0);

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
        if (data.success) setPost(data.post);
        else throw new Error(data.error || "Failed to load post");
      })
      .catch((err) => {
        console.error("Error fetching post:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  // Init priority
  useEffect(() => {
    if (!post) return;
    const sev = post.weightedSeverity ?? 0;
    const idx = Math.min(
      PRIORITIES.length - 1,
      Math.floor((sev / 100) * PRIORITIES.length)
    );
    setLeftIdx(idx);
  }, [post]);

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
  const voteComment = async (commentId: string, voteType: "upvote" | "downvote") => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/user/voteComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ commentId, voteType }),
      });
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

  const leftPrio = PRIORITIES[leftIdx];
  const bumpUp = () => setLeftIdx((i) => Math.min(i + 1, PRIORITIES.length - 1));
  const bumpDown = () => setLeftIdx((i) => Math.max(i - 1, 0));
  const badgePrio: Priority = (() => {
    switch (post.state) {
      case "UNRESOLVED": return "low";
      case "IN PROGRESS": return "high";
      case "ACTION TAKEN": return "very-high";
      case "RESOLVED": return "very-low";
      default: return "low";
    }
  })();

  return (
    <div className="p-6 md:ml-48 text-white space-y-6">
      {/* Post Card */}
      <div className="relative bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden">
        {/* Left priority bar */}
        <div
          className={`
            absolute inset-y-0 left-0 w-6
            ${PRIORITY_COLORS[leftPrio]}
            flex flex-col items-center justify-center
          `}
        >
          <button onClick={bumpUp} disabled={leftIdx === PRIORITIES.length - 1} className="p-0 hover:bg-transparent focus:ring-0">
            <ChevronUp className="h-4 w-4 text-gray-300" />
          </button>
          <button onClick={bumpDown} disabled={leftIdx === 0} className="p-0 hover:bg-transparent focus:ring-0">
            <ChevronDown className="h-4 w-4 text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="pl-8 pr-6 py-6 space-y-4">
          {/* Title + author + badge */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{post.title}</h1>
              <p className="text-sm text-gray-400">by {post.user.name}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium text-white rounded ${PRIORITY_COLORS[badgePrio]}`}>
              {badgePrio.replace("-", " ")}
            </span>
          </div>

          {/* Image */}
          {post.images?.[0] && (
            <div className="h-64 w-full rounded-md overflow-hidden">
              <img src={post.images[0]} alt={post.title} className="object-cover w-full h-full" />
            </div>
          )}

          {/* Map */}
          {typeof post.latitude === "number" && typeof post.longitude === "number" && (
            <div className="h-64 w-full rounded-md overflow-hidden shadow-lg">
              <MapContainer center={[post.latitude, post.longitude]} zoom={13} className="h-full w-full">
                <TileLayer
                  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                  attribution="© Stadia Maps, © OSM"
                />
                <Marker position={[post.latitude, post.longitude]} />
              </MapContainer>
            </div>
          )}

          {/* Description */}
          {post.description && <p className="text-gray-200">{post.description}</p>}

          {/* Footer */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>💬 {post.comments.length} comments</span>
            <span>Status: {post.state}</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      {post.comments.length > 0 ? (
        <div className="space-y-4">
          {post.comments.map((c) => (
            <Card key={c._id} className="bg-[#262626] border-none">
              <CardHeader className="flex justify-between items-center py-2 px-4">
                <span className="font-medium text-white">
                  {commenters[c.written_by] ?? "..."}
                </span>
                <div className="flex items-center space-x-2 text-gray-300">
                  <button onClick={() => voteComment(c._id, "upvote")}>
                    <ArrowUp size={16} />
                  </button>
                  <span>{c.upvotes}</span>
                  <button onClick={() => voteComment(c._id, "downvote")}>
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
  );
};

export default Page;
