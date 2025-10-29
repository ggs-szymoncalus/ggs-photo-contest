"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/database";
import { USER_ROLES, type UserRole } from "@/types/roles";
import type { ColumnDef } from "@tanstack/react-table";

interface CreateColumnsProps {
    isEditing: boolean;
    editingData: Record<number, Partial<User>>;
    setEditingData: (data: Record<number, Partial<User>>) => void;
}

export function createColumns({
    isEditing,
    editingData,
    setEditingData,
}: CreateColumnsProps): ColumnDef<User>[] {
    const updateEditingData = (userId: number, field: keyof User, value: UserRole) => {
        setEditingData({
            ...editingData,
            [userId]: {
                ...editingData[userId],
                [field]: value,
            },
        });
    };

    const getRoleValue = (userId: number, originalRole: UserRole) => {
        const editingValue = editingData[userId]?.role;
        return (
            editingValue && Object.values(USER_ROLES).includes(editingValue as UserRole)
                ? editingValue
                : originalRole
        ) as UserRole;
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return [
        {
            id: "id",
            accessorKey: "id",
            header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
            cell: ({ row }) => {
                return <div className="text-sm">{row.original.id}</div>;
            },
            enableSorting: true,
            size: 80,
        },
        {
            id: "user",
            header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
            cell: ({ row }) => {
                const user = row.original;
                const initials = getInitials(user.first_name, user.last_name);

                return (
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage
                                src={user.icon}
                                alt={`${user.first_name} ${user.last_name}`}
                            />
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                                {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </div>
                        </div>
                    </div>
                );
            },
            enableSorting: false,
            size: 250,
        },
        {
            accessorKey: "role",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
            cell: ({ row }) => {
                const user = row.original;
                const value = getRoleValue(user.id, user.role);

                if (!isEditing) {
                    return (
                        <Badge variant={value === USER_ROLES.ADMIN ? "destructive" : "secondary"}>
                            {value}
                        </Badge>
                    );
                }

                return (
                    <Select
                        value={value}
                        onValueChange={(newValue: UserRole) =>
                            updateEditingData(user.id, "role", newValue)
                        }
                    >
                        <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={USER_ROLES.ADMIN}>
                                <Badge variant="destructive">admin</Badge>
                            </SelectItem>
                            <SelectItem value={USER_ROLES.USER}>
                                <Badge variant="secondary">user</Badge>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return <div className="text-sm">{date.toLocaleDateString()}</div>;
            },
        },
        {
            accessorKey: "updated_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
            cell: ({ row }) => {
                const date = new Date(row.original.updated_at);
                return <div className="text-sm">{date.toLocaleDateString()}</div>;
            },
        },
    ];
}
