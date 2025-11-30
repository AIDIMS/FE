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
