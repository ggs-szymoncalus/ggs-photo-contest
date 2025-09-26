import sql from "mssql";

const config: sql.config = {
    server: process.env.MSSQL_SERVER || "localhost",
    database: process.env.MSSQL_DATABASE || "ggs_photo_contest",
    user: process.env.MSSQL_USER || "",
    password: process.env.MSSQL_PASSWORD || "",
    options: {
        encrypt: process.env.MSSQL_ENCRYPT === "true", // for azure
        trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE === "true", // for local dev
    },
    port: parseInt(process.env.MSSQL_PORT || "1433", 10),
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = new sql.ConnectionPool(config);
        try {
            await pool.connect();
        } catch (err) {
            pool = null;
            throw err;
        }
    }
    return pool;
}

export async function closeConnection(): Promise<void> {
    if (pool) {
        await pool.close();
        pool = null;
    }
}

export { sql };
