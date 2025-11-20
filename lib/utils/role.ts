import { Department, UserRole } from '../types';

const getRoleName = (role: UserRole): string => {
	const roleNames = {
		[UserRole.Admin]: 'Quản trị viên',
		[UserRole.Doctor]: 'Bác sĩ',
		[UserRole.Radiologist]: 'Chuyên viên X-quang',
		[UserRole.Technician]: 'Kỹ thuật viên',
	};
	return roleNames[role] || 'Không xác định';
};

const getDepartmentName = (dept: Department): string => {
	const deptNames = {
		[Department.Radiology]: 'X-quang',
		[Department.Cardiology]: 'Tim mạch',
		[Department.Neurology]: 'Thần kinh',
		[Department.Oncology]: 'Ung bướu',
		[Department.Pediatrics]: 'Nhi khoa',
		[Department.Emergency]: 'Cấp cứu',
		[Department.Orthopedics]: 'Chấn thương chỉnh hình',
		[Department.GeneralMedicine]: 'Nội tổng quát',
		[Department.PACS]: 'Quản lý hình ảnh y tế (PACS)',
	};
	return deptNames[dept] || 'Không xác định';
};

export { getRoleName, getDepartmentName };
