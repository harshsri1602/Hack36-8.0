"use client";
import { useState } from "react";

interface ImageScrollerProps {
    images: string[];
}

export default function ImageScroller({ images }: ImageScrollerProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [direction, setDirection] = useState<"left" | "right">("right");

    const nextImage = () => {
        if (currentIndex < images.length - 1) {
            setDirection("right");
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentIndex > 0) {
            setDirection("left");
            setCurrentIndex((prev) => prev - 1);
        }
    };

    if (images.length === 0) return null;

    return (
        <div className="relative w-full max-w-lg mx-auto">
            {/* Image container */}
            <div className="overflow-hidden rounded-lg flex justify-center items-center h-64">
                <img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className={`max-h-full max-w-full object-contain border-4 border-gray-800 transition-all duration-500 ease-in-out
            ${
                direction === "right"
                    ? "animate-slide-in-right"
                    : "animate-slide-in-left"
            }`}
                />

                {/* Left Arrow */}
                {currentIndex > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        aria-label="Previous image"
                    >
                        ◀
                    </button>
                )}

                {/* Right Arrow */}
                {currentIndex < images.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                        aria-label="Next image"
                    >
                        ▶
                    </button>
                )}
            </div>

            {/* Dots */}
            <div className="w-full flex justify-center mt-3 space-x-2">
                {images.map((_, idx) => (
                    <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                            idx === currentIndex ? "bg-white" : "bg-gray-500"
                        }`}
                    />
                ))}
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideInLeft {
                    from {
                        transform: translateX(-30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.4s ease forwards;
                }
                .animate-slide-in-left {
                    animation: slideInLeft 0.4s ease forwards;
                }
            `}</style>
        </div>
    );
}
