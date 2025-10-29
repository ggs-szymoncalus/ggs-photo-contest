"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/database";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

interface CreateColumnsProps {
    isEditing: boolean;
    editingData: Record<number, Partial<Category>>;
    setEditingData: (data: Record<number, Partial<Category>>) => void;
    onDeleteClick: (category: Category) => void;
}

export function createColumns({
    isEditing,
    editingData,
    setEditingData,
    onDeleteClick,
}: CreateColumnsProps): ColumnDef<Category>[] {
    const updateEditingData = (categoryId: number, field: keyof Category, value: string) => {
        if (!setEditingData) return;
        setEditingData({
            ...editingData,
            [categoryId]: {
                ...editingData[categoryId],
                [field]: value,
            },
        });
    };

    const getEditingValue = (
        categoryId: number,
        field: keyof Category,
        originalValue: string | number
    ) => {
        const editingValue = editingData[categoryId]?.[field];
        return (typeof editingValue === "string" ? editingValue : originalValue) as string;
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
        },
        {
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => {
                return <div className="text-sm">{row.original.id}</div>;
            },
            enableSorting: true,
            size: 80,
        },
        {
            accessorKey: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
            cell: ({ row }) => {
                const category = row.original;
                const value = getEditingValue(category.id, "name", category.name);

                if (!isEditing) {
                    return <div className="font-medium">{category.name}</div>;
                }

                return (
                    <Input
                        value={value}
                        onChange={(e) => updateEditingData(category.id, "name", e.target.value)}
                        className="h-8"
                    />
                );
            },
        },
        {
            id: "preview",
            header: "Preview",
            cell: ({ row }) => {
                const category = row.original;
                const value = getEditingValue(category.id, "name", category.name);

                return (
                    <Badge
                        variant="outline"
                        className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                        {value}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const category = row.original;

                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(category)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete category</span>
                    </Button>
                );
            },
        },
    ];
}
