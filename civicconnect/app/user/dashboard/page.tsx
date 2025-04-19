import { NextPage } from "next";
import { PostCard } from "@/components/ui/user/PostCard";
import LatestPostsSidebar from "@/components/ui/user/LatestPostsSidebar";
import MapWidget from "@/components/ui/user/MapWidget";

const POSTS = [
    {
        id: 1,
        title: "First Post in the Center",
        descriptionText:
            "This is a sample description that will be clamped to three lines. If it’s any longer it should end with an ellipsis so users know there’s more but it’s hidden here.",
        commentsCount: 12,
        status: "Not taken",
    },
    {
        id: 2,
        title: "Another Interesting Topic",
        descriptionImageSrc: "/images/sample2.jpg",
        commentsCount: 34,
        status: "Action taken",
    },
    {
        id: 3,
        title: "What’s Up in Tech?",
        descriptionText:
            "Here’s another text‑only post, demonstrating the 3‑line clamp. It’ll truncate nicely if it runs too long.",
        commentsCount: 7,
        status: "Everyone satisfied",
    },
    {
        id: 1,
        title: "First Post in the Center",
        descriptionText:
            "This is a sample description that will be clamped to three lines. If it’s any longer it should end with an ellipsis so users know there’s more but it’s hidden here.",
        commentsCount: 12,
        status: "Not taken",
    },
    {
        id: 2,
        title: "Another Interesting Topic",
        descriptionImageSrc: "/images/sample2.jpg",
        commentsCount: 34,
        status: "Action taken",
    },
    {
        id: 3,
        title: "What’s Up in Tech?",
        descriptionText:
            "Here’s another text‑only post, demonstrating the 3‑line clamp. It’ll truncate nicely if it runs too long.",
        commentsCount: 7,
        status: "Everyone satisfied",
    },
];

const LATEST = [
    { id: 101, title: "Latest: New Feature Launched" },
    { id: 102, title: "Latest: Bug Fixes Deployed" },
    { id: 103, title: "Latest: Community Meetup" },
];

const HomePage: NextPage = () => {
    return (
        <div className="min-h-screen bg-black text-white">
            <div
                className="
          w-full
          max-w-screen-2xl mx-auto      /* ← bump container to ~1536px */
          grid
          grid-cols-[1fr_5fr_3fr]        /* keep your 3∶1∶2 layout */
          grid-rows-[auto_auto]
          gap-y-8 gap-x-24               /* ← a bit more horizontal gap */
          py-12 px-4
        "
            >
                {/* 1) POSTS in col 1 */}
                <main className="row-start-1 col-start-2 space-y-8">
                    {POSTS.map((post) => (
                        <PostCard
                            key={post.id}
                            title={post.title}
                            descriptionText={post.descriptionText}
                            descriptionImageSrc={post.descriptionImageSrc}
                            commentsCount={post.commentsCount}
                            status={post.status}
                        />
                    ))}
                </main>

                {/* 2) Sticky sidebar+map wrapper spans cols 2–3 */}
                <div
                    className="
            row-start-1 row-span-2
            col-start-3 col-span-2
            border-l border-gray-700 pl-6 pr-[0%]
            sticky top-12 self-start
            flex flex-col space-y-8
          "
                >
                    <LatestPostsSidebar latest={LATEST} />
                    <MapWidget />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
