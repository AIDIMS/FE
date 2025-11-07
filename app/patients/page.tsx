"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PatientForm } from "@/components/patients/patient-form"
import { PatientTable } from "@/components/patients/patient-table"
import { PatientDetailDialog } from "@/components/patients/patient-detail-dialog"
import { Patient, PatientWithDetails } from "@/lib/types/patient"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Plus, Search, Filter, Users } from "lucide-react"

export default function PatientsPage() {
	const [patients, setPatients] = useState<Patient[]>([])
	const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
	const [searchQuery, setSearchQuery] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
	const [detailPatient, setDetailPatient] = useState<PatientWithDetails | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Mock data - sẽ thay thế bằng API call thực tế
	useEffect(() => {
		loadPatients()
	}, [])

	const loadPatients = async () => {
		setIsLoading(true)
		try {
			// Mock data - thay thế bằng API call
			await new Promise((resolve) => setTimeout(resolve, 500))
			const mockPatients: Patient[] = [
				{
					id: "1",
					patient_code: "BN001",
					full_name: "Nguyễn Văn A",
					date_of_birth: "1990-01-15",
					gender: "male",
					phone: "0901234567",
					address: "123 Đường ABC, Quận 1, TP.HCM",
					created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
				{
					id: "2",
					patient_code: "BN002",
					full_name: "Trần Thị B",
					date_of_birth: "1985-05-20",
					gender: "female",
					phone: "0987654321",
					address: "456 Đường XYZ, Quận 2, TP.HCM",
					created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
				{
					id: "3",
					patient_code: "BN003",
					full_name: "Lê Văn C",
					date_of_birth: "1978-08-10",
					gender: "male",
					phone: "0912345678",
					address: "789 Đường DEF, Quận 3, TP.HCM",
					created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
				{
					id: "4",
					patient_code: "BN004",
					full_name: "Phạm Thị D",
					date_of_birth: "1992-12-25",
					gender: "female",
					phone: "0923456789",
					address: "321 Đường GHI, Quận 4, TP.HCM",
					created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
				{
					id: "5",
					patient_code: "BN005",
					full_name: "Hoàng Văn E",
					date_of_birth: "1988-03-30",
					gender: "male",
					phone: "0934567890",
					address: "654 Đường JKL, Quận 5, TP.HCM",
					created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				},
			]
			setPatients(mockPatients)
			setFilteredPatients(mockPatients)
		} catch (error) {
			console.error("Error loading patients:", error)
		} finally {
			setIsLoading(false)
		}
	}

	// Filter patients based on search query
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredPatients(patients)
			return
		}

		const query = searchQuery.toLowerCase()
		const filtered = patients.filter(
			(patient) =>
				patient.patient_code.toLowerCase().includes(query) ||
				patient.full_name.toLowerCase().includes(query) ||
				patient.phone?.toLowerCase().includes(query) ||
				patient.address?.toLowerCase().includes(query)
		)
		setFilteredPatients(filtered)
	}, [searchQuery, patients])

	const handleAddNew = () => {
		setSelectedPatient(null)
		setIsFormOpen(true)
	}

	const handleEdit = (patient: Patient) => {
		setSelectedPatient(patient)
		setIsFormOpen(true)
	}

	const handleView = async (patient: Patient) => {
		setDetailPatient(null)
		setIsDetailOpen(true)
		
		// Load patient details with visits and imaging orders
		try {
			// Mock data - thay thế bằng API call
			const patientWithDetails: PatientWithDetails = {
				...patient,
				visits: [],
				imaging_orders: [],
			}
			setDetailPatient(patientWithDetails)
		} catch (error) {
			console.error("Error loading patient details:", error)
		}
	}

	const handleDelete = async (patient: Patient) => {
		if (!confirm(`Bạn có chắc chắn muốn xóa bệnh nhân "${patient.full_name}"?`)) {
			return
		}

		try {
			// Mock delete - thay thế bằng API call
			setPatients((prev) => prev.filter((p) => p.id !== patient.id))
			setFilteredPatients((prev) => prev.filter((p) => p.id !== patient.id))
		} catch (error) {
			console.error("Error deleting patient:", error)
			alert("Có lỗi xảy ra khi xóa bệnh nhân")
		}
	}

	const handleSubmit = async (
		data: Omit<
			Patient,
			| "id"
			| "created_at"
			| "created_by"
			| "updated_at"
			| "updated_by"
			| "is_deleted"
			| "deleted_at"
			| "deleted_by"
		>
	) => {
		setIsSubmitting(true)
		try {
			// Mock save - thay thế bằng API call
			await new Promise((resolve) => setTimeout(resolve, 1000))

			if (selectedPatient) {
				// Update existing patient
				const updated: Patient = {
					...selectedPatient,
					...data,
					updated_at: new Date().toISOString(),
				}
				setPatients((prev) =>
					prev.map((p) => (p.id === selectedPatient.id ? updated : p))
				)
				setFilteredPatients((prev) =>
					prev.map((p) => (p.id === selectedPatient.id ? updated : p))
				)
			} else {
				// Create new patient
				const newPatient: Patient = {
					...data,
					id: Date.now().toString(),
					created_at: new Date().toISOString(),
					created_by: null,
					updated_at: null,
					updated_by: null,
					is_deleted: false,
					deleted_at: null,
					deleted_by: null,
				}
				setPatients((prev) => [...prev, newPatient])
				setFilteredPatients((prev) => [...prev, newPatient])
			}

			setIsFormOpen(false)
			setSelectedPatient(null)
		} catch (error) {
			console.error("Error saving patient:", error)
			alert("Có lỗi xảy ra khi lưu bệnh nhân")
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		setIsFormOpen(false)
		setSelectedPatient(null)
	}

	return (
		<DashboardLayout>
			<div className="container mx-auto px-4 py-6 max-w-7xl">
				{/* Header Section */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Quản lý hồ sơ bệnh nhân
							</h1>
							<p className="text-sm text-gray-600">
								Quản lý thông tin và lịch sử khám bệnh của bệnh nhân
							</p>
						</div>
						<Button
							onClick={handleAddNew}
							className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all h-10 px-4"
						>
							<Plus className="h-4 w-4 mr-2" />
							Thêm bệnh nhân
						</Button>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-5">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
											Tổng bệnh nhân
										</p>
										<p className="text-3xl font-bold text-blue-900">
											{filteredPatients.length}
										</p>
										<p className="text-xs text-blue-600 mt-1">
											{patients.length} tổng số
										</p>
									</div>
									<div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
										<Users className="h-6 w-6 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-5">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
											Mới hôm nay
										</p>
										<p className="text-3xl font-bold text-green-900">0</p>
										<p className="text-xs text-green-600 mt-1">
											Bệnh nhân mới
										</p>
									</div>
									<div className="h-12 w-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-md">
										<svg
											className="h-6 w-6 text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 4v16m8-8H4"
											/>
										</svg>
									</div>
								</div>
							</CardContent>
						</Card>
						<Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-5">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
											Đang khám
										</p>
										<p className="text-3xl font-bold text-purple-900">0</p>
										<p className="text-xs text-purple-600 mt-1">
											Đang điều trị
										</p>
									</div>
									<div className="h-12 w-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-md">
										<svg
											className="h-6 w-6 text-white"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Search and Filter Bar */}
				<div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
					<div className="relative flex-1 max-w-md w-full">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Tìm kiếm theo mã BN, tên, SĐT, địa chỉ..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 bg-white border-gray-300 focus:border-blue-600 focus:ring-blue-600 h-10 shadow-sm"
						/>
					</div>
					<Button
						variant="outline"
						className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white h-10 shadow-sm"
					>
						<Filter className="h-4 w-4 mr-2" />
						Bộ lọc
					</Button>
				</div>

				{/* Patients Table */}
				<Card className="bg-white border-gray-200 shadow-md overflow-hidden">
					<CardHeader className="border-b border-gray-200 bg-white">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-lg font-semibold text-gray-900">
									Danh sách bệnh nhân
								</CardTitle>
								<CardDescription className="mt-1">
									{filteredPatients.length} bệnh nhân
									{searchQuery && ` (${filteredPatients.length} kết quả tìm thấy)`}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<PatientTable
							patients={filteredPatients}
							onView={handleView}
							onEdit={handleEdit}
							onDelete={handleDelete}
							isLoading={isLoading}
						/>
					</CardContent>
				</Card>

				{/* Add/Edit Dialog */}
				<Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
					<DialogContent className="!max-w-[85vw] !w-full !max-h-[90vh] overflow-y-auto border-gray-200 sm:!max-w-[85vw] md:!max-w-[75vw] lg:!max-w-[65vw] xl:!max-w-[60vw] 2xl:!max-w-[55vw]">
						<DialogHeader className="pb-4 border-b border-gray-200">
							<DialogTitle className="text-xl font-semibold text-gray-900">
								{selectedPatient ? "Sửa thông tin bệnh nhân" : "Thêm bệnh nhân mới"}
							</DialogTitle>
							<DialogDescription className="text-sm text-gray-600 mt-1">
								{selectedPatient
									? "Cập nhật thông tin bệnh nhân trong hệ thống"
									: "Điền đầy đủ thông tin để thêm bệnh nhân mới vào hệ thống"}
							</DialogDescription>
						</DialogHeader>
						<div className="pt-6">
							<PatientForm
								patient={selectedPatient}
								onSubmit={handleSubmit}
								onCancel={handleCancel}
								isLoading={isSubmitting}
							/>
						</div>
					</DialogContent>
				</Dialog>

				{/* Detail Dialog */}
				<PatientDetailDialog
					patient={detailPatient}
					open={isDetailOpen}
					onOpenChange={setIsDetailOpen}
				/>
			</div>
		</DashboardLayout>
	)
}

