"use server";

import type { CreateUserData, UpdateUserData } from "@/actions/userActions";
import { getConnection } from "@/lib/database";
import type { Category, Submission, User } from "@/types/database";
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

        const submissions = await pool.request().query(`
            SELECT 
                s.id,
                s.user_id,
                s.category_id,
                s.image_link,
                s.title,
                s.description,
                s.location,
                s.created_at,
                s.isWinner
            FROM submissions s
            ORDER BY s.created_at DESC
        `);

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
                s.user_id,
                s.category_id,
                s.image_link,
                s.title,
                s.description,
                s.location,
                s.created_at,
                s.isWinner,
                u.first_name + ' ' + u.last_name AS [name],
                c.name AS [category]
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
            .query(`
                SELECT 
                    s.id,
                    s.user_id,
                    s.category_id,
                    s.image_link,
                    s.title,
                    s.description,
                    s.location,
                    s.created_at,
                    s.isWinner
                FROM submissions s
                WHERE s.user_id = @userId
                ORDER BY s.created_at DESC
            `);
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
            .query(`
                SELECT 
                    s.id,
                    s.user_id,
                    s.category_id,
                    s.image_link,
                    s.title,
                    s.description,
                    s.location,
                    s.created_at,
                    s.isWinner
                FROM submissions s
                WHERE s.id = @submissionId
            `);

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

export async function getCategories(): Promise<ServiceResponse<Category[]>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "C-00002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool.request().query("SELECT * FROM categories ORDER BY id");
        return {
            success: true,
            data: result.recordset,
        };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return {
            success: false,
            code: "C-00001",
            error: "An unexpected error occurred while fetching categories",
        };
    }
}

export async function getCategoryById(categoryId: number): Promise<ServiceResponse<Category>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "C-01002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("categoryId", categoryId)
            .query("SELECT * FROM categories WHERE id = @categoryId");
        if (result.recordset.length === 0) {
            return {
                success: false,
                code: "C-01003",
                error: "Category not found",
            };
        }
        return {
            success: true,
            data: result.recordset[0],
        };
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        return {
            success: false,
            code: "C-01001",
            error: "An unexpected error occurred while fetching category by ID",
        };
    }
}

export async function addCategory(name: string): Promise<ServiceResponse<Category>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "C-02002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("name", name)
            .query(
                `INSERT INTO categories (name)
                    OUTPUT INSERTED.id, INSERTED.name
                    VALUES (@name)`
            );
        return {
            success: true,
            data: result.recordset[0],
        };
    } catch (error) {
        console.error("Error adding category:", error);
        return {
            success: false,
            code: "C-02001",
            error: "An unexpected error occurred while adding the category",
        };
    }
}

export async function updateCategory(
    categoryId: number,
    name: string
): Promise<ServiceResponse<Category>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "C-03002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("categoryId", categoryId)
            .input("name", name)
            .query(
                `UPDATE categories
                    SET name = @name
                    WHERE id = @categoryId`
            );
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                code: "C-03003",
                error: "Category not found",
            };
        }

        const category = await getCategoryById(categoryId);
        if (!category.success || !category.data) {
            return {
                success: false,
                code: "C-03004",
                error: "Failed to retrieve updated category",
            };
        }

        return {
            success: true,
            data: category.data,
        };
    } catch (error) {
        console.error("Error updating category:", error);
        return {
            success: false,
            code: "C-03001",
            error: "An unexpected error occurred while updating the category",
        };
    }
}

export async function deleteCategory(categoryId: number): Promise<ServiceResponse<boolean>> {
    try {
        const pool = await getConnection();
        if (!pool) {
            return {
                success: false,
                code: "C-04002",
                error: "Failed to connect to the database",
            };
        }
        const result = await pool
            .request()
            .input("categoryId", categoryId)
            .query("DELETE FROM categories WHERE id = @categoryId");
        if (result.rowsAffected[0] === 0) {
            return {
                success: false,
                code: "C-04003",
                error: "Category not found",
            };
        }
        return {
            success: true,
            data: true,
        };
    } catch (error) {
        console.error("Error deleting category:", error);
        return {
            success: false,
            code: "C-04001",
            error: "An unexpected error occurred while deleting the category",
        };
    }
}
