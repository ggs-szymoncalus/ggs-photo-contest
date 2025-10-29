import { SubmissionTable } from "../components/SubmissionTable";

export default function AdminSubmissionsPage() {
    return (
        <div className="container mx-auto p-6 max-w-full mt-6">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Submissions</h1>
                    <p className="text-muted-foreground">
                        View and manage photo contest submissions. Administrators can delete
                        submissions and view details.
                    </p>
                </div>

                <SubmissionTable />
            </div>
        </div>
    );
}
