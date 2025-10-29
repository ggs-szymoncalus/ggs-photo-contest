"use client";

import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getCategories, getUsers } from "@/service/data";
import type { Category, Submission, User } from "@/types/database";
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
import { Edit, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createColumns } from "./create-columns";

interface SubmissionWithDetails extends Submission {
    name?: string; // User name
    category?: string; // Category name
}

interface DataTableProps {
    data: SubmissionWithDetails[];
    onDeleteSubmission?: (submissionId: number) => Promise<void>;
    onBatchDelete?: (submissionIds: number[]) => Promise<void>;
    onUpdateSubmission?: (
        submissionId: number,
        updates: Partial<SubmissionWithDetails>
    ) => Promise<void>;
}

export function DataTable({
    data,
    onDeleteSubmission,
    onBatchDelete,
    onUpdateSubmission,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteMode, setDeleteMode] = useState<"single" | "batch">("single");
    const [submissionToDelete, setSubmissionToDelete] = useState<SubmissionWithDetails | null>(
        null
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingData, setEditingData] = useState<Record<number, Partial<SubmissionWithDetails>>>(
        {}
    );
    const [categories, setCategories] = useState<Category[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesResult, usersResult] = await Promise.all([
                    getCategories(),
                    getUsers(),
                ]);

                if (categoriesResult.success) {
                    setCategories(categoriesResult.data);
                }

                if (usersResult.success) {
                    setUsers(usersResult.data);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    const handleSaveSubmission = async (
        submissionId: number,
        updates: Partial<SubmissionWithDetails>
    ) => {
        try {
            if (onUpdateSubmission) {
                await onUpdateSubmission(submissionId, updates);
            }

            // Remove the submission from editing data after successful save
            const newEditingData = { ...editingData };
            delete newEditingData[submissionId];
            setEditingData(newEditingData);
        } catch (error) {
            console.error("Failed to update submission:", error);
        }
    };

    const handleSaveAll = async () => {
        try {
            // Save all submissions with changes
            for (const [submissionIdStr, updates] of Object.entries(editingData)) {
                const submissionId = parseInt(submissionIdStr);
                if (Object.keys(updates).length > 0) {
                    await handleSaveSubmission(submissionId, updates);
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

    const handleDeleteSingle = (submission: SubmissionWithDetails) => {
        setSubmissionToDelete(submission);
        setDeleteMode("single");
        setShowDeleteDialog(true);
    };

    const handleDeleteSelected = () => {
        setDeleteMode("batch");
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteMode === "single" && submissionToDelete && onDeleteSubmission) {
                await onDeleteSubmission(submissionToDelete.id);
            } else if (deleteMode === "batch" && onBatchDelete) {
                const selectedIds = Object.keys(rowSelection).map(
                    (index) => data[parseInt(index)].id
                );
                await onBatchDelete(selectedIds);
                setRowSelection({});
            }
            setShowDeleteDialog(false);
            setSubmissionToDelete(null);
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = createColumns({
        isEditing,
        editingData,
        setEditingData,
        categories,
        users,
        onDeleteSubmission: handleDeleteSingle,
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
        enableRowSelection: true,
        getRowId: (row) => row.id.toString(),
    });

    const selectedRowCount = Object.keys(rowSelection).length;

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search submissions..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="pl-8 max-w-sm"
                        />
                    </div>
                    {selectedRowCount > 0 && !isEditing && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected ({selectedRowCount})
                        </Button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {isEditing && Object.keys(editingData).length > 0 && (
                        <Button variant="default" size="sm" onClick={handleSaveAll}>
                            <Save className="mr-2 h-4 w-4" />
                            Save All Changes
                        </Button>
                    )}
                    <Button
                        variant={isEditing ? "outline" : "secondary"}
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
                    <DataTableViewOptions table={table} />
                </div>
            </div>
            <div className="rounded-md border mb-2">
                <div className="relative w-full overflow-auto">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const metaClass =
                                            (
                                                header.column.columnDef as unknown as Record<
                                                    string,
                                                    unknown
                                                >
                                            ).meta &&
                                            ((
                                                (
                                                    header.column.columnDef as unknown as Record<
                                                        string,
                                                        unknown
                                                    >
                                                ).meta as Record<string, unknown>
                                            ).className as string | undefined);
                                        const headClass = metaClass ?? "px-4";

                                        return (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className={`${headClass}`}
                                            >
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
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const metaClass =
                                                (
                                                    cell.column.columnDef as unknown as Record<
                                                        string,
                                                        unknown
                                                    >
                                                ).meta &&
                                                ((
                                                    (
                                                        cell.column.columnDef as unknown as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    ).meta as Record<string, unknown>
                                                ).className as string | undefined);
                                            const cellClass = metaClass ?? "px-4";

                                            return (
                                                <TableCell key={cell.id} className={`${cellClass}`}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            );
                                        })}
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {deleteMode === "single"
                                ? "Delete Submission"
                                : "Delete Multiple Submissions"}
                        </DialogTitle>
                        <DialogDescription>
                            {deleteMode === "single"
                                ? `Are you sure you want to delete "${submissionToDelete?.title}"? This action cannot be undone.`
                                : `Are you sure you want to delete ${selectedRowCount} submissions? This action cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
