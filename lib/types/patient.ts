export type Gender = "male" | "female" | "other";

export interface Patient {
	id: string;
	patient_code: string;
	full_name: string;
	date_of_birth: string | null;
	gender: Gender | null;
	phone: string | null;
	address: string | null;
	created_at: string;
	created_by: string | null;
	updated_at: string | null;
	updated_by: string | null;
	is_deleted: boolean;
	deleted_at: string | null;
	deleted_by: string | null;
}

export interface PatientVisit {
	id: string;
	patient_id: string;
	assigned_doctor_id: string | null;
	symptoms: string | null;
	status: string;
	created_at: string;
	created_by: string | null;
	updated_at: string | null;
	updated_by: string | null;
	is_deleted: boolean;
	deleted_at: string | null;
	deleted_by: string | null;
}

export interface ImagingOrder {
	id: string;
	visit_id: string;
	requesting_doctor_id: string;
	modality_requested: string;
	body_part_requested: string;
	reason_for_study: string | null;
	status: string;
	created_at: string;
	created_by: string | null;
	updated_at: string | null;
	updated_by: string | null;
	is_deleted: boolean;
	deleted_at: string | null;
	deleted_by: string | null;
}

export interface PatientWithDetails extends Patient {
	visits?: PatientVisit[];
	imaging_orders?: ImagingOrder[];
}

