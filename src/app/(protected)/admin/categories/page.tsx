import { CategoryTable } from "../components/CategoryTable/index";

export default function CategoriesPage() {
    return (
        <div className="container mx-auto p-6 max-w-full">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
                    <p className="text-muted-foreground">
                        Create, edit, and manage photo contest categories. Only category names can
                        be edited.
                    </p>
                </div>

                <CategoryTable />
            </div>
        </div>
    );
}
