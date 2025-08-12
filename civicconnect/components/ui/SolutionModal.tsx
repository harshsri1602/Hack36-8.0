import { Post } from "@/types/post";
import { X } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

interface SolutionModalProps {
    setShowSolution: Dispatch<SetStateAction<boolean>>;
    post: Post;
}

const SolutionModal: React.FC<SolutionModalProps> = ({
    setShowSolution,
    post,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            {/* Modal container with animation */}
            <div className="bg-[#1F1F1F] text-white rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative transform transition-all duration-300 ease-out scale-95 animate-fadeIn">
                {/* Close Button */}
                <button
                    className="absolute top-3 right-4 text-gray-400 hover:text-white hover:scale-110 transition-transform"
                    onClick={() => setShowSolution(false)}
                    aria-label="Close Modal"
                >
                    <X size={22} />
                </button>

                {/* Heading */}
                <h2 className="text-2xl font-bold mb-6 text-center border-b border-gray-700 pb-3">
                    Solution
                </h2>

                {/* Solution List */}
                <div className="space-y-6">
                    {post.solution.map((sol) => (
                        <div
                            key={sol._id}
                            className="bg-[#2A2A2A] rounded-lg p-4 border border-gray-700 shadow-sm"
                        >
                            <p className="mb-4 text-sm text-gray-300 leading-relaxed">
                                {sol.description}
                            </p>

                            {/* Images */}
                            {sol.img?.length > 0 && (
                                <div className="flex flex-wrap gap-4">
                                    {sol.img.map((url, i) => (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group"
                                        >
                                            <img
                                                src={url}
                                                alt={`Solution ${i + 1}`}
                                                className="h-48 w-auto object-contain rounded-lg border border-gray-700 group-hover:scale-105 transition-transform shadow-md"
                                            />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Animation Keyframes */}
            <style jsx>{`
                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.25s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default SolutionModal;
