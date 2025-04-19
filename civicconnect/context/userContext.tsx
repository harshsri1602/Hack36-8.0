"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

type User = {
    _id: string;
    address: {
        line1: string;
        area: string;
        pincode: string;
    };
    banned: boolean;
    createdAt: Date;
    email: string;
    isVerified: boolean;
    name: string;
    phoneNumber: number;
    posts: [];
    profileImg: string;
};

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const setUser = (user: User | null) => {
        setUserState(user);
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUserState(JSON.parse(storedUser));
        }
        setLoading(false); // ✅ Mark as finished loading
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
