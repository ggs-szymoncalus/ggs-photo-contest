// src/hooks/use-server-authenticate.ts
// Server-only helper that uses next-auth's auth() (NextAuth v5).
"use server";

import { auth } from "@/config/authConfig";
import { getUserByEmail } from "@/service/data";
import { UserRole } from "@/types/roles";
import type { Session } from "next-auth";

type UseServerAuthenticateResult = {
    isAuthenticated: boolean;
    error: string | null;
    session?: Session | null;
};

/**
 * Server helper (not a client-side React hook) that checks the server session
 * via next-auth's auth(). Intended to be called from server components / API routes.
 */
export default async function useServerAuthenticate(
    requiredRole?: UserRole | UserRole[]
): Promise<UseServerAuthenticateResult> {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return { isAuthenticated: false, error: null, session: null };
        }

        if (requiredRole) {
            const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            const userEmail = session.user.email;
            if (!userEmail) {
                return { isAuthenticated: false, error: "User email not found in session", session };
            }

            const userResponse = await getUserByEmail(userEmail);
            if (!userResponse.success || !userResponse.data) {
                return { isAuthenticated: false, error: "Failed to retrieve user data", session };
            }

            const userRole = userResponse.data.role;

            const hasRole = userRole !== null && requiredRoles.includes(userRole);
            if (!hasRole) {
                return { isAuthenticated: false, error: "User does not have the required role", session };
            }
        }

        return { isAuthenticated: true, error: null, session };
    } catch (err: unknown) {
        return { isAuthenticated: false, error: (err instanceof Error ? err.message : "Unknown error checking session"), session: null };
    }
}
