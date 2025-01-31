import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/signup"];

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow calendar API requests to bypass auth
  if (path.startsWith("/api/calendar/") || path.startsWith("/auth/confirm")) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = publicRoutes.includes(path);

  if (
    user &&
    !user.user_metadata?.onboarding_completed &&
    path !== "/account/onboarding"
  )
    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_APP_URL + "/account/onboarding",
    );

  if (user && (path === "/login" || path === "/signup"))
    return NextResponse.redirect(new URL("/time-tracker", request.url));

  if (!user && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isPublicRoute)
    return NextResponse.redirect(new URL("/time-tracker", request.url));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
