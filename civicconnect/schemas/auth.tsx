import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 6 characters"),
    phoneNumber: z
        .string()
        .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
    line1: z.string().min(5, "Address is required"),
    area: z.string().min(1, "Area is required"),
    pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be exactly 6 digits"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
