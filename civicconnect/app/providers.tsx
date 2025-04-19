"use client";

import { ReactNode } from "react";
import { UserProvider } from "@/context/userContext";

type Props = {
    children: ReactNode;
};

const Providers = ({ children }: Props) => {
    return <UserProvider>{children}</UserProvider>;
};

export default Providers;
