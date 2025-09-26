import Image from "next/image";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./ui/sidebar";
import { Button } from "./ui/button";
import { CircleUser, Images, LogOut } from "lucide-react";
import { Separator } from "./ui/separator";
import { handleSignOut } from "@/service/auth";

export default function SideNav() {
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
                <p className="text-sm text-gray-500 p-4">© 2025 GGS IT Consulting</p>
            </SidebarFooter>
        </Sidebar>
    );
}
