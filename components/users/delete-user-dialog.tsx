'use client';

import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { userService } from '@/lib/api';
import { UserListDto } from '@/lib/types';

interface DeleteUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
	user: UserListDto | null;
}

export function DeleteUserDialog({ open, onOpenChange, onSuccess, user }: DeleteUserDialogProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleDelete = async () => {
		if (!user) return;

		setError('');
		setIsLoading(true);

		try {
			const result = await userService.delete(user.id);

			if (result.isSuccess) {
				onSuccess();
			} else {
				setError(result.message || 'Xóa người dùng thất bại');
			}
		} catch (err: unknown) {
			console.error('Error:', err);
			if (err && typeof err === 'object' && 'message' in err) {
				setError(err.message as string);
			} else {
				setError('Đã xảy ra lỗi. Vui lòng thử lại.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (!user) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-red-600">
						<AlertTriangle className="h-5 w-5" />
						Xóa người dùng
					</DialogTitle>
					<DialogDescription>Hành động này không thể hoàn tác.</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-sm text-gray-700 mb-2">Bạn có chắc chắn muốn xóa người dùng này?</p>
						<div className="mt-3 p-3 bg-white rounded border border-red-100">
							<p className="font-semibold text-gray-900">
								{user.firstName} {user.lastName}
							</p>
							<p className="text-sm text-gray-600">{user.email}</p>
							<p className="text-sm text-gray-600">@{user.username}</p>
						</div>
					</div>

					{error && (
						<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{error}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						Hủy
					</Button>
					<Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
						{isLoading ? 'Đang xóa...' : 'Xóa người dùng'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
