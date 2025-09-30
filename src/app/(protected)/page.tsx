import SubmissionsCarousel from "@/components/SubmissionsCarousel";
import {
    Tabs,
    TabsContent,
    TabsContents,
    TabsList,
    TabsTrigger,
} from "@/components/ui/shadcn-io/tabs";
import { getSubmissionsFromThisWeek } from "@/service/data";
import { toast } from "sonner";

export default async function Home() {
    const submissions = await getSubmissionsFromThisWeek();

    if (!submissions.success) {
        toast.error(`Error ${submissions.code}: ${submissions.error}`);
    }

    return (
        <div className="flex flex-col h-full w-full">
            <Tabs className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    <TabsTrigger value="winners">Winners</TabsTrigger>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                </TabsList>
                <TabsContents>
                    <TabsContent value="submissions">
                        {submissions.success && (
                            <SubmissionsCarousel submissions={submissions.data} />
                        )}
                    </TabsContent>
                    <TabsContent value="winners">
                        <div className="p-4">Winners content goes here.</div>
                    </TabsContent>
                    <TabsContent value="statistics">
                        <div className="p-4">Statistics content goes here.</div>
                    </TabsContent>
                </TabsContents>
            </Tabs>
        </div>
    );
}
