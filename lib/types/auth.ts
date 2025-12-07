export interface LoginDto {
	username: string;
	password: string;
}

export interface AuthResponseDto {
	accessToken: string;
	refreshToken: string;
	expiresAt: string;
	user: UserDto;
}

export interface UserDto {
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
	updatedAt?: string;
}

export interface RefreshTokenDto {
	refreshToken: string;
}

export interface ChangePasswordDto {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export enum UserRole {
	Admin = 0,
	Doctor = 1,
	Receptionist = 2,
	Technician = 3,
}

export enum Department {
	Administration = 0,
	Pulmonology = 1,
	Radiology = 2,
	LungFunction = 3,
}
