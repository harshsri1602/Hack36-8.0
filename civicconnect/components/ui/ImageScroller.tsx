"use client";
import { useState } from "react";

interface ImageScrollerProps {
    images: string[];
}

export default function ImageScroller({ images }: ImageScrollerProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const nextImage = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    if (images.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full max-w-lg mx-auto transition-transform duration-500 ease-in-out">
            <div className="overflow-hidden rounded-lg flex justify-center items-center">
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="w-64 h-64 object-cover border-4 border-gray-800"
                />
            </div>

            {/* Navigation Buttons */}
            {currentIndex > 0 && (
                <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    aria-label="Previous image"
                >
                    ◀
                </button>
            )}
            {currentIndex < images.length - 1 && (
                <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    aria-label="Next image"
                >
                    ▶
                </button>
            )}

            <div className="flex justify-center mt-2 space-x-2">
                {images.map((_, idx) => (
                    <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                            idx === currentIndex ? "bg-white" : "bg-gray-500"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}
