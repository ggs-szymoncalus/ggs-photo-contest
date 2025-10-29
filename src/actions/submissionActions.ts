"use server";

/* eslint-disable react-hooks/rules-of-hooks */

import serverAuthenticate from "@/hooks/use-server-authenticate";
import { getConnection } from "@/lib/database";
import type { ServiceResponse } from "@/types/response";
import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { join } from "path";

export interface CreateSubmissionData {
    title: string;
    description?: string;
    category_id: number;
    location?: string;
    dateTaken: Date;
}

export async function createSubmission(
    formData: FormData
): Promise<ServiceResponse<{ submissionId: number }>> {
    try {
        // Get authenticated user
        const authResult = await serverAuthenticate();
        if (!authResult.isAuthenticated || !authResult.session?.user?.id) {
            return {
                success: false,
                code: 401,
                error: authResult.error || "You must be logged in to submit a photo",
            };
        }

        // Extract form data
        const title = formData.get("title") as string;
        const description = (formData.get("description") as string) || null;
        const categoryId = parseInt(formData.get("category_id") as string);
        const location = (formData.get("location") as string) || null;
        const photoFile = formData.get("photo") as File;

        // Validate required fields
        if (!title || !categoryId || !photoFile) {
            return {
                success: false,
                code: 400,
                error: "Title, category, and photo are required",
            };
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(photoFile.type)) {
            return {
                success: false,
                code: 400,
                error: "Only JPEG, PNG, and WebP images are allowed",
            };
        }

        // Validate file size (20MB max)
        const maxSize = 20 * 1024 * 1024;
        if (photoFile.size > maxSize) {
            return {
                success: false,
                code: 400,
                error: "File size must be less than 20MB",
            };
        }

        // Create unique filename
        const timestamp = Date.now();
        const userId = authResult.session.user.id;
        const fileExtension = photoFile.name.split(".").pop() || "jpg";
        const fileName = `${userId}_${timestamp}.${fileExtension}`;

        // Ensure uploads directory exists
        const uploadsDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch {
            // Directory might already exist, that's okay
        }

        // Save file to public/uploads
        const filePath = join(uploadsDir, fileName);
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Save submission to database
        const photoUrl = `/uploads/${fileName}`;
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("user_id", userId)
            .input("category_id", categoryId)
            .input("image_link", photoUrl)
            .input("title", title)
            .input("description", description)
            .input("location", location)
            .query(`
                INSERT INTO submissions 
                (user_id, category_id, image_link, title, description, location, created_at, isWinner)
                OUTPUT INSERTED.id
                VALUES 
                (@user_id, @category_id, @image_link, @title, @description, @location, GETDATE(), 0)
            `);

        const submissionId = result.recordset[0].id;

        // Revalidate the submissions page to show the new submission
        revalidatePath("/submissions");

        return {
            success: true,
            data: { submissionId },
        };
    } catch (error) {
        console.error("Error creating submission:", error);
        return {
            success: false,
            code: 500,
            error: "An unexpected error occurred while creating submission",
        };
    }
}

export async function deleteSubmission(submissionId: number): Promise<ServiceResponse<boolean>> {
    try {
        // Get authenticated user
        const authResult = await serverAuthenticate();
        if (!authResult.isAuthenticated || !authResult.session?.user?.id) {
            return {
                success: false,
                code: 401,
                error: authResult.error || "You must be logged in to delete a submission",
            };
        }

        // Check if user owns the submission or is admin
        const pool = await getConnection();
        const submissionResult = await pool
            .request()
            .input("submissionId", submissionId)
            .query("SELECT user_id FROM submissions WHERE id = @submissionId");

        if (submissionResult.recordset.length === 0) {
            return {
                success: false,
                code: 404,
                error: "Submission not found",
            };
        }

        const submission = submissionResult.recordset[0];
        if (submission.user_id !== authResult.session.user.id && !authResult.session.user.isAdmin) {
            return {
                success: false,
                code: 403,
                error: "You can only delete your own submissions",
            };
        }

        // Delete submission from database
        const pool2 = await getConnection();
        await pool2
            .request()
            .input("submissionId", submissionId)
            .query("DELETE FROM submissions WHERE id = @submissionId");

        // Revalidate the submissions page
        revalidatePath("/submissions");

        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error("Error deleting submission:", error);
        return {
            success: false,
            code: 500,
            error: "An unexpected error occurred while deleting submission",
        };
    }
}

