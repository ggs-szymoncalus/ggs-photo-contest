import { UserTable } from "../components/UserTable";

export default function AdminUsersPage() {
    return (
        <div className="container mx-auto p-6 max-w-full">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
                    <p className="text-muted-foreground">
                        View and manage user accounts. Only user roles can be edited.
                    </p>
                </div>

                <UserTable />
            </div>
        </div>
    );
}
