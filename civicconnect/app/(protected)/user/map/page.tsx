"use client";
import dynamic from "next/dynamic";

const MainMap = dynamic(() => import("@/components/ui/MainMap"), {
    ssr: false,
});

export default function Page() {
    return (
        <div className="h-full w-full">
            <MainMap />
        </div>
    );
}
