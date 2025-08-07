"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { UserProvider } from "@/context/userContext";

type Props = {
    children: ReactNode;
};

const Providers = ({ children }: Props) => {
    return (
        <UserProvider>
            {children}
            <Toaster richColors />
        </UserProvider>
    );
};

export default Providers;
