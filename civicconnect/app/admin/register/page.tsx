"use client";
import { RegisterForm } from "@/components/ui/register-form";
import { useUser } from "@/context/userContext";
import { RegisterSchema } from "@/schemas/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const { user, setUser } = useUser();
    const onSubmit = async (data: RegisterSchema) => {
        try {
            const { pincode, ...rest } = data;
            const modifiedData = { ...rest, areaPin: pincode };
            const res = await fetch(
                "http://localhost:8000/api/v1/admin/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(modifiedData),
                }
            );

            if (!res.ok) {
                const errJson = await res.json();
                const message =
                    (errJson as { message?: string }).message ||
                    "Unknown error";

                toast.error("Registration Failed", { description: message });
                return;
            }

            const result = await res.json();
            if (result.success) {
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
                    toast.success("Registration Successful");
                } catch (err) {
                    if (err instanceof Error) {
                        toast.error("Network Error", {
                            description: err?.message || "Something went wrong",
                        });
                    }
                }
            }
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
            <div className="flex w-full max-w-2/5 flex-col gap-6">
                <RegisterForm title="Admin" onSubmit={onSubmit} />
            </div>
        </div>
    );
}
