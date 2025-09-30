"use server";

import type { CreateUserData, UpdateUserData } from "@/actions/userActions";
import { getConnection } from "@/lib/database";
import type { Submission, User } from "@/types/database";
import type { ServiceResponse } from "@/types/response";

export async function getSubmissions(): Promise<ServiceResponse<Submission[]>> {
    try {
        const pool = await getConnection();

        if (!pool) {
            return {
                success: false,
                code: "S-00002",
                error: "Failed to connect to the database",
            };
        }

        const submissions = await pool.request().query("SELECT * FROM submissions");

        return {
            success: true,
            data: submissions.recordset,
        };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return {
            success: false,
            code: "S-00001",
            error: "An unexpected error occurred while fetching submissions",
        };
    }
}

export async function getSubmissionsFromThisWeek(): Promise<ServiceResponse<Submission[]>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "S-00002",
                error: "Failed to connect to the database",
            };
        }

        const query = `
            DECLARE @uid int;
            DECLARE @ThisMondayUTC DATETIME;
            DECLARE @CurrentCESTTime DATETIME;

            SET DATEFIRST 1;

            SET @CurrentCESTTime = (SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'Central European Standard Time');

            DECLARE @ThisMondayCEST DATETIME = CAST(DATEADD(dd, -(DATEPART(dw, @CurrentCESTTime) - 1), @CurrentCESTTime) AS DATE);

            SET @ThisMondayUTC = @ThisMondayCEST AT TIME ZONE 'Central European Standard Time' AT TIME ZONE 'UTC';

            SELECT 
                s.id,
                u.first_name + ' ' + u.last_name AS [name],
                s.image_link,
                s.title,
                s.description,
                c.name AS [category],
                s.location,
                s.created_at
            FROM submissions s
            JOIN users u ON s.user_id = u.id
            JOIN categories c ON c.id = s.category_id
            WHERE s.created_at >= @ThisMondayUTC
            ORDER BY s.created_at DESC;`;

        //        CASE WHEN v.user_id IS NOT NULL THEN 1 ELSE 0 END AS [vote]
        // If you have the current user's email available, pass it here instead of ''
        const result = await pool.request().query(query);

        return {
            success: true,
            data: result.recordset,
        };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return {
            success: false,
            code: "S-00003",
            error: "An unexpected error occurred while fetching submissions",
        };
    }
}

export async function getSubmissionsByUserId(
    userId: number
): Promise<ServiceResponse<Submission[]>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "S-02002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool

            .request()
            .input("userId", userId)
            .query("SELECT * FROM submissions WHERE user_id = @userId");
        return {
            success: true,
            data: result.recordset,
        };
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return {
            success: false,
            code: "S-02001",
            error: "An unexpected error occurred while fetching submissions",
        };
    }
}

export async function getSubmissionById(
    submissionId: number
): Promise<ServiceResponse<Submission>> {
    try {
        const pool = await getConnection();

        if (!pool) {
            return {
                success: false,
                code: "S-01002",
                error: "Failed to connect to the database",
            };
        }

        const result = await pool

            .request()
            .input("submissionId", submissionId)
            .query("SELECT * FROM submissions WHERE id = @submissionId");

        if (result.recordset.length === 0) {
            return {
                success: false,
                code: "S-01003",
                error: "Submission not found",
            };
        }

        return {
            success: true,
            data: result.recordset[0],
        };
    } catch (error) {
        console.error("Error fetching submission:", error);
        return {
            success: false,
            code: "S-01001",
            error: "An unexpected error occurred while fetching the submission",
        };
    }
}

export async function getUserByEmail(email: string): Promise<ServiceResponse<User>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "U-00002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("email", email)
            .query("SELECT id, email, first_name, last_name, role FROM users WHERE email = @email");
        if (result.recordset.length === 0) {
            return {
                success: false,
                code: "U-00003",
                error: "User not found",
            };
        }
        return {
            success: true,
            data: result.recordset[0],
        };
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return {
            success: false,
            code: "U-00001",
            error: "An unexpected error occurred while fetching the user",
        };
    }
}

export async function getUserById(userId: number): Promise<ServiceResponse<User>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "U-04002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool

            .request()
            .input("userId", userId)
            .query(
                "SELECT id, email, first_name + ' ' + last_name as name, role FROM users WHERE id = @userId"
            );
        if (result.recordset.length === 0) {
            return {
                success: false,
                code: "U-04003",
                error: "User not found",
            };
        }
        return {
            success: true,
            data: result.recordset[0],
        };
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return {
            success: false,
            code: "U-04001",
            error: "An unexpected error occurred while fetching the user",
        };
    }
}

export async function addUser(data: CreateUserData): Promise<ServiceResponse<User>> {
    try {
        const { email, first_name, last_name, icon, role } = data;
        const pool = await getConnection();

        if (!pool) {
            return {
                success: false,
                code: "U-01002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("email", email)
            .input("first_name", first_name)
            .input("last_name", last_name)
            .input("icon", icon)
            .input("role", role)
            .query(
                `INSERT INTO users (email, first_name, last_name, icon, role)
                    OUTPUT INSERTED.id, INSERTED.email, INSERTED.first_name, INSERTED.last_name, INSERTED.role
                    VALUES (@email, @first_name, @last_name, @icon, @role)`
            );
        return {
            success: true,
            data: result.recordset[0],
        };
    } catch (error) {
        console.error("Error adding user:", error);
        return {
            success: false,
            code: "U-01001",
            error: "An unexpected error occurred while adding the user",
        };
    }
}

export async function deleteUser(userId: number): Promise<ServiceResponse<boolean>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "U-02002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("userId", userId)
            .query("DELETE FROM users WHERE id = @userId");
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                code: "U-02003",
                error: "User not found",
            };
        }
        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            code: "U-02001",
            error: "An unexpected error occurred while deleting the user",
        };
    }
}

export async function updateUser(
    userId: number,
    data: UpdateUserData
): Promise<ServiceResponse<User>> {
    try {
        const { email, first_name, last_name, icon, role } = data;
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "U-03002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("userId", userId)
            .input("email", email)
            .input("first_name", first_name)
            .input("last_name", last_name)
            .input("icon", icon)
            .input("role", role)
            .input("updated_at", new Date())
            .query(
                `UPDATE users
                    SET email = COALESCE(@email, email),
                        first_name = COALESCE(@first_name, first_name),
                        last_name = COALESCE(@last_name, last_name),
                        icon = @icon,
                        role = COALESCE(@role, role),
                        updated_at = @updated_at
                    WHERE id = @userId`
            );
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                code: "U-03003",
                error: "User not found",
            };
        }

        const user = await getUserById(userId);

        if (!user.success || !user.data) {
            return {
                success: false,
                code: "U-03004",
                error: "Failed to retrieve updated user",
            };
        }

        return {
            success: true,
            data: user.data,
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            success: false,
            code: "U-03001",
            error: "An unexpected error occurred while updating the user",
        };
    }
}

export async function getUsers(): Promise<ServiceResponse<User[]>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "U-05002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool.request().query("SELECT * FROM users");
        return {
            success: true,
            data: result.recordset,
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            success: false,
            code: "U-05001",
            error: "An unexpected error occurred while fetching users",
        };
    }
}
