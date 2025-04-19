"use client";

import { useParams } from "next/navigation";
import React from "react";
import posts from "@/data/posts.json";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const page = () => {
    const param = useParams();
    if (typeof param.post !== "string") {
        return <div>Invalid post ID</div>;
    }
    const postId = parseInt(param.post, 10);
    const post = posts.find((p) => p.id === postId);
    console.log(param.post, param.id);
    return (
        <div className="ml-16 md:ml-48 p-6 transition-all duration-300">
            <div className="max-w-2xl mx-auto bg-[#1A1A1A] text-black rounded shadow p-6">
                <h1 className="text-3xl font-bold mb-6 text-white">
                    {post?.title}
                </h1>
                <p className="text-white">{post?.descriptionText}</p>
                {post?.descriptionImageSrc && (
                    <div className="relative w-fit mx-auto">
                        {" "}
                        <Carousel className="w-full max-w-md">
                            {" "}
                            <CarouselContent>
                                <CarouselItem className="flex justify-center">
                                    <img
                                        src={post.descriptionImageSrc}
                                        alt={`preview-${post.descriptionText}`}
                                        className="w-40 h-40 object-cover rounded"
                                    />
                                </CarouselItem>
                            </CarouselContent>
                        </Carousel>{" "}
                    </div>
                )}
            </div>
        </div>
    );
};

export default page;
