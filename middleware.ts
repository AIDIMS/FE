import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All protected routes (require authentication)
const protectedRoutes = [
	'/dashboard',
	'/patients',
	'/records',
	'/settings',
	'/users',
	'/receptionist',
	'/doctor',
	'/technician',
	'/visits',
	'/notifications',
	'/annotations',
];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const token = request.cookies.get('accessToken')?.value;

	// Check if route requires authentication
	const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

	// Redirect unauthenticated users to login
	if (isProtectedRoute && !token) {
		const url = new URL('/auth/login', request.url);
		url.searchParams.set('redirect', pathname);
		return NextResponse.redirect(url);
	}

	// Redirect authenticated users away from login page
	if (token && pathname === '/auth/login') {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	// Redirect root to dashboard if authenticated, login if not
	if (pathname === '/') {
		if (token) {
			return NextResponse.redirect(new URL('/dashboard', request.url));
		} else {
			return NextResponse.redirect(new URL('/auth/login', request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (images, etc)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
