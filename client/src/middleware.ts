import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ROUTE } from "./configs/routerLinks";

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    const userAgent = request.headers.get("user-agent") || "";
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    const device = isMobile ? "mobile" : "desktop";
    if (!request.nextUrl.pathname.startsWith(ADMIN_ROUTE)) {
        if (device !== "desktop") {
            response.cookies.set("theme", "dark", {
                httpOnly: false,
                maxAge: 60 * 60 * 24 * 365,
            });
        } else {
            response.cookies.set("theme", "light", {
                httpOnly: false,
                maxAge: 60 * 60 * 24 * 365,
            });
        }
    }

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
