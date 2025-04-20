// app/login/page.tsx
"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

const loginSchema = z.object({
    email: z.string().email("Must be a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { user, setUser } = useUser();
    const form = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginData) => {
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
                const errText = await res.text();
                console.error(res.status, errText);
                return;
            }

            const json = await res.json();
            setUser(json.user);
            router.push("/admin/dashboard");
        } catch (err) {
            console.error("Network error:", err);
        }
    };

    return (
        <div className="p-6 transition-all duration-300">
            <div className="max-w-md mx-auto bg-[#1A1A1A] text-white rounded shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="mt-4 w-full transition duration-150 active:scale-95 bg-green-600 hover:bg-green-700"
                        >
                            Sign In
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
