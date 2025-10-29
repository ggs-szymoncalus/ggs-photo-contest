import { createSubmission } from "@/actions/submissionActions";
import { cn } from "@/lib/utils";
import { getCategories } from "@/service/data";
import type { Category } from "@/types/database";
import type { ServiceResponse } from "@/types/response";
import { CalendarIcon, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./ui/shadcn-io/dropzone";
import {
    ImageCrop,
    ImageCropApply,
    ImageCropContent,
    ImageCropReset,
} from "./ui/shadcn-io/image-crop";
import { Textarea } from "./ui/textarea";

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

interface PhotoUploadFormData {
    title: string;
    description?: string;
    photo: File | null;
    category_id: number;
    location?: string;
    dateTaken: Date;
}

export default function PhotoUploadModal() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PhotoUploadFormData>({
        defaultValues: {
            title: "",
            description: "",
            photo: null,
            category_id: 0,
            location: "",
            dateTaken: new Date(),
        },
    });

    const onSubmit = async (data: PhotoUploadFormData) => {
        if (!data.photo) {
            toast.error("Please select a photo to upload");
            return;
        }

        setIsSubmitting(true);

        try {
            // Create FormData to send to server action
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("category_id", data.category_id.toString());
            formData.append("photo", data.photo);

            if (data.description) {
                formData.append("description", data.description);
            }
            if (data.location) {
                formData.append("location", data.location);
            }

            const result = await createSubmission(formData);

            if (result.success) {
                toast.success("Photo submitted successfully!");

                // Reset form
                form.reset();
                setPreviewUrl(null);

                // Close modal (you might need to add modal state management)
                // For now, we'll just reset the form
            } else {
                toast.error(result.error || "Failed to submit photo");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            // Validate file type (excluding GIFs)
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            if (allowedTypes.includes(file.type)) {
                // Clear existing preview and form data when starting new upload
                setPreviewUrl(null);
                form.setValue("photo", null);
                setSelectedFile(file);
                setShowCropper(true);
            }
        }
    };

    const handleCropComplete = async (croppedImageDataUrl: string) => {
        try {
            // Convert data URL to blob more efficiently
            const response = await fetch(croppedImageDataUrl);
            const blob = await response.blob();

            // Preserve original filename but update extension based on actual format
            const originalName = selectedFile?.name.split(".")[0] || "cropped-image";
            const mimeType = blob.type;
            const extension = mimeType === "image/png" ? "png" : "jpg";
            const fileName = `${originalName}-cropped.${extension}`;

            // Create file with proper MIME type
            const croppedFile = new File([blob], fileName, {
                type: mimeType,
                lastModified: Date.now(),
            });

            form.setValue("photo", croppedFile);
            setPreviewUrl(croppedImageDataUrl);
            setShowCropper(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Error processing cropped image:", error);
            toast.error("Failed to process cropped image");
        }
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedFile(null);
    };

    // Cleanup preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                // Note: We don't revoke data URLs as they don't need cleanup like object URLs
                setPreviewUrl(null);
            }
        };
    }, [previewUrl]);

    // Fetch categories from API or define them statically
    useEffect(() => {
        // Example static categories
        async function fetchCategories() {
            // Replace with actual API call if needed
            const data: ServiceResponse<Category[]> = await getCategories();
            if (!data || !data.success) {
                toast.error(`Error ${data.code}: ${data.error}`);
                return;
            }

            setCategories(data.data);
        }
        fetchCategories();
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" className="h-auto justify-start mb-1 bg-purple-600">
                    <ImagePlus />
                    <span className="ml-2">Upload a photo</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] min-w-[70vw]" showCloseButton={false}>
                {!showCropper ? (
                    <>
                        <DialogTitle className="mb-6 text-lg font-semibold">
                            Upload a photo
                        </DialogTitle>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="flex flex-col h-full"
                            >
                                <div className="flex flex-row gap-8 flex-1">
                                    {/* Left side - Photo upload */}
                                    <div className="flex-1 flex flex-col">
                                        <FormField
                                            name="photo"
                                            control={form.control}
                                            rules={{
                                                required: "Please select an image file",
                                                validate: (file: File | null) => {
                                                    if (!file) return "Please select an image file";

                                                    // Check file size (max 20MB)
                                                    const maxSize = 20 * 1024 * 1024; // 20MB
                                                    if (file.size > maxSize) {
                                                        return "File size must be less than 20MB";
                                                    }

                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col h-full ">
                                                    <FormLabel>Photo *</FormLabel>
                                                    <div className="flex-1">
                                                        {/* {field.value && previewUrl && (
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="h-6 w-6 z-10"
                                                                onClick={handleRemoveFile}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )} */}
                                                        <Dropzone
                                                            key={previewUrl || "empty"}
                                                            src={
                                                                field.value
                                                                    ? [field.value]
                                                                    : undefined
                                                            }
                                                            maxSize={20 * 1024 * 1024} // 20MB
                                                            maxFiles={1}
                                                            accept={{
                                                                "image/jpeg": [".jpg", ".jpeg"],
                                                                "image/png": [".png"],
                                                                "image/webp": [".webp"],
                                                            }}
                                                            onDrop={handleFileDrop}
                                                            onError={(error) => {
                                                                console.error(
                                                                    "Dropzone error:",
                                                                    error
                                                                );
                                                            }}
                                                            className="w-full h-full"
                                                        >
                                                            <DropzoneEmptyState />
                                                            {field.value && previewUrl ? (
                                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                                    <div>
                                                                        <Image
                                                                            src={previewUrl}
                                                                            alt="Preview"
                                                                            className="w-full rounded-lg object-cover bg-muted"
                                                                            width={300}
                                                                            height={300}
                                                                        />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="font-medium text-sm">
                                                                            {field.value.name}
                                                                        </p>
                                                                        <p className="text-muted-foreground text-xs">
                                                                            {formatFileSize(
                                                                                field.value.size
                                                                            )}{" "}
                                                                            • {field.value.type}
                                                                        </p>
                                                                        <p className="text-muted-foreground text-xs mt-1">
                                                                            Click to replace or drag
                                                                            a new file
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <DropzoneContent />
                                                            )}
                                                        </Dropzone>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Right side - Form inputs */}
                                    <div className="min-w-[400px] w-[400px] space-y-4 overflow-y-auto px-2">
                                        {/* Title Field */}
                                        <FormField
                                            name="title"
                                            control={form.control}
                                            rules={{
                                                required: "Title is required",
                                                minLength: {
                                                    value: 3,
                                                    message: "Title must be at least 3 characters",
                                                },
                                                maxLength: {
                                                    value: 100,
                                                    message:
                                                        "Title must be less than 100 characters",
                                                },
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter a title for your photo"
                                                            className="w-full"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Description Field */}
                                        <FormField
                                            name="description"
                                            control={form.control}
                                            rules={{
                                                maxLength: {
                                                    value: 500,
                                                    message:
                                                        "Description must be less than 500 characters",
                                                },
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe your photo (optional)"
                                                            className="min-h-[80px] w-full"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Category Field */}
                                        <FormField
                                            name="category_id"
                                            control={form.control}
                                            rules={{
                                                required: "Please select a category",
                                                validate: (value) =>
                                                    (value && value > 0) ||
                                                    "Please select a valid category",
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category *</FormLabel>
                                                    <Select
                                                        value={
                                                            field.value > 0
                                                                ? field.value.toString()
                                                                : ""
                                                        }
                                                        onValueChange={(value) =>
                                                            field.onChange(parseInt(value, 10))
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem
                                                                    key={category.id}
                                                                    value={category.id.toString()}
                                                                >
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Location Field */}
                                        <FormField
                                            name="location"
                                            control={form.control}
                                            rules={{
                                                maxLength: {
                                                    value: 100,
                                                    message:
                                                        "Location must be less than 100 characters",
                                                },
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Where was this photo taken? (optional)"
                                                            className="w-full"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Date Taken Field */}
                                        <FormField
                                            name="dateTaken"
                                            control={form.control}
                                            rules={{
                                                required: "Date taken is required",
                                            }}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Date Taken *</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value &&
                                                                            "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        field.value.toLocaleDateString(
                                                                            "en-US",
                                                                            {
                                                                                year: "numeric",
                                                                                month: "long",
                                                                                day: "numeric",
                                                                            }
                                                                        )
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-auto p-0"
                                                            align="start"
                                                        >
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => {
                                                                    const today = new Date();
                                                                    const oneWeekAgo = new Date();
                                                                    oneWeekAgo.setDate(
                                                                        today.getDate() - 7
                                                                    );
                                                                    return (
                                                                        date > today ||
                                                                        date < oneWeekAgo
                                                                    );
                                                                }}
                                                                autoFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Bottom buttons */}
                                <div className="flex flex-row gap-2 pt-4 border-t mt-6 mb-4">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Uploading..." : "Upload Photo"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </>
                ) : (
                    <>
                        <DialogTitle className=" text-lg font-semibold text-center">
                            Crop your photo
                        </DialogTitle>
                        {selectedFile && (
                            <ImageCrop
                                file={selectedFile}
                                onCrop={handleCropComplete}
                                maxImageSize={1024 * 1024 * 15} // 15MB for high quality
                            >
                                <div className="space-y-4 flex justify-center">
                                    <ImageCropContent />
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button onClick={handleCropCancel} variant="outline">
                                        Cancel
                                    </Button>
                                    <ImageCropReset asChild>
                                        <Button variant="outline">Reset</Button>
                                    </ImageCropReset>
                                    <ImageCropApply asChild>
                                        <Button>Apply Crop</Button>
                                    </ImageCropApply>
                                </div>
                            </ImageCrop>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
