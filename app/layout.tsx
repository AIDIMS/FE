import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, NotificationProvider } from '@/lib/contexts';
import { Toaster } from 'sonner';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: 'DicomPro - Hệ thống quản lý hình ảnh DICOM',
	description: 'Hệ thống quản lý hình ảnh y tế DICOM và hồ sơ bệnh nhân',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} font-sans antialiased`}>
				<AuthProvider>
					<NotificationProvider>
						{children}
						<Toaster position="top-right" richColors closeButton />
					</NotificationProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
