"use client";

import type { UpdateUserData } from "@/actions/userActions";
import { getUsers, updateUser } from "@/service/data";
import type { User } from "@/types/database";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";

export function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const result = await getUsers();
                if (!result.success) {
                    throw new Error(result.error || "Failed to fetch users");
                }
                const userData = result.data;
                setUsers(userData);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch users:", err);
                setError("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
        try {
            // Only role can be updated now
            const apiUpdates: UpdateUserData = {};
            if (updates.role !== undefined) apiUpdates.role = updates.role;

            const result = await updateUser(userId, apiUpdates);

            if (!result.success) {
                throw new Error(result.error || "Failed to update user");
            }

            // Update local state
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, ...updates, updated_at: new Date() } : user
                )
            );
        } catch (error) {
            console.error("Failed to update user:", error);
            throw error; // Re-throw to show error in UI
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading users...</div>
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

    return <DataTable data={users} onUpdateUser={handleUpdateUser} />;
}
