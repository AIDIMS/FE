'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Patient, PatientVisit } from '@/lib/types/patient';
import { CheckInFormData } from '@/components/receptionist/check-in-form';
import { StatsCards } from '@/components/receptionist/stats-cards';
import { PatientSearch } from '@/components/receptionist/patient-search';
import { WaitingQueue } from '@/components/receptionist/waiting-queue';
import { AddPatientDialog, CheckInDialog } from '@/components/receptionist/dialogs';
import { visitService } from '@/lib/api';
import { useNotification } from '@/lib/contexts';
import { NotificationType } from '@/lib/types/notification';

interface PatientSearchResult extends Patient {
	lastVisit?: string;
}

interface WaitingPatient extends PatientVisit {
	patientName: string;
	patientCode: string;
}

export default function ReceptionistDashboard() {
	const { addNotification } = useNotification();
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([]);
	const [waitingQueue, setWaitingQueue] = useState<WaitingPatient[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoadingQueue, setIsLoadingQueue] = useState(false);
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

				setWaitingQueue(waitingVisits as WaitingPatient[]);
			} else {
				addNotification(
					NotificationType.ERROR,
					'Lỗi',
					result.message || 'Không thể tải danh sách chờ khám'
				);
			}
		} catch (error) {
			console.error('Error loading waiting queue:', error);
			addNotification(NotificationType.ERROR, 'Lỗi', 'Đã xảy ra lỗi khi tải danh sách chờ khám');
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
			// Mock search - sẽ thay thế bằng API call
			await new Promise(resolve => setTimeout(resolve, 500));

			const mockResults: PatientSearchResult[] = [
				{
					id: 'p1',
					patientCode: 'BN001',
					fullName: 'Nguyễn Văn A',
					dateOfBirth: '1990-01-15',
					gender: 'male' as const,
					phoneNumber: '0901234567',
					address: '123 Đường ABC, Q1, TP.HCM',
					lastVisit: '2025-11-10',
					createdAt: new Date().toISOString(),
					createdBy: null,
					updatedAt: null,
					updatedBy: null,
					isDeleted: false,
					deletedAt: null,
					deletedBy: null,
					lastVisitDate: '2025-11-10',
				},
			].filter(
				p =>
					p.fullName.toLowerCase().includes(query.toLowerCase()) ||
					p.patientCode.toLowerCase().includes(query.toLowerCase()) ||
					p.phoneNumber?.includes(query)
			);

			setSearchResults(mockResults);
		} catch (error) {
			console.error('Error searching patients:', error);
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
		</DashboardLayout>
	);
}
