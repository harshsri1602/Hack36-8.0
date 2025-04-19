import Sidebar from "@/components/ui/layout/Siderbar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <Sidebar />
            {children}
        </div>
    );
}
