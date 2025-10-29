"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Submission } from "@/types/database";

interface DeleteSubmissionModalProps {
    submission: Submission | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

export default function DeleteSubmissionModal({
    submission,
    isOpen,
    onOpenChange,
    onConfirm,
    isDeleting,
}: DeleteSubmissionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Submission</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{submission?.title}"? This action cannot be
                        undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
