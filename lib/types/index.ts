/**
 * Types - Main export file
 */

export type { ApiResult, PaginatedResult, ApiError } from './api';

export type {
	LoginDto,
	RegisterDto,
	AuthResponseDto,
	UserDto,
	RefreshTokenDto,
	ChangePasswordDto,
} from './auth';

export type { CreateUserDto, UpdateUserDto, UserListDto } from './user';

export { UserRole, Department } from './auth';
