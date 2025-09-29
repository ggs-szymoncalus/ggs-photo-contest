"use client";

import { useEffect, useState } from "react";
import { Spinner } from "./ui/shadcn-io/spinner";

// Define the shape of our state for better type safety
interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function Navbar() {
    // Initialize state to null to prevent SSR/hydration mismatch
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextMonday = new Date();

            // NOTE: The original timeZone logic was not modifying the date.
            // This logic calculates based on the local time of the execution environment (server or client).

            const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
            let daysToAdd = (8 - dayOfWeek) % 7;
            if (daysToAdd === 0) {
                // If it's currently Monday, target next Monday
                daysToAdd = 7;
            }

            nextMonday.setDate(now.getDate() + daysToAdd);
            nextMonday.setHours(0, 0, 0, 0);

            const difference = nextMonday.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        // 1. Calculate the time immediately on component mount
        calculateTimeLeft();

        // 2. Then set the interval to update it every second
        const timer = setInterval(calculateTimeLeft, 1000);

        // 3. Clean up the interval when the component unmounts
        return () => clearInterval(timer);
    }, []);

    const isLessThanOneDayLeft = timeLeft && timeLeft.days < 1;

    return (
        <nav
            className={`w-full border-b ${
                isLessThanOneDayLeft
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
            }`}
        >
            <div className="flex items-center justify-center py-4">
                <div className="text-sm">
                    {/* Render a placeholder or the actual time */}
                    {timeLeft ? (
                        `Submissions close in: ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`
                    ) : (
                        <Spinner variant="circle" className="h-5 w-5" />
                    )}
                </div>
            </div>
        </nav>
    );
}
