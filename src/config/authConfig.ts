import { addUser, getUserByEmail, updateUser } from "@/service/data";
import { USER_ROLES } from "@/types/roles";
import NextAuth from "next-auth";
import Slack from "next-auth/providers/slack";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Slack({
            clientId: process.env.SLACK_CLIENT_ID || "",
            clientSecret: process.env.SLACK_CLIENT_SECRET || "",
        }),
    ],
    session: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        strategy: "jwt",
    },
    pages: {
        signIn: "/signin", // Specifies the custom sign-in page
    },
    callbacks: {
        async redirect({ baseUrl }) {
            return baseUrl;
        },
        async signIn({ profile }) {
            const teamId = profile?.["https://slack.com/team_id"];

            if (teamId && teamId === process.env.SLACK_TEAM_ID) {
                const userExists = await getUserByEmail(profile?.email ?? "");

                if (userExists.success) {
                    const updateResponse = await updateUser(userExists.data.id, {
                        icon: profile.picture,
                    });
                    if (!updateResponse) {
                        console.error(`Failed to update user icon for ${profile.email}`);
                    }
                    return true;
                } else {
                    const addResponse = await addUser({
                        email: profile?.email ?? "",
                        first_name: profile?.given_name ?? "Unknown",
                        last_name: profile?.family_name ?? "User",
                        icon: profile?.picture ?? null,
                        role: USER_ROLES.USER,
                    });

                    if (!addResponse) {
                        console.error(`Failed to create user for ${profile.email}`);
                        return false;
                    }

                    return true;
                }
            } else {
                console.warn(`Unauthorized login attempt from team ID: ${teamId}`);
                return false;
            }
        },
        async jwt({ token, trigger }) {
            // The user's role is only fetched from the database on initial sign-in.
            if (trigger === "signIn") {
                const userExists = await getUserByEmail(token.email ?? "");

                if (userExists.success && userExists.data) {
                    token.isAdmin = userExists.data.role === "admin";
                    token.userId = userExists.data.id;
                }
            }

            // On every subsequent request, the role is read directly from the token,
            // requiring NO database call.
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.isAdmin = token.isAdmin as boolean;
                // Override the id field with our database ID
                Object.assign(session.user, { id: token.userId as number });
            }
            return session;
        },
        async authorized({ auth }) {
            return !!auth;
        },
    },
});
