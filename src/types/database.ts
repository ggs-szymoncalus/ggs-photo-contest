import type { UserRole } from "./roles";

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
    firstName: string;
    lastName: string;
    imageLink?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}
