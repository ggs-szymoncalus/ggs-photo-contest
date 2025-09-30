import serverAuthenticate from "@/hooks/use-server-authenticate";
import type { UserRole } from "@/types/roles";
import { addUser, deleteUser, updateUser } from "@/service/data";
import type { ErrorResponse } from "@/types/response";
import { toast } from "sonner";

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

export const createUser = async (data: CreateUserData) => {
    const { email, first_name, last_name, role } = data;
    const { isAuthenticated, session, error } = await serverAuthenticate("admin");

    if (error) {
        toast.error(`An unexpected error occurred: ${error}`);
        return;
    }

    if (!session || !session.user) {
        toast.error("You must be signed in to create a user.");
        return;
    }

    if (!isAuthenticated) {
        toast.error("You must be signed in as an admin to create a user.");
        return;
    }

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

        // Implementation for creating a user (replace with real DB/API call as needed)
        const addedUserResponse = await addUser({ email, first_name, last_name, icon, role });
        if (!addedUserResponse.success || !addedUserResponse.data) {
            const errResponse = addedUserResponse as ErrorResponse;
            toast.error(`Error creating user: ${errResponse.error} (code: ${errResponse.code})`);
            return;
        }
        const createdUser = addedUserResponse.data;

        return createdUser;
    } catch (err) {
        console.error("Error creating user:", err);
        toast.error(`An unexpected error occurred: ${(err as Error).message}`);
        return;
    }
    // Implementation for creating a user
};

export const deleteUserById = async (userId: number) => {
    const { isAuthenticated, session, error } = await serverAuthenticate("admin");
    if (error) {
        toast.error(`An unexpected error occurred: ${error}`);
        return;
    }
    if (!session || !session.user) {
        toast.error("You must be signed in to delete a user.");
        return;
    }
    if (!isAuthenticated) {
        toast.error("You must be signed in as an admin to delete a user.");
        return;
    }
    try {
        await deleteUser(userId);
        toast.success(`User with ID ${userId} deleted successfully.`);
        return true;
    } catch (err) {
        console.error("Error deleting user:", err);
        toast.error(`An unexpected error occurred: ${(err as Error).message}`);
        return false;
    }
    // Implementation for deleting a user
};

export const updateUserById = async (userId: number, data: UpdateUserData) => {
    const { isAuthenticated, session, error } = await serverAuthenticate("admin");
    if (error) {
        toast.error(`An unexpected error occurred: ${error}`);
        return;
    }
    if (!session || !session.user) {
        toast.error("You must be signed in to update a user.");
        return;
    }
    if (!isAuthenticated) {
        toast.error("You must be signed in as an admin to update a user.");
        return;
    }
    try {
        await updateUser(userId, data);
        toast.success(`User with ID ${userId} updated successfully.`);
        return true;
    } catch (err) {
        console.error("Error updating user:", err);
        toast.error(`An unexpected error occurred: ${(err as Error).message}`);
        return false;
    }
    // Implementation for updating a user
};
