import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt");

    if (!jwt) {
        redirect("/login");
    }

    return <div>{children}</div>;
};

export default Layout;
