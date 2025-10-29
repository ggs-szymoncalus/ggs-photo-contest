"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Submission, User } from "@/types/database";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import Image from "next/image";

interface SubmissionWithDetails extends Submission {
    name?: string; // User name
    category?: string; // Category name
}

interface CreateColumnsProps {
    isEditing: boolean;
    editingData: Record<number, Partial<SubmissionWithDetails>>;
    setEditingData: (data: Record<number, Partial<SubmissionWithDetails>>) => void;
    categories: Category[];
    users: User[];
    onDeleteSubmission?: (submission: SubmissionWithDetails) => void;
}

export function createColumns({
    isEditing,
    editingData,
    setEditingData,
    categories,
    users,
    onDeleteSubmission,
}: CreateColumnsProps): ColumnDef<SubmissionWithDetails>[] {
    const updateEditingData = (
        submissionId: number,
        field: keyof SubmissionWithDetails,
        value: string | number
    ) => {
        setEditingData({
            ...editingData,
            [submissionId]: {
                ...editingData[submissionId],
                [field]: value,
            },
        });
    };

    const getFieldValue = (
        submissionId: number,
        field: keyof SubmissionWithDetails,
        originalValue: string | number
    ) => {
        const editingValue = editingData[submissionId]?.[field];
        return editingValue !== undefined ? editingValue : originalValue;
    };

    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            // small fixed size and a meta class so the table renderer can tighten this column
            size: 40,
            meta: {
                className: "w-[30px] px-2",
            },
        },
        {
            accessorKey: "image_link",
            header: "Image",
            cell: ({ getValue }) => {
                const imageUrl = getValue() as string;
                return (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                        <Image src={imageUrl} alt="Submission" fill className="object-cover" />
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
            size: 60,
            meta: {
                className: "w-[60px] px-2",
            },
        },
        {
            accessorKey: "title",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
            cell: ({ row }) => {
                const submission = row.original;
                const value = getFieldValue(submission.id, "title", submission.title) as string;

                if (isEditing) {
                    return (
                        <div className="space-y-2">
                            <Input
                                value={value}
                                onChange={(e) =>
                                    updateEditingData(submission.id, "title", e.target.value)
                                }
                                placeholder="Title"
                                className="max-w-[100px]"
                            />
                            {submission.isWinner && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs">
                                    Winner
                                </Badge>
                            )}
                        </div>
                    );
                }

                return (
                    <div className="max-w-[100px]">
                        <div className="font-medium text-sm truncate">{submission.title}</div>
                        {submission.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 truncate">
                                {submission.description}
                            </div>
                        )}
                        {submission.isWinner && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs mt-1">
                                Winner
                            </Badge>
                        )}
                    </div>
                );
            },
            size: 100,
            meta: {
                className: "w-[100px]",
            },
        },
        {
            accessorKey: "description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ row }) => {
                const submission = row.original;
                const value = getFieldValue(
                    submission.id,
                    "description",
                    submission.description || ""
                ) as string;

                if (isEditing) {
                    return (
                        <Textarea
                            value={value}
                            onChange={(e) =>
                                updateEditingData(submission.id, "description", e.target.value)
                            }
                            placeholder="Description"
                            className="max-w-[150px] min-h-[60px]"
                        />
                    );
                }

                return submission.description ? (
                    <div className="text-sm text-muted-foreground line-clamp-2 max-w-[150px] truncate">
                        {submission.description}
                    </div>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
            size: 150,
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Submitter" />,
            cell: ({ row }) => {
                const submission = row.original;
                const user = users.find((u) => u.id === submission.user_id);

                if (!user) {
                    return (
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">Unknown User</div>
                                <div className="text-xs text-muted-foreground truncate">
                                    ID: {submission.user_id}
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                                {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </div>
                        </div>
                    </div>
                );
            },
            size: 80,
            meta: {
                className: "max-w-[80px]",
            },
        },
        {
            accessorKey: "category_id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
            cell: ({ row }) => {
                const submission = row.original;
                const value = getFieldValue(
                    submission.id,
                    "category_id",
                    submission.category_id
                ) as number;

                if (isEditing) {
                    return (
                        <Select
                            value={value?.toString()}
                            onValueChange={(newValue) =>
                                updateEditingData(submission.id, "category_id", parseInt(newValue))
                            }
                        >
                            <SelectTrigger className="w-[90px]">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    );
                }

                const category = categories.find((c) => c.id === submission.category_id);
                return category ? (
                    <Badge variant="secondary">{category.name}</Badge>
                ) : (
                    <span className="text-muted-foreground">No category</span>
                );
            },
            size: 90,
        },
        {
            accessorKey: "location",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
            cell: ({ row }) => {
                const submission = row.original;
                const value = getFieldValue(
                    submission.id,
                    "location",
                    submission.location || ""
                ) as string;

                if (isEditing) {
                    return (
                        <Input
                            value={value}
                            onChange={(e) =>
                                updateEditingData(submission.id, "location", e.target.value)
                            }
                            placeholder="Location"
                            className="w-[85px]"
                        />
                    );
                }

                return (
                    <div className="w-[85px] truncate">
                        {submission.location || <span className="text-muted-foreground">-</span>}
                    </div>
                );
            },
            size: 85,
            meta: {
                className: "w-[85px]",
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Date Submitted" />
            ),
            cell: ({ getValue }) => {
                const date = new Date(getValue() as string);
                return (
                    <div className="text-sm">
                        {date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })}
                    </div>
                );
            },
            size: 90,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const submission = row.original;

                return (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(submission.image_link, "_blank")}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteSubmission?.(submission)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
            size: 80,
        },
    ];
}
