"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminTabs() {
    const pathName = usePathname();
    const activeTab = pathName.split("/").pop() || "users";

    return (
        <Tabs className="w-full" value={activeTab}>
            <TabsList className="w-full">
                <TabsTrigger value="users" asChild>
                    <Link href="/admin/users" className="w-full">
                        Users
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="submissions" asChild>
                    <Link href="/admin/submissions" className="w-full">
                        Submissions
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="categories" asChild>
                    <Link href="/admin/categories" className="w-full">
                        Categories
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="logs" asChild>
                    <Link href="/admin/logs" className="w-full">
                        Logs
                    </Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
