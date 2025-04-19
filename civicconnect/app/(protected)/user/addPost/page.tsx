// pages/create-post.tsx
"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/marker-icon-2x.png",
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
});

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { MapContainer } from "react-leaflet";
import { Marker, TileLayer, useMapEvents } from "react-leaflet";

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

const postSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(10),
    images: z
        .any()
        .refine(
            (files) =>
                !files ||
                (files instanceof FileList &&
                    ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type)),
            {
                message: "Image should be .jpg, .jpeg, .png or .webp",
            }
        ),
    tag: z.string().min(1, "Please select a tag"),
    latitude: z.number(),
    longitude: z.number(),
});

const LocationMarker = ({
    onSelect,
}: {
    onSelect: (latlng: { lat: number; lng: number }) => void;
}) => {
    const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

    useMapEvents({
        click(e: any) {
            setPos(e.latlng);
            onSelect(e.latlng);
            console.log("Picked location:", e.latlng);
        },
    });

    return pos ? <Marker position={pos} /> : null;
};

const CreatePostPage = () => {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [location, setLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const form = useForm({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            description: "",
            images: undefined,
            tag: "other",
            latitude: 0,
            longitude: 0,
        },
    });

    const watchImages = form.watch("images");
    type PostForm = z.infer<typeof postSchema>;
    useEffect(() => {
        if (watchImages && watchImages instanceof FileList) {
            const previews = Array.from(watchImages).map((file) =>
                URL.createObjectURL(file)
            );
            setImagePreviews(previews);
            return () => previews.forEach((url) => URL.revokeObjectURL(url));
        }
    }, [watchImages]);

    const onSubmit = async (values: PostForm) => {
        console.log("Form values:", values);

        // Only proceed if there are images selected
        if (!values.images || values.images.length === 0) {
            alert("Please upload at least one image.");
            return;
        }

        // Create a new FormData object to hold the form data
        const formData = new FormData();

        // Append regular form fields to FormData
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("tag", values.tag);
        formData.append("latitude", values.latitude.toString());
        formData.append("longitude", values.longitude.toString());

        // Append images (if any) to FormData
        if (values.images) {
            Array.from(values.images).forEach((file: File) => {
                formData.append("images", file);
            });
        }

        try {
            const res = await fetch(
                "http://localhost:8000/api/v1/user/postIssue",
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                console.error("Server Error:", data.message);
                alert(`Error: ${data.message}`);
                return;
            }

            console.log("Server Response:", data.message);
            alert(`Success: ${data.message}`);
        } catch (err) {
            console.error("Network error:", err);
            alert("Something went wrong while submitting the post.");
        }
    };

    return (
        <div className="ml-16 md:ml-48 p-6 transition-all duration-300">
            <div className="max-w-2xl mx-auto bg-[#1A1A1A] rounded shadow p-6">
                <h1 className="text-3xl font-bold mb-6 text-white">
                    Create a New Post
                </h1>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        {/* Title Field */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="relative flex flex-col gap-y-1">
                                    <FormLabel className="text-white">
                                        Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Title"
                                            {...field}
                                            className="text-white"
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0" />
                                </FormItem>
                            )}
                        />

                        {/* Description Field */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="relative flex flex-col gap-y-1">
                                    <FormLabel className="text-white">
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Description"
                                            {...field}
                                            className="text-white"
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tag"
                            render={({ field }) => (
                                <FormItem className="relative flex flex-col gap-y-1">
                                    <FormLabel className="text-white">
                                        Tags
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger className="text-white bg-transparent border w-full z-40">
                                                <SelectValue placeholder="Select a tag" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1A1A1A] text-white max-h-[150px] overflow-y-auto z-50 absolute top-full">
                                                <SelectItem value="road">
                                                    Road
                                                </SelectItem>
                                                <SelectItem value="domestic">
                                                    Domestic
                                                </SelectItem>
                                                <SelectItem value="electricity">
                                                    Electricity
                                                </SelectItem>
                                                <SelectItem value="utility">
                                                    Utility
                                                </SelectItem>
                                                <SelectItem value="other">
                                                    Other
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    {form.formState.errors.tag && (
                                        <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0">
                                            {form.formState.errors.tag.message}
                                        </FormMessage>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem className="relative flex flex-col gap-y-1">
                                    <FormLabel className="text-white">
                                        Upload Images
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={(e) =>
                                                field.onChange(e.target.files)
                                            }
                                            className="text-white"
                                        />
                                    </FormControl>
                                    <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0" />
                                </FormItem>
                            )}
                        />

                        {/* Image Previews Carousel */}
                        {imagePreviews.length > 0 && (
                            <div className="relative w-fit mx-auto">
                                <Carousel className="w-full max-w-md">
                                    <CarouselContent>
                                        {imagePreviews.map((url, idx) => (
                                            <CarouselItem
                                                key={idx}
                                                className="flex justify-center"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`preview-${idx}`}
                                                    className="w-40 h-40 object-cover rounded"
                                                />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {imagePreviews.length > 1 && (
                                        <>
                                            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white" />
                                            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white" />
                                        </>
                                    )}
                                </Carousel>
                            </div>
                        )}

                        <FormItem className="flex flex-col gap-y-2">
                            <FormLabel className="text-white">
                                Select Location
                            </FormLabel>
                            <div className="h-64 w-full rounded-md overflow-hidden shadow-lg">
                                <MapContainer
                                    center={[28.6139, 77.209]}
                                    zoom={11}
                                    className="h-full w-full"
                                >
                                    <TileLayer
                                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                        attribution={`
                      © <a href="https://stadiamaps.com/">Stadia Maps</a>, 
                      © <a href="https://www.openstreetmap.org/">OSM</a>
                    `}
                                    />
                                    <LocationMarker
                                        onSelect={(latlng) => {
                                            setLocation(latlng);
                                            form.setValue(
                                                "longitude",
                                                latlng.lng
                                            );
                                            form.setValue(
                                                "latitude",
                                                latlng.lat
                                            );
                                        }}
                                    />
                                </MapContainer>
                            </div>
                            {location && (
                                <p className="text-sm text-gray-300 mt-2">
                                    Chosen: {location.lat.toFixed(5)},{" "}
                                    {location.lng.toFixed(5)}
                                </p>
                            )}
                        </FormItem>
                        <Button
                            type="submit"
                            className={`mt-4 transition duration-150 active:scale-95 ${
                                Object.keys(form.formState.errors).length > 0
                                    ? "bg-[#E5484D] hover:bg-[#d03f44]"
                                    : "bg-[#1A9338] hover:bg-[#17842f]"
                            }`}
                        >
                            Submit Post
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default CreatePostPage;
