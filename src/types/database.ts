import { UserRole } from "./roles";

export interface Submission {
    id: number;
    userId: number;
    categoryId: number;
    photoUrl: string;
    title: string;
    description?: string;
    location?: string;
    submittedAt: Date;
    isWinner: boolean;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: UserRole;
}
