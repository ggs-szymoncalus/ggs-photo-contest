"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "./ui/sidebar";

export default function Providers({
    children,
    session,
}: {
    children: React.ReactNode;
    session: Session | null;
}) {
    return (
        <SessionProvider session={session}>
            <SidebarProvider defaultOpen>{children}</SidebarProvider>
        </SessionProvider>
    );
}
