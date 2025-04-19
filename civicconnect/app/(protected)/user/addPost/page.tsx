// pages/create-post.tsx
"use client";

import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ── Override default Leaflet marker icons to use local images ───────────
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
import MapWidget from "@/components/ui/user/MapWidget";

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
    tags: z.string().min(1, "Please select a tag"),
});

const CreatePostPage = () => {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [location, setLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const form = useForm<PostForm>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            description: "",
            images: undefined,
            tags: "Other",
        },
    });

    const watchImages = form.watch("images");
    useEffect(() => {
        if (watchImages && watchImages instanceof FileList) {
            const previews = Array.from(watchImages).map((file) =>
                URL.createObjectURL(file)
            );
            setImagePreviews(previews);
            return () => previews.forEach((url) => URL.revokeObjectURL(url));
        }
    }, [watchImages]);

    const onSubmit = (values: PostForm) => {
        console.log("Form values:", values);
        console.log("Selected location:", location);
        // send `values` + `location` to your backend here
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
                            name="tags"
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
                                            <SelectTrigger className="text-white bg-transparent border w-full">
                                                <SelectValue placeholder="Select a tag" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1A1A1A] text-white">
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
                                    {form.formState.errors.tags && (
                                        <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0">
                                            {form.formState.errors.tags.message}
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

                        {/* Dark‐themed Map Picker */}
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
                                    <LocationMarker onSelect={setLocation} />
                                </MapContainer>
                            </div>
                            {location && (
                                <p className="text-sm text-gray-300 mt-2">
                                    Chosen: {location.lat.toFixed(5)},{" "}
                                    {location.lng.toFixed(5)}
                                </p>
                            )}
                        </FormItem>

                        {/* Submit Button */}
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
            <MapWidget />
        </div>
    );
};

export default CreatePostPage;
