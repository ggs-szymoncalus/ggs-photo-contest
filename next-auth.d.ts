import type { DefaultSession } from "next-auth";
import type { UserRole } from "./src/types/roles";

declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** Whether the user is an admin. */
            isAdmin: boolean;
            /**
             * By default, TypeScript merges new interface properties case-insensitively.
             * To make them case-sensitive, add a unique property, like so:
             * @see https://github.com/nextauthjs/next-auth/issues/4023
             */
        } & DefaultSession["user"];
    }

    interface User {
        role: UserRole;
    }
}
