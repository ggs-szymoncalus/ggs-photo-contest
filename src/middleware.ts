import { auth } from "@/config/authConfig";

// This function can be marked `async` if using `await` inside
export default auth((req) => {
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/admin")) {
        if (!req.auth?.user.isAdmin) {
            return Response.redirect(new URL("/", req.url));
        }
    }

    if (!req.auth?.user) {
        return Response.redirect(new URL("/signin", req.url));
    }
});

// See "Matching Paths" below to learn more
export const config = {
    runtime: "nodejs",
    matcher: ["/", "/admin/:path*"],
};
