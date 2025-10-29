import AdminTabs from "./components/AdminTabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <AdminTabs />
            {children}
        </div>
    );
}
