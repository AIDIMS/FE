import { UserRole } from '../types/auth';

/**
 * Route permissions configuration
 * Defines which roles can access each route
 */
export interface RoutePermission {
	path: string;
	roles: UserRole[];
	exact?: boolean; // If true, only match exact path, otherwise match prefix
}

export const routePermissions: RoutePermission[] = [
	// Dashboard - Admin only
	{
		path: '/dashboard',
		roles: [UserRole.Admin],
		exact: true,
	},

	// User Management - Admin only
	{
		path: '/users',
		roles: [UserRole.Admin],
	},

	// Receptionist pages - Admin and Receptionist
	{
		path: '/receptionist',
		roles: [UserRole.Admin, UserRole.Receptionist],
	},

	// Doctor pages - Admin and Doctor
	{
		path: '/doctor',
		roles: [UserRole.Admin, UserRole.Doctor],
	},

	// Visit detail - Admin and Doctor (doctors view patient visits)
	{
		path: '/visits',
		roles: [UserRole.Admin, UserRole.Doctor],
	},

	// Technician pages - Admin and Technician
	{
		path: '/technician',
		roles: [UserRole.Admin, UserRole.Technician],
	},

	// Patient management - Admin, Doctor, Receptionist
	{
		path: '/patients',
		roles: [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist],
	},

	// Notifications - All authenticated users
	{
		path: '/notifications',
		roles: [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Technician],
	},

	// Settings - All authenticated users
	{
		path: '/settings',
		roles: [UserRole.Admin, UserRole.Doctor, UserRole.Receptionist, UserRole.Technician],
	},

	// Records - Admin and Doctor
	{
		path: '/records',
		roles: [UserRole.Admin, UserRole.Doctor],
	},
];

/**
 * Check if a role has permission to access a path
 */
export function hasPermission(path: string, role: UserRole | undefined): boolean {
	if (role === undefined) return false;

	// Find matching permission
	const permission = routePermissions.find(p => {
		if (p.exact) {
			return path === p.path;
		}
		return path === p.path || path.startsWith(p.path + '/');
	});

	// If no permission defined, deny access (secure by default)
	if (!permission) {
		// Allow public routes
		const publicPaths = ['/auth', '/privacy', '/terms'];
		if (publicPaths.some(p => path.startsWith(p))) {
			return true;
		}
		return false;
	}

	return permission.roles.includes(role);
}

/**
 * Get default redirect path based on user role
 */
export function getDefaultPathForRole(role: UserRole): string {
	switch (role) {
		case UserRole.Admin:
			return '/dashboard';
		case UserRole.Doctor:
			return '/doctor/queue';
		case UserRole.Receptionist:
			return '/receptionist';
		case UserRole.Technician:
			return '/technician/worklist';
		default:
			return '/auth/login';
	}
}

/**
 * Get role display name in Vietnamese
 */
export function getRoleDisplayName(role: UserRole): string {
	switch (role) {
		case UserRole.Admin:
			return 'Quản trị viên';
		case UserRole.Doctor:
			return 'Bác sĩ';
		case UserRole.Receptionist:
			return 'Lễ tân';
		case UserRole.Technician:
			return 'Kỹ thuật viên';
		default:
			return 'Không xác định';
	}
}
