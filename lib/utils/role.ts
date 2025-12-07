import { Department, UserRole } from '../types';

const getRoleName = (role: UserRole): string => {
	const roleNames = {
		[UserRole.Admin]: 'Quản trị viên',
		[UserRole.Doctor]: 'Bác sĩ',
		[UserRole.Receptionist]: 'Lễ tân',
		[UserRole.Technician]: 'Kỹ thuật viên',
	};
	return roleNames[role] || 'Không xác định';
};

const getDepartmentName = (dept: Department): string => {
	const deptNames = {
		[Department.Administration]: 'Hành chính',
		[Department.Pulmonology]: 'Phổi',
		[Department.Radiology]: 'X-quang/CT',
		[Department.LungFunction]: 'Chức năng hô hấp',
	};
	return deptNames[dept] || 'Không xác định';
};

export { getRoleName, getDepartmentName };
