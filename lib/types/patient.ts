export type Gender = 'male' | 'female' | 'other';

export interface Patient {
	id: string;
	patientCode: string;
	fullName: string;
	dateOfBirth: string | null;
	gender: string | null;
	phoneNumber: string | null;
	address: string | null;
	createdAt: string;
	createdBy: string | null;
	updatedAt: string | null;
	updatedBy: string | null;
	isDeleted: boolean;
	deletedAt: string | null;
	deletedBy: string | null;
	lastVisitDate: string | null;
}

export interface CreatePatientDto {
	fullName: string;
	dateOfBirth?: string | null;
	gender: Gender | null;
	phoneNumber: string | null;
	address?: string | null;
}

export interface UpdatePatientDto {
	fullName: string;
	dateOfBirth?: string | null;
	gender: Gender | null;
	phoneNumber: string | null;
	address?: string | null;
}

export interface PatientVisit {
	id: string;
	patientId: string;
	patientCode: string;
	patientName: string;
	assignedDoctorId: string | null;
	assignedDoctorName: string | null;
	symptoms: string | null;
	status: string;
	createdAt: string;
	createdBy: string | null;
	updatedAt: string | null;
	updatedBy: string | null;
	isDeleted: boolean;
	deletedAt: string | null;
	deletedBy: string | null;
}

export interface ImagingOrder {
	id: string;
	visitId: string;
	patientId: string;
	patientName: string;
	requestingDoctorId: string;
	requestingDoctorName: string;
	modalityRequested: string;
	bodyPartRequested: string;
	reasonForStudy: string | null;
	status: string;
	studyId?: string; // Optional: populated when study is created
	createdAt: string;
	createdBy: string | null;
	updatedAt: string | null;
	updatedBy: string | null;
	isDeleted: boolean;
	deletedAt: string | null;
	deletedBy: string | null;
}

export interface PatientWithDetails extends Patient {
	visits: PatientVisit[];
	imagingOrders: ImagingOrder[];
}

// Interface cho Technician Order Detail Page (có thêm thông tin patient và các field UI)
export interface TechnicianImagingOrder {
	id: string;
	visit_id: string;
	patient_id?: string; // ID của bệnh nhân
	patient_name: string;
	patient_code: string;
	patient_gender: 'male' | 'female' | 'other';
	patient_age: number;
	patient_dob: string;
	modality_requested: string;
	body_part_requested: string;
	reason_for_study: string | null;
	requesting_doctor: string;
	status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
	priority: 'normal' | 'urgent' | 'stat';
	created_at: string;
	scheduled_time?: string;
	notes?: string;
}
