import type { UserRole } from "./roles";

export interface Submission {
    id: number;
    user_id: number;
    category_id: number;
    image_link: string;
    title: string;
    description?: string;
    location?: string;
    created_at: Date;
    isWinner: boolean;
}

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    icon?: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
}

export interface Category {
    id: number;
    name: string;
}
