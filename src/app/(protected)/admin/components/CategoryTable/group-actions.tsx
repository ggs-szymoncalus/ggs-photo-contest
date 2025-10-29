"use client";

import { useState } from "react";
import { Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type { Table } from "@tanstack/react-table";

import type { Category } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeCategoryById } from "@/actions/categoryActions";

interface GroupActionsProps {
  table: Table<Category>;
}

export function GroupActions({ table }: GroupActionsProps) {
  const [loading, setLoading] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  if (selectedCount === 0) return null;

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedCount} categories? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const row of selectedRows) {
        try {
          const result = await removeCategoryById(row.original.id);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(
              `Failed to delete category ${row.original.name}:`,
              result.error
            );
          }
        } catch (error) {
          errorCount++;
          console.error(`Error deleting category ${row.original.name}:`, error);
        }
      }

      // Clear selection
      table.resetRowSelection();

      // Show results
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully deleted ${successCount} categories`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(
          `Deleted ${successCount} categories, ${errorCount} failed`
        );
      } else {
        toast.error(`Failed to delete categories`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{selectedCount} selected</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading}>
            Group Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Bulk Operations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={handleBulkDelete}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedCount})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
