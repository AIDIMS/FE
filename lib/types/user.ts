import { UserRole, Department } from './auth';

export interface CreateUserDto {
	username: string;
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
	role: UserRole;
	department: Department;
}

export interface UpdateUserByIdentifyDto {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber?: string;
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
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
}
