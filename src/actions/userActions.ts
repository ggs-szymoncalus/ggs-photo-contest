"use server";

import { revalidatePath } from "next/cache";
import useServerAuthenticate from "@/hooks/use-server-authenticate";
import type { UserRole } from "@/types/roles";
import { addUser, deleteUser, updateUser } from "@/service/data";
import { USER_ROLES } from "@/types/roles";

export interface CreateUserData {
    email: string;
    first_name: string;
    last_name: string;
    icon?: string | null;
    role: UserRole;
}

export interface UpdateUserData {
    email?: string;
    first_name?: string;
    last_name?: string;
    icon?: string | null;
    role?: UserRole;
}

export async function createUser(data: CreateUserData) {
    // Check admin authorization
    const authResult = await useServerAuthenticate(USER_ROLES.ADMIN);
    if (!authResult.isAuthenticated) {
        return {
            success: false,
            error: authResult.error || "Authentication required. Admin privileges needed to create users.",
        };
    }

    const { email, first_name, last_name, role } = data;

    try {
        const slackToken = process.env.SLACK_TOKEN;
        let icon: string | null = null;

        if (slackToken) {
            try {
                const url = new URL("https://slack.com/api/users.lookupByEmail");
                url.searchParams.set("email", email);

                const res = await fetch(url.toString(), {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${slackToken}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });

                if (res.ok) {
                    const body = await res.json();
                    if (body?.ok && body.user?.profile) {
                        // prefer a reasonably sized image; fall back if missing
                        icon =
                            body.user.profile.image_512 ??
                            body.user.profile.image_192 ??
                            body.user.profile.image_72 ??
                            null;
                    }
                }
            } catch {
                console.error("Error fetching Slack user info");
                // Ignore Slack errors and continue without avatar
                icon = null;
            }
        }

        const result = await addUser({ email, first_name, last_name, icon, role });
        
        if (result.success) {
            revalidatePath("/admin/users");
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
        console.error("Error in createUser action:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}

export async function deleteUserById(userId: number) {
    // Check admin authorization
    const authResult = await useServerAuthenticate(USER_ROLES.ADMIN);
    if (!authResult.isAuthenticated) {
        return {
            success: false,
            error: authResult.error || "Authentication required. Admin privileges needed to delete users.",
        };
    }

    try {
        const result = await deleteUser(userId);
        
        if (result.success) {
            revalidatePath("/admin/users");
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
        console.error("Error in deleteUserById action:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}

export async function updateUserById(userId: number, data: UpdateUserData) {
    // Check admin authorization
    const authResult = await useServerAuthenticate(USER_ROLES.ADMIN);
    if (!authResult.isAuthenticated) {
        return {
            success: false,
            error: authResult.error || "Authentication required. Admin privileges needed to update users.",
        };
    }

    try {
        const result = await updateUser(userId, data);
        
        if (result.success) {
            revalidatePath("/admin/users");
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
        console.error("Error in updateUserById action:", error);
        return {
            success: false,
            error: "An unexpected error occurred",
        };
    }
}
