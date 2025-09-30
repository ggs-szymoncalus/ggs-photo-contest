import { TabsContent } from "@/components/ui/shadcn-io/tabs";
import { getUsers } from "@/service/data";
import type { User } from "@/types/database";
import { toast } from "sonner";

export default async function AdminUsersPage() {
    const users = await getUsers();

    if (!users.success) {
        toast.error(`Error ${users.code}: ${users.error}`);
    }

    return (
        <TabsContent value="users">
            <h1>Admin Users</h1>
            <ul>
                {users.success &&
                    users.data.map((user: User) => (
                        <li key={user.id}>
                            {user.firstName} {user.lastName}
                        </li>
                    ))}
            </ul>
        </TabsContent>
    );
}