export interface UpdateSubmissionData {
    title: string;
    description?: string;
    location?: string;
    category_id: number;
}

export async function updateSubmission(
    submissionId: number,
    data: UpdateSubmissionData
): Promise<ServiceResponse<boolean>> {
    try {
        // Get authenticated user
        const authResult = await serverAuthenticate();
        if (!authResult.isAuthenticated || !authResult.session?.user?.id) {
            return {
                success: false,
                code: 401,
                error: authResult.error || "You must be logged in to update a submission",
            };
        }

        // Check if user owns the submission or is admin
        const pool = await getConnection();
        const submissionResult = await pool
            .request()
            .input("submissionId", submissionId)
            .query("SELECT user_id FROM submissions WHERE id = @submissionId");

        if (submissionResult.recordset.length === 0) {
            return {
                success: false,
                code: 404,
                error: "Submission not found",
            };
        }

        const submission = submissionResult.recordset[0];
        if (submission.user_id !== authResult.session.user.id && !authResult.session.user.isAdmin) {
            return {
                success: false,
                code: 403,
                error: "You can only edit your own submissions",
            };
        }

        // Update submission in database
        const pool2 = await getConnection();
        await pool2
            .request()
            .input("submissionId", submissionId)
            .input("title", data.title)
            .input("description", data.description)
            .input("location", data.location)
            .input("category_id", data.category_id)
            .query(`
                UPDATE submissions 
                SET title = @title, description = @description, location = @location, category_id = @category_id
                WHERE id = @submissionId
            `);

        // Revalidate the submissions page
        revalidatePath("/submissions");
        revalidatePath("/");

        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error("Error updating submission:", error);
        return {
            success: false,
            code: 500,
            error: "An unexpected error occurred while updating submission",
        };
    }
}

export async function batchDeleteSubmissions(
    submissionIds: number[]
): Promise<ServiceResponse<{ deletedCount: number }>> {
    try {
        // Get authenticated user
        const authResult = await serverAuthenticate();
        if (!authResult.isAuthenticated || !authResult.session?.user?.id) {
            return {
                success: false,
                code: 401,
                error: "You must be logged in to delete submissions",
            };
        }

        // Check if user is admin
        if (authResult.session.user.role !== "admin") {
            return {
                success: false,
                code: 403,
                error: "Only administrators can perform batch deletions",
            };
        }

        if (!submissionIds || submissionIds.length === 0) {
            return {
                success: false,
                code: 400,
                error: "No submission IDs provided",
            };
        }

        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: 500,
                error: "Failed to connect to the database",
            };
        }

        // Create placeholders for SQL IN clause
        const placeholders = submissionIds.map((_, index) => `@id${index}`).join(",");

        // Delete submissions
        const request = pool.request();
        submissionIds.forEach((id, index) => {
            request.input(`id${index}`, id);
        });

        const result = await request.query(`
            DELETE FROM submissions 
            WHERE id IN (${placeholders})
        `);

        revalidatePath("/admin/submissions");
        revalidatePath("/submissions");
        revalidatePath("/");

        return {
            success: true,
            data: { deletedCount: result.rowsAffected[0] || 0 },
        };
    } catch (error) {
        console.error("Error batch deleting submissions:", error);
        return {
            success: false,
            code: 500,
            error: "An unexpected error occurred while deleting submissions",
        };
    }
}
