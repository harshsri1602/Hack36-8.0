// app/user/[post]/page.tsx
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronUp, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// ── Override default Leaflet marker icons ───────────────────────────────
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
  id: number;
  user: string;
  text: string;
  upvotes: number;
  downvotes: number;
}

interface Post {
  id: number;
  title: string;
  descriptionText?: string;
  descriptionImageSrc?: string;
  coordinates?: [number, number];
  priorityLeft?: Priority;
  priorityBadge?: Priority;
  commentsCount: number;
  status: string;
  comments?: Comment[];
}

// Placeholder posts with comments & optional image
const posts: Post[] = [
  {
    id: 1,
    title: "Streetlight Broken on 5th Ave",
    descriptionImageSrc: "/sample-streetlight.jpg",
    descriptionText:
      "The streetlight in front of 123 5th Avenue has been out for two weeks now. It’s making the area very dark and unsafe at night.",
    coordinates: [28.6139, 77.2090],
    priorityLeft: "high",
    priorityBadge: "low",
    commentsCount: 3,
    status: "In progress",
    comments: [
      {
        id: 1,
        user: "alice",
        text: "I saw this too. It’s been dark since last Thursday.",
        upvotes: 4,
        downvotes: 0,
      },
      {
        id: 2,
        user: "bob",
        text: "The municipality said they’ll fix it by next week.",
        upvotes: 2,
        downvotes: 1,
      },
      {
        id: 3,
        user: "charlie",
        text: "Be careful walking there after sunset!",
        upvotes: 5,
        downvotes: 0,
      },
    ],
  },
  // ...other posts...
];

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
  const params = useParams();
  const postId =
    typeof params.post === "string" ? parseInt(params.post, 10) : NaN;
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    return <div className="p-8 text-white">Post not found</div>;
  }

  // left‑bar priority state
  const initialIdx = post.priorityLeft
    ? PRIORITIES.indexOf(post.priorityLeft)
    : 0;
  const [leftIdx, setLeftIdx] = useState(initialIdx);
  const leftPrio = PRIORITIES[leftIdx];
  const bumpUp = () =>
    setLeftIdx((i) => Math.min(i + 1, PRIORITIES.length - 1));
  const bumpDown = () => setLeftIdx((i) => Math.max(i - 1, 0));

  // badge priority
  const badgePrio = post.priorityBadge ?? "low";

  return (
    <div className="p-6 md:ml-48 text-white space-y-6">
      {/* ─── Post Card with Priority Bar ─────────────────────────────── */}
      <div className="relative bg-[#1A1A1A] rounded-lg shadow-lg overflow-hidden">
        {/* Left priority bar */}
        <div
          className={`
            absolute inset-y-0 left-0 w-6
            ${PRIORITY_COLORS[leftPrio]}
            flex flex-col items-center justify-center
          `}
        >
          <button
            onClick={bumpUp}
            disabled={leftIdx === PRIORITIES.length - 1}
            className="p-0 hover:bg-transparent focus:ring-0"
          >
            <ChevronUp className="h-4 w-4 text-gray-300" />
          </button>
          <button
            onClick={bumpDown}
            disabled={leftIdx === 0}
            className="p-0 hover:bg-transparent focus:ring-0"
          >
            <ChevronDown className="h-4 w-4 text-gray-300" />
          </button>
        </div>

        {/* Main post content */}
        <div className="pl-8 pr-6 py-6 space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <span
              className={`
                px-2 py-1 text-xs font-medium text-white rounded
                ${PRIORITY_COLORS[badgePrio]}
              `}
            >
              {badgePrio.replace("-", " ")}
            </span>
          </div>

          {/* Optional image */}
          {post.descriptionImageSrc && (
            <div className="h-64 w-full rounded-md overflow-hidden">
              <img
                src={post.descriptionImageSrc}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Optional map */}
          {post.coordinates && (
            <div className="h-64 w-full rounded-md overflow-hidden shadow-lg">
              <MapContainer
                center={[post.coordinates[0], post.coordinates[1]]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                  attribution={`
                    &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, 
                    &copy; <a href="https://www.openstreetmap.org/">OSM</a>
                  `}
                />
                <Marker position={post.coordinates} />
              </MapContainer>
            </div>
          )}

          {/* Description */}
          {post.descriptionText && (
            <p className="text-gray-200">{post.descriptionText}</p>
          )}

          {/* Comments count + status */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>💬 {post.commentsCount} comments</span>
            <span>Status: {post.status}</span>
          </div>
        </div>
      </div>

      {/* ─── Comments Outside Post Card ──────────────────────────────── */}
      {post.comments?.length ? (
        <div className="space-y-4">
          {post.comments.map((c) => (
            <Card key={c.id} className="bg-[#262626] border-none">
              <CardHeader className="flex justify-between items-center py-2 px-4">
                <span className="font-medium text-white">{c.user}</span>
                <div className="flex items-center space-x-2 text-gray-300">
                  <button>
                    <ArrowUp size={16} />
                  </button>
                  <span>{c.upvotes}</span>
                  <button>
                    <ArrowDown size={16} />
                  </button>
                  <span>{c.downvotes}</span>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-4 text-gray-200">
                {c.text}
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
