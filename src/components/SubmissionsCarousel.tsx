"use client";

import { deleteSubmission } from "@/actions/submissionActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getSubmissionsFromThisWeek } from "@/service/data";
import type { Submission } from "@/types/database";
import { ChevronLeft, ChevronRight, Edit, MoreVertical, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import DeleteSubmissionModal from "./DeleteSubmissionModal";
import EditSubmissionModal from "./EditSubmissionModal";

// Extended submission type that includes additional fields from joins
interface SubmissionWithDetails extends Submission {
    name?: string; // User name
    category?: string; // Category name
}

interface SubmissionsCarouselProps {
    className?: string;
}

export default function SubmissionsCarousel({ className }: SubmissionsCarouselProps) {
    const [localSubmissions, setLocalSubmissions] = useState<SubmissionWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [api, setApi] = useState<CarouselApi>();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [dropdownOpenId, setDropdownOpenId] = useState<number | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(
        null
    );
    const { data: session } = useSession();
    const fetchSubmissions = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await getSubmissionsFromThisWeek();

            if (result.success) {
                setLocalSubmissions(result.data || []);
            } else {
                console.error("Failed to fetch submissions:", result.error);
                toast.error("Failed to load submissions");
                setLocalSubmissions([]);
            }
        } catch (error) {
            console.error("Error fetching submissions:", error);
            toast.error("Failed to load submissions");
            setLocalSubmissions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    useEffect(() => {
        if (!api) return;

        api.on("select", () => {
            setCurrentIndex(api.selectedScrollSnap());
        });
    }, [api]);

    const handleEdit = (submission: SubmissionWithDetails) => {
        setSelectedSubmission(submission);
        setEditModalOpen(true);
    };

    const handleDelete = (submission: SubmissionWithDetails) => {
        setSelectedSubmission(submission);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSubmission) return;

        setIsDeleting(true);
        try {
            const result = await deleteSubmission(selectedSubmission.id);
            if (result.success) {
                // Remove the submission from local state
                setLocalSubmissions((prev) => prev.filter((s) => s.id !== selectedSubmission.id));
                setDeleteModalOpen(false);
                setSelectedSubmission(null);
                toast.success("Submission deleted successfully!");
            } else {
                toast.error(result.error || "Failed to delete submission");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsDeleting(false);
        }
    };

    // Check if current user owns the submission
    const canEditSubmission = (submission: SubmissionWithDetails) => {
        return session?.user?.id === submission.user_id || session?.user?.isAdmin;
    };

    // if (!localSubmissions || localSubmissions.length === 0) {
    //     return (
    //         <div className="flex items-center justify-center h-64 text-muted-foreground">
    //             <p>No submissions available</p>
    //         </div>
    //     );
    // }

    return (
        <div className={cn("w-[90%] max-w-6xl mx-auto px-4 select-none relative", className)}>
            <Carousel
                setApi={setApi}
                className="w-full"
                opts={{
                    align: "center",
                    loop: true,
                }}
            >
                <CarouselContent className="-ml-0 select-none">
                    {isLoading &&
                        Array.from({ length: 3 }, (_, index) => `skeleton-${index}`).map(
                            (skeletonId) => (
                                <CarouselItem key={skeletonId} className="pl-0 relative">
                                    <Card className="overflow-hidden py-0 bg-transparent">
                                        <CardContent className="p-0 w-full aspect-video relative bg-gray-700 dark:bg-gray-950">
                                            {/* Skeleton Image */}
                                            <Skeleton className="absolute inset-0 bg-gray-600/50" />

                                            {/* Skeleton Overlay */}
                                            <div className="absolute inset-0 bg-black/60 flex flex-col justify-between p-6 z-10">
                                                {/* Top section skeleton */}
                                                <div className="flex justify-between items-start">
                                                    <Skeleton className="w-8 h-8 rounded bg-gray-500/50" />
                                                    <div className="flex gap-2">
                                                        <Skeleton className="w-16 h-6 rounded-full bg-gray-500/50" />
                                                        <Skeleton className="w-14 h-6 rounded-full bg-gray-500/50" />
                                                    </div>
                                                </div>

                                                {/* Bottom section skeleton */}
                                                <div className="text-white max-w-2xl">
                                                    <Skeleton className="h-8 w-3/4 mb-3 bg-gray-500/50" />
                                                    <Skeleton className="h-4 w-full mb-2 bg-gray-500/50" />
                                                    <Skeleton className="h-4 w-2/3 mb-3 bg-gray-500/50" />
                                                    <div className="space-y-1">
                                                        <Skeleton className="h-4 w-1/3 bg-gray-500/50" />
                                                        <Skeleton className="h-4 w-1/2 bg-gray-500/50" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            )
                        )}
                    {!isLoading && localSubmissions && localSubmissions.length === 0 && (
                        <CarouselItem className="pl-0">
                            <Card className="overflow-hidden border-0 bg-transparent">
                                <CardContent className="p-0 w-full aspect-video relative bg-gray-700 dark:bg-gray-950 flex items-center justify-center">
                                    <p className="text-sm text-gray-300">
                                        No submissions available. Be the first one to submit a
                                        photo!
                                    </p>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    )}
                    {!isLoading &&
                        localSubmissions.map((submission) => (
                            <CarouselItem key={submission.id} className="pl-0 relative">
                                <Card className="overflow-hidden group cursor-pointer w-full py-0 bg-transparent">
                                    <CardContent className="p-0 w-full aspect-video relative bg-gray-700 dark:bg-gray-950">
                                        {/* Image container with 16:9 aspect ratio */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Image
                                                src={submission.image_link}
                                                alt={submission.title}
                                                className="object-contain max-w-full max-h-full transition-opacity duration-300 group-hover:opacity-75"
                                                fill
                                                priority
                                            />
                                        </div>

                                        {/* Gradient overlays for top and bottom */}
                                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 via-black/20 to-transparent pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/20 to-transparent pointer-events-none"></div>

                                        {/* Overlay that appears on hover or when dropdown is open */}
                                        <div
                                            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 flex flex-col justify-between p-6 z-10 ${
                                                dropdownOpenId === submission.id
                                                    ? "opacity-100"
                                                    : "opacity-0 group-hover:opacity-100 hover:opacity-100"
                                            }`}
                                        >
                                            {/* Top section with menu and badges */}
                                            <div className="flex justify-between items-start">
                                                {/* Top left corner - Menu button for owners */}
                                                <div className="flex-shrink-0">
                                                    {canEditSubmission(submission) && (
                                                        <DropdownMenu
                                                            onOpenChange={(open) =>
                                                                setDropdownOpenId(
                                                                    open ? submission.id : null
                                                                )
                                                            }
                                                        >
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 border-0"
                                                                >
                                                                    <MoreVertical className="h-4 w-4 text-white" />
                                                                    <span className="sr-only">
                                                                        More options
                                                                    </span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="start">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleEdit(submission)
                                                                    }
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleDelete(submission)
                                                                    }
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                                {/* Top right corner - Category badge and Winner badge */}
                                                <div className="flex justify-end items-start gap-2 flex-wrap">
                                                    {submission.category && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                                                        >
                                                            {submission.category}
                                                        </Badge>
                                                    )}
                                                    {submission.isWinner && (
                                                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm">
                                                            Winner
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom left corner - Title and info */}
                                            <div className="text-white max-w-2xl">
                                                <h3 className="font-bold text-2xl mb-3 line-clamp-2">
                                                    {submission.title}
                                                </h3>
                                                {submission.description && (
                                                    <p className="text-base text-gray-200 mb-3 line-clamp-3">
                                                        {submission.description}
                                                    </p>
                                                )}
                                                <div className="space-y-1">
                                                    {submission.location && (
                                                        <p className="text-sm text-gray-300">
                                                            📍 {submission.location}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-gray-300">
                                                        Submitted:{" "}
                                                        {new Date(
                                                            submission.created_at
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                </CarouselContent>
                {(isLoading || localSubmissions.length > 0) && (
                    <>
                        <button
                            type="button"
                            onClick={() => api?.scrollPrev()}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-500/20 text-white transition-all duration-300 hover:scale-110 hover:-translate-x-1 flex items-center justify-center z-40 hover:cursor-pointer"
                        >
                            <ChevronLeft className="h-6 w-6" />
                            <span className="sr-only">Previous slide</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => api?.scrollNext()}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-500/20 text-white transition-all duration-300 hover:scale-110 hover:translate-x-1 flex items-center justify-center z-40 hover:cursor-pointer"
                        >
                            <ChevronRight className="h-6 w-6" />
                            <span className="sr-only">Next slide</span>
                        </button>
                    </>
                )}
            </Carousel>

            {/* Custom Navigation Buttons */}
            {isLoading ? (
                <div className="mt-2 px-4">
                    <div className="flex justify-center items-center gap-2 max-w-2xl mx-auto overflow-x-auto p-2">
                        {Array.from({ length: 3 }, (_, index) => `nav-skeleton-${index}`).map(
                            (skeletonId) => (
                                <Skeleton
                                    key={skeletonId}
                                    className="flex-shrink-0 w-16 h-10 rounded bg-gray-600/50"
                                />
                            )
                        )}
                    </div>
                </div>
            ) : (
                localSubmissions.length > 0 && (
                    <div className="mt-2 px-4">
                        <div className="flex justify-center items-center gap-2 max-w-2xl mx-auto overflow-x-auto p-2">
                            {localSubmissions.map((submission, index) => (
                                <button
                                    key={submission.id}
                                    type="button"
                                    onClick={() => api?.scrollTo(index)}
                                    className={cn(
                                        "flex-shrink-0 w-16 h-10 rounded overflow-hidden border-2 transition-all duration-300",
                                        index === currentIndex
                                            ? "border-blue-300 shadow-lg scale-110"
                                            : "border-gray-500 hover:border-gray-300 opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <Image
                                        src={submission.image_link}
                                        alt={submission.title}
                                        width={64}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )
            )}

            {/* Edit Modal */}
            {selectedSubmission && (
                <EditSubmissionModal
                    submission={selectedSubmission}
                    isOpen={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSuccess={() => {
                        // Refresh the submission data - in a real app you might want to re-fetch from server
                        // For now, we'll just close the modal as the revalidatePath in the action should refresh the page data
                        setSelectedSubmission(null);
                    }}
                />
            )}

            {/* Delete Modal */}
            {selectedSubmission && (
                <DeleteSubmissionModal
                    submission={selectedSubmission}
                    isOpen={deleteModalOpen}
                    onOpenChange={setDeleteModalOpen}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}
