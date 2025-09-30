import { Tabs, TabsContents, TabsList, TabsTrigger } from "@/components/ui/shadcn-io/tabs";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Tabs className="w-full">
                <TabsList className="w-full">
                    <Link href="/admin/users" className="w-full">
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </Link>
                    <Link href="/admin/submissions" className="w-full">
                        <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    </Link>
                    <Link href="/admin/logs" className="w-full">
                        <TabsTrigger value="logs">Logs</TabsTrigger>
                    </Link>
                </TabsList>
                <TabsContents>{children}</TabsContents>
            </Tabs>
        </div>
    );
}
