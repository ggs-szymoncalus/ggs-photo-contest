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
                return true;
            } else {
                console.warn(`Unauthorized login attempt from team ID: ${teamId}`);
                return false;
            }
        },
        // async jwt({ token, account }) {
        //     // Persist the OAuth access_token to the token right after signin
        //     return token;
        // },
        // async session({ session, token }) {
        //     // Send properties to the client, like an access_token from a provider.
        //     return session;
        // },
    },
});
