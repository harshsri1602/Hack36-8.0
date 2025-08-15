import { useState, useEffect } from "react";
import Lottie from "lottie-react";

interface ConfirmDeleteModalProps {
    postId: string | null;
    onCancel: () => void;
    onDeleteSuccess: (postId: string) => void;
}

export default function ConfirmDeleteModal({ postId, onCancel, onDeleteSuccess }: ConfirmDeleteModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        if (isDeleting) {
            fetch("/trash.json")
                .then((res) => res.json())
                .then((data) => setAnimationData(data))
                .catch((err) => console.error("Error loading animation:", err));
        }
    }, [isDeleting]);

    const handleConfirm = async () => {
        if (!postId) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`http://localhost:8000/api/v1/user/deletePost/${postId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Delete failed");

            setTimeout(() => {
                onDeleteSuccess(postId);
                onCancel();
            }, 1800);
        } catch (err) {
            console.error("Error deleting post:", err);
            setIsDeleting(false);
        }
    };

    if (!postId) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 text-gray-100 rounded-2xl p-8 shadow-lg max-w-lg w-full text-center">
                {!isDeleting ? (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Are you sure?</h2>
                        <p className="text-gray-400 mb-8 text-lg">This action cannot be undone.</p>

                        <div className="flex justify-center gap-4">
                            <button
                                className="px-5 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-base"
                                onClick={onCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors text-base"
                                onClick={handleConfirm}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="w-48 h-48 mx-auto">
                            {animationData && <Lottie animationData={animationData} loop={false} />}
                        </div>
                        <p className="mt-4 text-gray-400 text-lg">Deleting...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
