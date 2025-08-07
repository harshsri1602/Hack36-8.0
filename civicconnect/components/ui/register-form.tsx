"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RegisterSchema, registerSchema } from "@/schemas/auth";

interface RegisterFormProps {
    title?: string;
    onSubmit?: (data: RegisterSchema) => void;
}

export function RegisterForm({
    title,
    onSubmit = () => {
        toast.error("An error Occured! Try again Later");
    },
}: RegisterFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    const onError = () => {
        const firstError =
            errors.name?.message ||
            errors.email?.message ||
            errors.password?.message ||
            errors.phoneNumber?.message ||
            errors.line1?.message ||
            errors.area?.message ||
            errors.pincode?.message ||
            "Invalid input";

        toast.error(firstError);
    };

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Create {title} account</CardTitle>
                    <CardDescription>
                        Register with your details below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <div className="grid gap-4">
                            {/* Input Fields */}
                            {[
                                ["name", "Full Name", "John Doe"],
                                ["email", "Email", "you@example.com"],
                                ["password", "Password", "", "password"],
                                ["phoneNumber", "Phone Number", "1234567890"],
                                ["line1", "Address Line 1", "123 Street"],
                                ["area", "Area", "Downtown"],
                                ["pincode", "Pincode", "123456"],
                            ].map(([id, label, placeholder, type]) => (
                                <div className="grid gap-2" key={id}>
                                    <Label htmlFor={id}>{label}</Label>
                                    <Input
                                        id={id}
                                        placeholder={placeholder}
                                        type={type || "text"}
                                        {...register(
                                            id as keyof RegisterSchema
                                        )}
                                    />
                                </div>
                            ))}

                            <Button
                                type="submit"
                                className="w-1/3 min-w-1/4 mx-auto border border-transparent hover:border-white transition duration-200"
                            >
                                Register
                            </Button>
                        </div>
                    </form>

                    <div className="relative flex items-center text-sm text-muted-foreground pt-2 pb-4">
                        <div className="flex-grow border-t border-border" />
                        <span className="mx-4">Or continue with</span>
                        <div className="flex-grow border-t border-border" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="ml-2">Google</span>
                        </Button>
                        <Button variant="outline" className="w-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                                    fill="currentColor"
                                />
                            </svg>
                            <span className="ml-2">Apple</span>
                        </Button>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <a
                            href="/"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Login
                        </a>
                    </div>
                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}
