import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/shadcn-io/tabs";
import SubmissionsCarousel from "@/components/SubmissionsCarousel";
import useServerAuthenticate from "@/hooks/use-server-authenticate";
import { getSubmissionsFromThisWeek } from "@/service/data";

export default async function Home() {
  const { isAuthenticated, session, error } = await useServerAuthenticate([
    "user",
    "admin",
  ]);

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">
          {error || "You must be signed in to view this content."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">
          {error || "You must be signed in to view this content."}
        </p>
      </div>
    );
  }

  const submissions = await getSubmissionsFromThisWeek();

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
            {submissions.success ? (
              <SubmissionsCarousel submissions={submissions.data} />
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {submissions.error || "No submissions available"}
              </div>
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
