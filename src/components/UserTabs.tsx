"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function UserTabs() {
    const pathName = usePathname();
    const activeTab = pathName.split("/").pop() || "submissions";

    return (
        <Tabs className="w-full mb-2" value={activeTab}>
            <TabsList className="w-full">
                <TabsTrigger value="submissions" asChild>
                    <Link href="/submissions">Submissions</Link>
                </TabsTrigger>
                <TabsTrigger value="winners" asChild>
                    <Link href="/winners">Winners</Link>
                </TabsTrigger>
                <TabsTrigger value="statistics" asChild>
                    <Link href="/statistics">Statistics</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
