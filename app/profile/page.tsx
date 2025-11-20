import { Metadata } from 'next';
import { ProfileView } from '@/components/profile/profile-view';

export const metadata: Metadata = {
	title: 'Hồ Sơ Cá Nhân - AIDIMS',
	description: 'Xem và chỉnh sửa thông tin hồ sơ cá nhân',
};

export default function ProfilePage() {
	return <ProfileView />;
}
