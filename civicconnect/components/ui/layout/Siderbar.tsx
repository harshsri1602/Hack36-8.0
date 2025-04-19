"use client";

import { useState } from "react";
import {
    Home,
    LogOut,
    MapIcon,
    PlusCircleIcon,
    Settings,
    User,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";

const menuItems = [
    { icon: <Home size={25} />, label: "Home", href: "/user/dashboard" },
    { icon: <User size={25} />, label: "Profile", href: "/user/profile" },
    {
        icon: <PlusCircleIcon size={20} />,
        label: "Add Post",
        href: "/user/addPost",
    },
    { icon: <MapIcon size={25} />, label: "Map", href: "/user/map" },
];

export default function Sidebar() {
    const handleClick = async () => {
        console.log("sdsfd");
        try {
            const res = await fetch(
                "http://localhost:8000/api/v1/user/logout",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            if (!res.ok) {
                const errText = await res.text();
                console.error(res.status, errText);
                return;
            }

            const json = await res.json();
            console.log("Logout response:", json);

            setUser(null);

            document.cookie = "jwt=; Max-Age=0; path=/";

            router.push("/login");
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    const { setUser } = useUser();
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    return (
        <div
            className={clsx(
                "fixed top-0 left-0 h-screen bg-[#1A1A1A] text-white transition-all duration-300 ease-in-out overflow-hidden",
                isHovered ? "w-48" : "w-16"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex flex-col justify-between h-full px-2 py-6">
                <div className="flex flex-col space-y-4 items-start">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-4 w-full p-2 hover:bg-[#454545] rounded-md transition-colors"
                        >
                            <div className="flex items-center justify-center ml-0.5">
                                {item.icon}
                            </div>
                            <span
                                className={clsx(
                                    "whitespace-nowrap transition-opacity duration-300",
                                    isHovered ? "opacity-100" : "opacity-0"
                                )}
                            >
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col space-y-2 items-start">
                    <button className="flex items-center gap-4 w-full p-2 hover:bg-[#454545] rounded-md transition-colors">
                        <div className="flex items-center justify-center ml-1">
                            <Settings />
                        </div>
                        <span
                            className={clsx(
                                "whitespace-nowrap transition-opacity duration-300",
                                isHovered ? "opacity-100" : "opacity-0"
                            )}
                        >
                            Settings
                        </span>
                    </button>
                    <button className="flex items-center gap-4 w-full p-2 hover:bg-[#454545] rounded-md transition-colors">
                        <div className="flex items-center justify-center ml-1">
                            <LogOut />
                        </div>
                        <span
                            onClick={() => handleClick()}
                            className={clsx(
                                "whitespace-nowrap transition-opacity duration-300",
                                isHovered ? "opacity-100" : "opacity-0"
                            )}
                        >
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
