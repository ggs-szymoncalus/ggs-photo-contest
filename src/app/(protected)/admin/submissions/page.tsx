import { TabsContent } from "@/components/ui/shadcn-io/tabs";
import { getSubmissions } from "@/service/data";
import type { Submission } from "@/types/database";
import { toast } from "sonner";

export default async function AdminSubmissionsPage() {
    const submissions = await getSubmissions();

    if (!submissions.success) {
        toast.error(`Error ${submissions.code}: ${submissions.error}`);
    }

    return (
        <TabsContent value="submissions">
            <h1>Admin Submissions</h1>
            <ul>
                {submissions.success &&
                    submissions.data.map((submission: Submission) => (
                        <li key={submission.id}>{submission.title}</li>
                    ))}
            </ul>
        </TabsContent>
    );
}
