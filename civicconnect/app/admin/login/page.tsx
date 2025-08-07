"use client";
import LoginForm from "@/components/ui/login-form";
import { useUser } from "@/context/userContext";
import { LoginSchema } from "@/schemas/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const { user, setUser } = useUser();
    const onSubmit = async (data: LoginSchema) => {
        try {
            const res = await fetch(
                "http://localhost:8000/api/v1/admin/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(data),
                }
            );

            if (!res.ok) {
                const errJson = await res.json();
                const message =
                    (errJson as { message?: string }).message ||
                    "Unknown error";

                toast.error("Login Failed", { description: message });
                return;
            }

            const json = await res.json();
            setUser(json.user);
            router.push("/admin/dashboard");
            toast.success("Admin Login Verified");
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Network Error", {
                    description: err?.message || "Something went wrong",
                });
            }
        }
    };
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <LoginForm
                    title="Admin Panel"
                    description="Enter Admin Credentails to Continue"
                    onSubmit={onSubmit}
                    registerUrl="/admin/register"
                    otherSignInUrl="/"
                    otherSignInTitle="User Sign In"
                />
            </div>
        </div>
    );
}
