/**
 * User related types
 */

import { UserRole, Department } from './auth';

export interface CreateUserDto {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	role: UserRole;
	department: Department;
}

export interface UpdateUserDto {
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	isActive: boolean;
	role?: UserRole;
	department?: Department;
}

export interface UserListDto {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string;
	role: UserRole;
	department: Department;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
