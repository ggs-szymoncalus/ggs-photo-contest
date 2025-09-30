"use client";

import { handleSignOut } from "@/service/auth";
import { CircleUser, Database, Images, LogOut } from "lucide-react";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

export default function SideNav({ session }: { session?: Session | null }) {
    const user = session?.user;

    return (
        <Sidebar>
            <SidebarHeader className="bg-white dark:bg-gray-800">
                <Link href="/" className="w-full">
                    <Button variant="ghost" className="h-auto justify-start px-1 w-full">
                        <Image src="/GGSPC.svg" alt="Logo" width={50} height={50} />
                        <div className="flex flex-col -space-y-1">
                            <h1 className="font-black text-left text-xl text-indigo-900">GGS</h1>
                            <p className="text-sm text-indigo-500   ">Photo Contest</p>
                        </div>
                    </Button>
                </Link>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <SidebarGroup>
                    <Button variant="outline" className="h-auto justify-start mb-1">
                        <CircleUser />
                        <span className="ml-2">Profile</span>
                    </Button>
                    <Button variant="outline" className="h-auto justify-start mb-1">
                        <Images />
                        <span className="ml-2">Gallery</span>
                    </Button>
                    {user?.isAdmin && (
                        <Link href="/admin/users/" className="w-full">
                            <Button variant="outline" className="h-auto justify-start mb-1 w-full">
                                <Database />
                                <span className="ml-2">Admin Panel</span>
                            </Button>
                        </Link>
                    )}
                    <form action={handleSignOut}>
                        <Button
                            variant="outline"
                            className="h-auto justify-start mb-1 w-full" // Add w-full to fill form
                            type="submit" // Use type="submit"
                        >
                            <LogOut className="mr-2" /> {/* Add margin for spacing */}
                            Sign out
                        </Button>
                    </form>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center gap-2 p-4">
                    <Avatar>
                        <AvatarImage
                            src={user?.image ?? "https://github.com/shadcn.png"}
                            alt="@shadcn"
                        />
                        <AvatarFallback>
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <Separator />
                <p className="text-sm text-gray-500 p-4">© 2025 GGS IT Consulting</p>
            </SidebarFooter>
        </Sidebar>
    );
}
