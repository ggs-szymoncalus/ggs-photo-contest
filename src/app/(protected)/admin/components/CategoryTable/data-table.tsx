"use client";

import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Category } from "@/types/database";
import {
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table";
import { Edit, Save, Search, X } from "lucide-react";
import { useState } from "react";
import { AddCategoryDialog } from "./add-category-dialog";
import { createColumns } from "./create-columns";
import { DeleteCategoryModal } from "./delete-category-modal";
import { GroupActions } from "./group-actions";

interface DataTableProps {
    data: Category[];
    onUpdateCategory?: (categoryId: number, updates: Partial<Category>) => Promise<void>;
}

export function DataTable({ data, onUpdateCategory }: DataTableProps) {
    // Default sorting by ID ascending
    const [sorting, setSorting] = useState<SortingState>([{ id: "id", desc: false }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingData, setEditingData] = useState<Record<number, Partial<Category>>>({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    // Inline editing handlers
    const handleSaveCategory = async (categoryId: number, updates: Partial<Category>) => {
        try {
            if (onUpdateCategory) {
                await onUpdateCategory(categoryId, updates);
            }

            // Remove the category from editing data after successful save
            const newEditingData = { ...editingData };
            delete newEditingData[categoryId];
            setEditingData(newEditingData);
        } catch (error) {
            console.error("Failed to update category:", error);
        }
    };

    const handleSaveAll = async () => {
        try {
            // Save all categories with changes
            for (const [categoryIdStr, updates] of Object.entries(editingData)) {
                const categoryId = parseInt(categoryIdStr);
                if (Object.keys(updates).length > 0) {
                    await handleSaveCategory(categoryId, updates);
                }
            }
        } catch (error) {
            console.error("Failed to save all changes:", error);
        }
    };

    const handleToggleEdit = () => {
        if (isEditing) {
            // Cancel editing - clear all editing data
            setEditingData({});
        }
        setIsEditing(!isEditing);
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    // Create columns with inline editing support
    const columns = createColumns({
        isEditing,
        editingData,
        setEditingData,
        onDeleteClick: handleDeleteClick,
    });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    const hasUnsavedChanges = Object.keys(editingData).length > 0;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Filter categories..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="max-w-sm pl-8"
                        />
                    </div>
                    <DataTableViewOptions table={table} />
                </div>

                <div className="flex items-center space-x-2">
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                        <GroupActions table={table} />
                    )}
                    {hasUnsavedChanges && isEditing && (
                        <>
                            <span className="text-sm text-amber-600">Unsaved changes</span>
                            <Button size="sm" variant="default" onClick={handleSaveAll}>
                                <Save className="mr-2 h-4 w-4" />
                                Save All
                            </Button>
                        </>
                    )}
                    <Button
                        variant={isEditing ? "destructive" : "default"}
                        size="sm"
                        onClick={handleToggleEdit}
                    >
                        {isEditing ? (
                            <>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </>
                        ) : (
                            <>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </>
                        )}
                    </Button>
                    <AddCategoryDialog />
                </div>
            </div>

            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <Table className="w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="px-4">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={isEditing ? "bg-muted/20" : ""}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-4">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <DataTablePagination table={table} />

            <DeleteCategoryModal
                category={categoryToDelete}
                open={deleteModalOpen}
                onOpenChange={handleDeleteModalClose}
            />
        </div>
    );
}
