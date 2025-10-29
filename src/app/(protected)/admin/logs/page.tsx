type Log = {
    id: string;
    level: "info" | "warn" | "error";
    message: string;
    timestamp: string;
    userId?: string;
};

const MOCK_LOGS: Log[] = [
    {
        id: "log_1",
        level: "info",
        message: "User signed in",
        timestamp: new Date().toISOString(),
        userId: "user_123",
    },
    {
        id: "log_2",
        level: "warn",
        message: "Password attempt failed",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: "user_456",
    },
    {
        id: "log_3",
        level: "error",
        message: "Failed to process upload",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
];

async function fetchMockLogs(): Promise<
    { success: true; data: Log[] } | { success: false; error: string; code?: number }
> {
    // simulate async fetch latency
    await new Promise((r) => setTimeout(r, 50));
    return { success: true, data: MOCK_LOGS };
}

export default async function AdminLogsPage() {
    const res = await fetchMockLogs();

    if (!res.success) {
        return (
            <div>
                <h1>Admin Logs</h1>
                <p>Error: {res.error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Admin Logs (MOCK)</h1>
            <ul>
                {res.data.map((log) => (
                    <li key={log.id}>
                        <strong>[{log.level.toUpperCase()}]</strong>{" "}
                        {new Date(log.timestamp).toLocaleString()} — {log.message}
                        {log.userId ? <span> (user: {log.userId})</span> : null}
                    </li>
                ))}
            </ul>
        </div>
    );
}
