// RootLayout.tsx
import Sidebar from "@/components/ui/layout/Siderbar";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <div className="relative z-50">
                <Sidebar />
            </div>
            <main className="relative z-10 flex-1">{children}</main>
        </div>
    );
}
