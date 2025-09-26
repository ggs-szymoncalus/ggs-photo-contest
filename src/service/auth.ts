"use server"; // This directive marks all functions in this file as Server Actions.

import { signOut } from "@/config/authConfig";

export async function handleSignOut() {
    await signOut();
}
