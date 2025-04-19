// app/profile/page.tsx
"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useUser } from "@/context/userContext";

const ProfilePage: React.FC = () => {
    const { user } = useUser();

    if (!user) {
        return <div className="p-8 text-white">Loading profile...</div>;
    }

    if (!user)
        return <div className="p-8 text-red-500">Failed to load profile.</div>;

    return (
        <div className="md:ml-48 px-4 flex justify-center">
            <div className="w-full max-w-3xl py-8">
                <Card className="bg-[#1A1A1A] text-white shadow-lg border-none">
                    <CardHeader className="text-2xl font-bold pb-4">
                        Profile
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-400">
                                Name
                            </span>
                            <span>{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-400">
                                Email
                            </span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-400">
                                Phone
                            </span>
                            <span>{user.phoneNumber}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-400">
                                Address
                            </span>
                            <span>{user.address.line1}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-400">
                                Verified
                            </span>
                            <span
                                className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold ${
                                    user.isVerified
                                        ? "text-green-400 bg-green-900"
                                        : "text-red-400 bg-red-900"
                                }`}
                            >
                                {user.isVerified ? (
                                    <>
                                        <CheckCircle size={16} /> Verified
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={16} /> Not Verified
                                    </>
                                )}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
