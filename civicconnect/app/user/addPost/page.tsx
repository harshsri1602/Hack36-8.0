"use client";
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
import { useEffect, useState } from "react";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

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
                message: "Image Should be in a .jpg, .jpeg, .png or .webpp",
            }
        ),
});

const CreatePostPage = () => {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const form = useForm<z.infer<typeof postSchema>>({
        resolver: zodResolver(postSchema),
        defaultValues: {
            title: "",
            description: "",
            images: undefined,
        },
    });

    const watchImages = form.watch("images");

    useEffect(() => {
        if (watchImages && watchImages instanceof FileList) {
            const previews = Array.from(watchImages).map((file) =>
                URL.createObjectURL(file)
            );
            setImagePreviews(previews);

            return () => {
                previews.forEach((url) => URL.revokeObjectURL(url));
            };
        }
    }, [watchImages]);

    function onSubmit(values: z.infer<typeof postSchema>) {
        console.log(values);
    }

    return (
        <div className="ml-16 md:ml-48 p-6 transition-all duration-300">
            <div className="max-w-2xl mx-auto bg-[#1A1A1A] text-black rounded shadow p-6">
                <h1 className="text-3xl font-bold mb-6 text-white">
                    Create a New Post
                </h1>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8" // spacing between fields
                    >
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
                                    {form.formState.errors.title && (
                                        <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0">
                                            {
                                                form.formState.errors.title
                                                    .message
                                            }
                                        </FormMessage>
                                    )}
                                </FormItem>
                            )}
                        />
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
                                    {form.formState.errors.description && (
                                        <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0">
                                            {
                                                form.formState.errors
                                                    .description.message
                                            }
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
                                    {form.formState.errors.images?.message && (
                                        <FormMessage className="absolute text-red-500 text-sm -bottom-6 left-0" />
                                    )}
                                </FormItem>
                            )}
                        />
                        {imagePreviews.length > 0 && (
                            <div className="relative w-fit mx-auto">
                                {" "}
                                <Carousel className="w-full max-w-md">
                                    {" "}
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

                        <Button
                            type="submit"
                            className={`mt-4 transition duration-150 active:scale-95 ${
                                Object.keys(form.formState.errors).length > 0
                                    ? "bg-[#E5484D] hover:bg-[#d03f44]"
                                    : "bg-[#1A9338] hover:bg-[#17842f]"
                            }`}
                        >
                            <div className="text-white">Submit Post</div>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default CreatePostPage;
