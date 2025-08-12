// components/ui/SolvedBadge.tsx
import React from "react";
import { Check } from "lucide-react";

interface SolvedBadgeProps {
    solved: boolean;
    className?: string;
}

export default function SolvedBadge({
    solved,
    className = "",
}: SolvedBadgeProps) {
    const base =
        "px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-2";
    const solvedStyle =
        "bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-sm";
    const unsolvedStyle = "bg-gray-800 text-gray-300 border border-white/5";

    return (
        <span
            aria-label={solved ? "Solved" : "Unsolved"}
            className={`${base} ${
                solved ? solvedStyle : unsolvedStyle
            } ${className}`}
            role="status"
        >
            <Check
                size={14}
                className={`${solved ? "opacity-100" : "opacity-50"}`}
            />
            {solved ? "Solved" : "Unsolved"}
        </span>
    );
}
