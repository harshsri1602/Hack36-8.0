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
import { FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { toast } from "sonner";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const postSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Title must be atleast (1) Character long " })
        .max(100, { message: "Title must be less than (100) characters long " }),
    description: z.string().min(10, { message: "Description must be atleast (10) characters long " }),
    images: z
        .any()
        .refine((files) => !files || (files instanceof FileList && ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type)), {
            message: "Image should be .jpg, .jpeg, .png or .webp",
        }),
    tag: z.string().min(1, "Please select a tag"),
    latitude: z.number(),
    longitude: z.number(),
});

const LocationMarker = ({ onSelect }: { onSelect: (latlng: { lat: number; lng: number }) => void }) => {
    const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

    useMapEvents({
        click(e: any) {
            setPos(e.latlng);
            onSelect(e.latlng);
        },
    });

    return pos ? <Marker position={pos} /> : null;
};

const CreatePostPage = () => {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

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
            const previews = Array.from(watchImages).map((file) => URL.createObjectURL(file));
            setImagePreviews(previews);
            return () => previews.forEach((url) => URL.revokeObjectURL(url));
        }
    }, [watchImages]);

    const onError = (errors: typeof form.formState.errors) => {
        Object.values(errors).forEach((err) => {
            // Check if this is a FieldError and has a message
            if (err && typeof err === "object" && "message" in err) {
                toast.error("Validation Error", {
                    description: (err as FieldError).message,
                });
            }
        });
    };

    const onSubmit = async (values: PostForm) => {
        if (!values.images || values.images.length === 0) {
            toast.error("Please upload at least one image.");
            return;
        }

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("tag", values.tag);
        formData.append("latitude", values.latitude.toString());
        formData.append("longitude", values.longitude.toString());

        if (values.images) {
            Array.from(values.images as FileList).forEach((file: File) => {
                formData.append("images", file);
            });
        }

        try {
            const res = await fetch("http://localhost:8000/api/v1/user/postIssue", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) {
                toast.error(`Error: ${data.message}`);
                return;
            }
            toast.success(`Success: ${data.message}`);

            form.reset({
                title: "",
                description: "",
                images: undefined,
                tag: "other",
                latitude: 0,
                longitude: 0,
            });
            setImagePreviews([]);
            setLocation(null);
        } catch (err) {
            toast.error("Something went wrong while submitting the post.");
        }
    };

    return (
        <div className="ml-16 md:ml-48 p-6 transition-all duration-300">
            <div className="max-w-2xl mx-auto bg-[#1A1A1A] rounded-2xl shadow-lg p-8 border border-[#2A2A2A]">
                <h1 className="text-3xl font-bold mb-8 text-white">Create a New Post</h1>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-200">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter post title"
                                            {...field}
                                            className="bg-[#2A2A2A] text-white border border-[#3A3A3A] focus:border-[#4A9CFF] focus:ring-0"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-200">Description</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Describe the issue"
                                            {...field}
                                            className="bg-[#2A2A2A] text-white border border-[#3A3A3A] focus:border-[#4A9CFF] focus:ring-0"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Tag */}
                        <FormField
                            control={form.control}
                            name="tag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-200">Tag</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="bg-[#2A2A2A] text-white border border-[#3A3A3A]">
                                                <SelectValue placeholder="Select a tag" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1A1A1A] text-white border border-[#3A3A3A]">
                                                <SelectItem value="road">Road</SelectItem>
                                                <SelectItem value="domestic">Domestic</SelectItem>
                                                <SelectItem value="electricity">Electricity</SelectItem>
                                                <SelectItem value="utility">Utility</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Images */}
                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-200">Upload Images</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={(e) => field.onChange(e.target.files)}
                                            className="bg-[#2A2A2A] text-white border border-[#3A3A3A]"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Image Carousel */}
                        {imagePreviews.length > 0 && (
                            <div className="bg-[#2A2A2A] p-4 rounded-lg shadow-inner">
                                <Carousel className="w-full max-w-md mx-auto">
                                    <CarouselContent>
                                        {imagePreviews.map((url, idx) => (
                                            <CarouselItem key={idx} className="flex justify-center">
                                                <img
                                                    src={url}
                                                    alt={`preview-${idx}`}
                                                    className="w-48 h-48 object-cover rounded-lg"
                                                />
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    {imagePreviews.length > 1 && (
                                        <>
                                            <CarouselPrevious type="button" className="bg-white/10 hover:bg-white/20" />
                                            <CarouselNext type="button" className="bg-white/10 hover:bg-white/20" />
                                        </>
                                    )}
                                </Carousel>
                            </div>
                        )}

                        {/* Map */}
                        <div>
                            <FormLabel className="text-gray-200">Select Location</FormLabel>
                            <div className="h-72 rounded-lg overflow-hidden border border-[#3A3A3A] shadow-lg">
                                <MapContainer center={[28.6139, 77.209]} zoom={11} className="h-full w-full">
                                    <TileLayer
                                        url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                                        attribution="© Stadia Maps, © OpenStreetMap"
                                    />
                                    <LocationMarker
                                        onSelect={(latlng) => {
                                            setLocation(latlng);
                                            form.setValue("longitude", latlng.lng);
                                            form.setValue("latitude", latlng.lat);
                                        }}
                                    />
                                </MapContainer>
                            </div>
                            {location && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Chosen: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className={`w-full py-3 text-lg font-medium rounded-lg transition-colors ${
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
