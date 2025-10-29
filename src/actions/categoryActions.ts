"use server";

import { revalidatePath } from "next/cache";
import { addCategory, updateCategory, deleteCategory } from "@/service/data";
import useServerAuthenticate from "@/hooks/use-server-authenticate";
import { USER_ROLES } from "@/types/roles";

export interface CreateCategoryData {
    name: string;
}

export interface UpdateCategoryData {
    name: string;
}

export async function createCategory(data: CreateCategoryData) {
    // Check admin authorization
    const authResult = await useServerAuthenticate(USER_ROLES.ADMIN);
    if (!authResult.isAuthenticated) {
        return {
            success: false,
            error: authResult.error || "Authentication required. Admin privileges needed to create categories.",
        };
    }

    try {
        const result = await addCategory(data.name);
        
        if (result.success) {
            revalidatePath("/admin/categories");
            return {
                success: true,
                data: result.data,
            };
        }
        
        return {
            success: false,
            error: result.error,
        };
    } catch (error) {
        console.error("Error in createCategory action:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}

export async function editCategory(categoryId: number, data: UpdateCategoryData) {
    // Check admin authorization
    const authResult = await useServerAuthenticate(USER_ROLES.ADMIN);
    if (!authResult.isAuthenticated) {
        return {
            success: false,
            error: authResult.error || "Authentication required. Admin privileges needed to edit categories.",
        };
    }

    try {
        const result = await updateCategory(categoryId, data.name);
        
        if (result.success) {
            revalidatePath("/admin/categories");
            return {
                success: true,
                data: result.data,
            };
        }
        
        return {
            success: false,
            error: result.error,
        };
    } catch (error) {
        console.error("Error in editCategory action:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}

export async function removeCategoryById(categoryId: number) {
    // Check admin authorization
    const authResult = await useServerAuthenticate(USER_ROLES.ADMIN);
    if (!authResult.isAuthenticated) {
        return {
            success: false,
            error: authResult.error || "Authentication required. Admin privileges needed to delete categories.",
        };
    }

    try {
        const result = await deleteCategory(categoryId);
        
        if (result.success) {
            revalidatePath("/admin/categories");
            return {
                success: true,
                data: result.data,
            };
        }
        
        return {
            success: false,
            error: result.error,
        };
    } catch (error) {
        console.error("Error in removeCategoryById action:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}