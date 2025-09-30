import sql from "mssql";

// Define the config object, which is stateless and fine to be recreated.
const config: sql.config = {
    server: process.env.MSSQL_SERVER || "localhost",
    database: process.env.MSSQL_DATABASE || "ggs_photo_contest",
    user: process.env.MSSQL_USER || "",
    password: process.env.MSSQL_PASSWORD || "",
    options: {
        encrypt: process.env.MSSQL_ENCRYPT === "true", // for azure
        trustServerCertificate: process.env.MSSQL_TRUST_SERVER_IFICATE === "true", // for local dev
    },
    port: parseInt(process.env.MSSQL_PORT || "1433", 10),
};

// Use this interface to define a custom property on the global object.
// This prevents TypeScript errors.
declare global {
    var mssqlPool: sql.ConnectionPool | null;
}

let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
    // In a development environment, use the global object to preserve the pool
    // across Hot Module Replacement (HMR) reloads.
    if (process.env.NODE_ENV === "development") {
        if (!global.mssqlPool) {
            console.log("Creating new DEV connection pool...");
            global.mssqlPool = new sql.ConnectionPool(config);
            try {
                await global.mssqlPool.connect();
            } catch (err) {
                global.mssqlPool = null; // Reset on failure
                throw err;
            }
        }
        return global.mssqlPool;
    }

    // In production, use the module-level pool.
    if (!pool) {
        console.log("Creating new PROD connection pool...");
        pool = new sql.ConnectionPool(config);
        try {
            await pool.connect();
        } catch (err) {
            pool = null; // Reset on failure
            throw err;
        }
    }
    return pool;
}

// You almost never need to call this function in a serverless/long-running server environment.
// The pool is meant to be persistent.
export async function closeConnection(): Promise<void> {
    if (process.env.NODE_ENV === "development") {
        if (global.mssqlPool) {
            await global.mssqlPool.close();
            global.mssqlPool = null;
        }
    } else {
        if (pool) {
            await pool.close();
            pool = null;
        }
    }
}

export { sql };
