'use client';

import React, { useId, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';
import { getDefaultPathForRole } from '@/lib/config/permissions';
import { authService } from '@/lib/api';

export function LoginForm() {
	const id = useId();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuth();
	const usernameId = `${id}-username`;
	const passwordId = `${id}-password`;

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState('');
	const [sessionExpired, setSessionExpired] = useState(false);

	const [usernameError, setUsernameError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		// Check if redirected due to session expiration
		const session = searchParams.get('session');
		if (session === 'expired') {
			setSessionExpired(true);
			setFormError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
		}
	}, [searchParams]);

	const validateUsername = (value: string) => {
		if (!value) return 'Vui lòng nhập tên đăng nhập';
		if (value.length < 3) return 'Tên đăng nhập phải có ít nhất 3 ký tự';
		return '';
	};

	const validatePassword = (value: string) => {
		if (!value) return 'Vui lòng nhập mật khẩu';
		if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
		return '';
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError('');

		const uErr = validateUsername(username);
		const pErr = validatePassword(password);
		setUsernameError(uErr);
		setPasswordError(pErr);

		if (uErr || pErr) return;

		setIsLoading(true);
		try {
			const success = await login(username, password);

			if (success) {
				// Get redirect URL from query params or use role-based default
				const redirectParam = searchParams.get('redirect');
				const currentUser = authService.getCurrentUser();
				const defaultPath = currentUser ? getDefaultPathForRole(currentUser.role) : '/auth/login';
				const redirectUrl = redirectParam || defaultPath;
				router.push(redirectUrl);
			} else {
				setFormError('Tên đăng nhập hoặc mật khẩu không đúng');
			}
		} catch (err: unknown) {
			console.error('Lỗi đăng nhập:', err);
			if (err && typeof err === 'object' && 'message' in err) {
				setFormError((err.message as string) || 'Tên đăng nhập hoặc mật khẩu không đúng');
			} else {
				setFormError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5" noValidate>
			{/* Username */}
			<div className="space-y-2">
				<Label htmlFor={usernameId} className="text-gray-900 font-medium">
					Tên đăng nhập
				</Label>
				<Input
					id={usernameId}
					type="text"
					autoComplete="username"
					autoFocus
					placeholder="Nhập tên đăng nhập"
					value={username}
					onChange={e => {
						setUsername(e.target.value);
						if (usernameError) setUsernameError('');
					}}
					onBlur={e => setUsernameError(validateUsername(e.target.value))}
					aria-invalid={!!usernameError}
					aria-describedby={usernameError ? `${usernameId}-error` : undefined}
					required
					className="bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
				/>
				{usernameError && (
					<div id={`${usernameId}-error`} className="text-sm text-red-700 mt-1" role="alert">
						{usernameError}
					</div>
				)}
			</div>

			{/* Password */}
			<div className="space-y-2">
				<Label htmlFor={passwordId} className="text-gray-900 font-medium">
					Mật khẩu
				</Label>

				<div className="relative">
					<Input
						id={passwordId}
						type={showPassword ? 'text' : 'password'}
						autoComplete="current-password"
						placeholder="••••••••"
						value={password}
						onChange={e => {
							setPassword(e.target.value);
							if (passwordError) setPasswordError('');
						}}
						onBlur={e => setPasswordError(validatePassword(e.target.value))}
						aria-invalid={!!passwordError}
						aria-describedby={passwordError ? `${passwordId}-error` : undefined}
						required
						className="bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 pr-12"
					/>

					<button
						type="button"
						onClick={() => setShowPassword(s => !s)}
						className="absolute inset-y-0 right-2 p-2 rounded-md text-gray-400 hover:text-gray-600 flex items-center justify-center"
						aria-pressed={showPassword}
						aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
					>
						{showPassword ? (
							<EyeOff size={18} aria-hidden="true" />
						) : (
							<Eye size={18} aria-hidden="true" />
						)}
					</button>
				</div>

				{passwordError && (
					<div id={`${passwordId}-error`} className="text-sm text-red-700 mt-1" role="alert">
						{passwordError}
					</div>
				)}
			</div>

			{/* Form-level error */}
			{formError && (
				<div
					className={`p-3 border rounded-lg text-sm flex items-start gap-2 ${
						sessionExpired
							? 'bg-amber-50 border-amber-200 text-amber-800'
							: 'bg-red-50 border-red-200 text-red-700'
					}`}
					role="alert"
					aria-live="assertive"
				>
					{sessionExpired && (
						<svg
							className="w-5 h-5 shrink-0 mt-0.5"
							fill="currentColor"
							viewBox="0 0 20 20"
							aria-hidden="true"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clipRule="evenodd"
							/>
						</svg>
					)}
					<span>{formError}</span>
				</div>
			)}

			{/* Button Confirm */}
			<Button
				type="submit"
				disabled={isLoading}
				aria-busy={isLoading}
				className="w-full bg-black hover:bg-blue-900 text-white font-semibold py-2 h-auto rounded-full transition-colors duration-150 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? (
					<span className="flex items-center gap-2" aria-live="polite">
						<svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
								fill="none"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Đang đăng nhập...
					</span>
				) : (
					'Đăng nhập'
				)}
			</Button>

			{/* Terms and Privacy */}
			<div className="pt-4">
				<p className="text-xs text-gray-500 text-center">
					Khi đăng nhập, bạn đồng ý với{' '}
					<a href="/terms" className="text-black hover:text-blue-700 hover:underline font-semibold">
						Điều khoản dịch vụ
					</a>{' '}
					và{' '}
					<a
						href="/privacy"
						className="text-black hover:text-blue-700 hover:underline font-semibold"
					>
						Chính sách bảo mật
					</a>{' '}
					của chúng tôi.
				</p>
			</div>
		</form>
	);
}
