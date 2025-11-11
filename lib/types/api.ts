/**
 * API Response types
 */

export interface ApiResult<T> {
	isSuccess: boolean;
	data?: T;
	message?: string;
	errors?: string[];
}

export interface PaginatedResult<T> {
	items: T[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface ApiError {
	message: string;
	errors?: string[];
	statusCode?: number;
}
