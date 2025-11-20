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
	updatedAt: string;
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
	Radiologist = 2,
	Technician = 3,
}

export enum Department {
	Radiology = 0,
	Cardiology = 1,
	Neurology = 2,
	Oncology = 3,
	Pediatrics = 4,
	Emergency = 5,
	Orthopedics = 6,
	GeneralMedicine = 7,
	PACS = 8,
}
