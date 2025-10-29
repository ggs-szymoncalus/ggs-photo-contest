import UserTabs from "@/components/UserTabs";

export default function ContestLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <UserTabs />
            {children}
        </>
    );
}
