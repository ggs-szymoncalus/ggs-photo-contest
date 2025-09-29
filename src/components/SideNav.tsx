"use client";

import Image from "next/image";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./ui/sidebar";
import { Button } from "./ui/button";
import { CircleUser, Images, LogOut } from "lucide-react";
import { Separator } from "./ui/separator";
import { handleSignOut } from "@/service/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import React from "react";
import { useSession } from "next-auth/react";

export default function SideNav() {
    const session = useSession();
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (session.status === "loading") {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [session.status]);

    return (
        <Sidebar>
            <SidebarHeader className="bg-white dark:bg-gray-800">
                <Button variant="ghost" className="h-auto justify-start px-1">
                    <Image src="/GGSPC.svg" alt="Logo" width={50} height={50} />
                    <div className="flex flex-col -space-y-1">
                        <h1 className="font-black text-left text-xl text-indigo-900">GGS</h1>
                        <p className="text-sm text-indigo-500   ">Photo Contest</p>
                    </div>
                </Button>
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
                            src={session?.data?.user?.image ?? "https://github.com/shadcn.png"}
                            alt="@shadcn"
                            onLoad={() => setLoading(false)}
                        />
                        <AvatarFallback onLoad={() => setLoading(true)}>
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </AvatarFallback>
                    </Avatar>

                    {!loading ? (
                        <div>
                            <p className="text-sm font-medium">{session?.data?.user?.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {session?.data?.user?.email}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <Skeleton className="mb-1 h-4 w-32 rounded" />
                            <Skeleton className="h-3 w-40 rounded" />
                        </div>
                    )}
                </div>
                <Separator />
                <p className="text-sm text-gray-500 p-4">© 2025 GGS IT Consulting</p>
            </SidebarFooter>
        </Sidebar>
    );
}
