import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";
import useServerAuthenticate from "@/hooks/use-server-authenticate";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { session } = await useServerAuthenticate(["user", "admin"]);

    // If they are authenticated, render the protected layout
    return (
        <div className="flex h-screen grow-1">
            <SideNav session={session} />

            <main className="flex flex-1 flex-col ">
                <Navbar />
                <div className="flex-1 p-4 md:p-6">{children}</div>
            </main>
        </div>
    );
}
