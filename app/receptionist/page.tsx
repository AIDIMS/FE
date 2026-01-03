'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RoleGuard } from '@/components/auth/role-guard';
import { Patient, PatientVisit } from '@/lib/types/patient';
import { CheckInFormData } from '@/components/receptionist/check-in-form';
import { StatsCards } from '@/components/receptionist/stats-cards';
import { PatientSearch } from '@/components/receptionist/patient-search';
import { WaitingQueue } from '@/components/receptionist/waiting-queue';
import { AddPatientDialog, CheckInDialog } from '@/components/receptionist/dialogs';
import { visitService, patientService } from '@/lib/api';
import { toast } from '@/lib/utils/toast';
import { UserRole } from '@/lib/types';

interface PatientSearchResult extends Patient {
	lastVisit?: string;
}

interface WaitingPatient extends PatientVisit {
	patientName: string;
	patientCode: string;
}

export default function ReceptionistDashboard() {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
	const [waitingQueue, setWaitingQueue] = useState<WaitingPatient[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [, setIsLoadingQueue] = useState(false);
	const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
	const [isCheckInOpen, setIsCheckInOpen] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

	useEffect(() => {
		loadWaitingQueue();
	}, []);

	const loadWaitingQueue = async () => {
		try {
			setIsLoadingQueue(true);
			const result = await visitService.getAll(1, 100);

			if (result.isSuccess && result.data) {
				const waitingVisits = result.data.items.filter(visit => visit.status === 'Waiting');

				setWaitingQueue(waitingVisits);
			} else {
				toast.error('Lỗi', result.message || 'Không thể tải danh sách chờ khám');
			}
		} catch (error) {
			console.error('Error loading waiting queue:', error);
			toast.error('Lỗi', 'Đã xảy ra lỗi khi tải danh sách chờ khám');
		} finally {
			setIsLoadingQueue(false);
		}
	};

	const handleSearch = async (query: string) => {
		setSearchQuery(query);

		if (query.length < 2) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			// Try to detect if query is a phone number (contains only digits)
			const isPhoneNumber = /^\d+$/.test(query);

			const result = await patientService.getAll(
				1,
				50, // Get more results for search
				isPhoneNumber ? undefined : query, // fullName
				isPhoneNumber ? query : undefined // phoneNumber
			);

			if (result.isSuccess && result.data) {
				// Map the data to include lastVisit field if needed
				const searchResults: PatientSearchResult[] = result.data.items.map(patient => ({
					...patient,
					lastVisit: patient.lastVisitDate || undefined,
				}));
				setSearchResults(searchResults);
			} else {
				toast.error('Lỗi', result.message || 'Không thể tìm kiếm bệnh nhân');
				setSearchResults([]);
			}
		} catch (error) {
			console.error('Error searching patients:', error);
			toast.error('Lỗi', 'Đã xảy ra lỗi khi tìm kiếm bệnh nhân');
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	const handleCheckIn = (patient: Patient) => {
		setSelectedPatient(patient);
		setIsCheckInOpen(true);
		setSearchResults([]);
		setSearchQuery('');
	};

	return (
		<DashboardLayout>
			<RoleGuard allowedRoles={[UserRole.Admin, UserRole.Receptionist]}>
				<div className="w-full min-h-screen bg-slate-50">
					<div className="px-6 py-8">
						<StatsCards waitingCount={waitingQueue.length} />

						<PatientSearch
							searchQuery={searchQuery}
							searchResults={searchResults}
							isSearching={isSearching}
							onSearchChange={handleSearch}
							onCheckIn={handleCheckIn}
							onAddPatient={() => setIsAddPatientOpen(true)}
						/>

						<WaitingQueue
							waitingQueue={waitingQueue}
							onAddPatient={() => setIsAddPatientOpen(true)}
						/>

						<AddPatientDialog
							open={isAddPatientOpen}
							onOpenChange={setIsAddPatientOpen}
							onSuccess={() => {
								loadWaitingQueue();
							}}
						/>

						<CheckInDialog
							open={isCheckInOpen}
							onOpenChange={setIsCheckInOpen}
							patient={selectedPatient}
							onSubmit={async (data: CheckInFormData) => {
								console.log('Check-in:', data);
								setIsCheckInOpen(false);
								setSelectedPatient(null);
								await loadWaitingQueue();
							}}
							onCancel={() => {
								setIsCheckInOpen(false);
								setSelectedPatient(null);
							}}
						/>
					</div>
				</div>
			</RoleGuard>
		</DashboardLayout>
	);
}
