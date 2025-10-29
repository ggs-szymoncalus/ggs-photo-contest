"use client";

import {
    batchDeleteSubmissions,
    deleteSubmission,
    updateSubmission,
    type UpdateSubmissionData,
} from "@/actions/submissionActions";
import { getSubmissions } from "@/service/data";
import type { Submission } from "@/types/database";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "./data-table";

interface SubmissionWithDetails extends Submission {
    name?: string; // User name
    category?: string; // Category name
}

export function SubmissionTable() {
    const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                const result = await getSubmissions();
                if (!result.success) {
                    throw new Error(result.error || "Failed to fetch submissions");
                }
                const submissionData = result.data;
                setSubmissions(submissionData);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
                setError("Failed to load submissions");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const handleUpdateSubmission = async (
        submissionId: number,
        updates: Partial<SubmissionWithDetails>
    ) => {
        try {
            // Only allow updating specific fields
            const updateData: UpdateSubmissionData = {
                title: updates.title as string,
                description: updates.description || undefined,
                location: updates.location || undefined,
                category_id: updates.category_id as number,
            };

            const result = await updateSubmission(submissionId, updateData);

            if (!result.success) {
                throw new Error(result.error || "Failed to update submission");
            }

            // Update local state
            setSubmissions((prevSubmissions) =>
                prevSubmissions.map((submission) =>
                    submission.id === submissionId
                        ? { ...submission, ...updates, updated_at: new Date() }
                        : submission
                )
            );
            toast.success("Submission updated successfully");
        } catch (error) {
            console.error("Failed to update submission:", error);
            toast.error("Failed to update submission");
            throw error; // Re-throw to show error in UI
        }
    };

    const handleDeleteSubmission = async (submissionId: number) => {
        try {
            const result = await deleteSubmission(submissionId);

            if (!result.success) {
                throw new Error(result.error || "Failed to delete submission");
            }

            // Update local state
            setSubmissions((prev) => prev.filter((submission) => submission.id !== submissionId));
            toast.success("Submission deleted successfully");
        } catch (error) {
            console.error("Failed to delete submission:", error);
            toast.error("Failed to delete submission");
            throw error; // Re-throw to show error in UI
        }
    };

    const handleBatchDelete = async (submissionIds: number[]) => {
        try {
            const result = await batchDeleteSubmissions(submissionIds);

            if (!result.success) {
                throw new Error(result.error || "Failed to delete submissions");
            }

            // Update local state
            setSubmissions((prev) =>
                prev.filter((submission) => !submissionIds.includes(submission.id))
            );
            toast.success(`${result.data?.deletedCount || 0} submissions deleted successfully`);
        } catch (error) {
            console.error("Failed to delete submissions:", error);
            toast.error("Failed to delete submissions");
            throw error; // Re-throw to show error in UI
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading submissions...</div>
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

    return (
        <DataTable
            data={submissions}
            onDeleteSubmission={handleDeleteSubmission}
            onBatchDelete={handleBatchDelete}
            onUpdateSubmission={handleUpdateSubmission}
        />
    );
}
