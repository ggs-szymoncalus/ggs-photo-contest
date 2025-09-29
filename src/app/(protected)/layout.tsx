import { auth } from "@/config/authConfig";
import SideNav from "@/components/SideNav";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    // If the user is not authenticated, redirect them to the sign-in page
    if (!session?.user) {
        redirect("/signin"); // Redirect to your custom sign-in page
    }

    // If they are authenticated, render the protected layout
    return (
        <div className="flex h-screen grow-1">
            <SideNav />

            <main className="flex flex-1 flex-col ">
                <Navbar />
                <div className="flex-1 p-4 md:p-6">{children}</div>
            </main>
        </div>
    );
}
