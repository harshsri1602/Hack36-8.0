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

const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 6 characters"),
    phoneNumber: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
    areaPin: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const form = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            areaPin: "",
        },
    });

    const onSubmit = async (data: RegisterData) => {
        console.log("Registration data:", data);

        try {
            const res = await fetch(
                "http://localhost:8000/api/v1/admin/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }
            );

            if (!res.ok) {
                // Grab text or JSON error message if your API returns one
                const errorText = await res.text();
                console.error("Registration failed:", res.status, errorText);
                return;
            }

            const result = await res.json();
            console.log("Registered user:", result);
            // e.g. navigate to login or show success UI
        } catch (err) {
            console.error("Network or parsing error:", err);
        }
    };

    return (
        <div className="ml-16 md:ml-48 p-6 transition-all duration-300">
            <div className="max-w-lg mx-auto bg-[#1A1A1A] text-white rounded shadow p-6">
                <h1 className="text-2xl font-bold mb-4">Register</h1>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your full name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            placeholder="Minimum 6 characters"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="10‑digit number"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="areaPin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Area Pin</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="6 digit postal code"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="mt-4 w-full transition duration-150 active:scale-95 bg-blue-600 hover:bg-blue-700"
                        >
                            Register
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
