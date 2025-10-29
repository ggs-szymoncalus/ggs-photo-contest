"use client";

import { getCategories, updateCategory } from "@/service/data";
import type { Category } from "@/types/database";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";

export function CategoryTable() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const result = await getCategories();
                if (!result.success) {
                    throw new Error(result.error || "Failed to fetch categories");
                }
                setCategories(result.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError("Failed to load categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleUpdateCategory = async (categoryId: number, updates: Partial<Category>) => {
        try {
            if (!updates.name) {
                throw new Error("Category name is required");
            }

            const result = await updateCategory(categoryId, updates.name);

            if (!result.success) {
                throw new Error(result.error || "Failed to update category");
            }

            // Update local state
            setCategories((prevCategories) =>
                prevCategories.map((category) =>
                    category.id === categoryId ? { ...category, ...updates } : category
                )
            );
        } catch (error) {
            console.error("Failed to update category:", error);
            throw error; // Re-throw to show error in UI
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading categories...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-destructive">{error}</div>
            </div>
        );
    }

    return <DataTable data={categories} onUpdateCategory={handleUpdateCategory} />;
}

export default CategoryTable;
