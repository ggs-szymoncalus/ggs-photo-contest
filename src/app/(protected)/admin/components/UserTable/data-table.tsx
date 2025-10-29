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
import type { User } from "@/types/database";
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
import { createColumns } from "./create-columns";

interface DataTableProps {
    data: User[];
    onUpdateUser?: (userId: number, updates: Partial<User>) => Promise<void>;
}

export function DataTable({ data, onUpdateUser }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingData, setEditingData] = useState<Record<number, Partial<User>>>({});

    const handleSaveUser = async (userId: number, updates: Partial<User>) => {
        try {
            if (onUpdateUser) {
                await onUpdateUser(userId, updates);
            }

            // Remove the user from editing data after successful save
            const newEditingData = { ...editingData };
            delete newEditingData[userId];
            setEditingData(newEditingData);
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const handleSaveAll = async () => {
        try {
            // Save all users with changes
            for (const [userIdStr, updates] of Object.entries(editingData)) {
                const userId = parseInt(userIdStr);
                if (Object.keys(updates).length > 0) {
                    await handleSaveUser(userId, updates);
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

    const columns = createColumns({
        isEditing,
        editingData,
        setEditingData,
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
                            placeholder="Filter users..."
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(String(event.target.value))}
                            className="max-w-sm pl-8"
                        />
                    </div>
                    <DataTableViewOptions table={table} />
                </div>

                <div className="flex items-center space-x-2">
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
                </div>
            </div>

            <div className="rounded-md border mb-2">
                <div className="relative w-full overflow-auto ">
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
        </div>
    );
}
