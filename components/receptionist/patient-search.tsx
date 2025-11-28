import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Phone, UserCheck } from 'lucide-react';
import { Patient } from '@/lib/types/patient';
import { formatDate } from '@/lib/utils/date';

interface PatientSearchResult extends Patient {
	lastVisit?: string;
}

interface PatientSearchProps {
	searchQuery: string;
	searchResults: PatientSearchResult[];
	isSearching: boolean;
	onSearchChange: (query: string) => void;
	onCheckIn: (patient: Patient) => void;
	onAddPatient: () => void;
}

export function PatientSearch({
	searchQuery,
	searchResults,
	isSearching,
	onSearchChange,
	onCheckIn,
	onAddPatient,
}: PatientSearchProps) {
	return (
		<Card className="mb-8 border border-slate-200 bg-white shadow-sm">
			<CardHeader className="border-b border-slate-200 pb-4">
				<div className="flex items-center gap-3">
					<Search className="h-5 w-5 text-slate-600" />
					<div>
						<CardTitle className="text-lg font-semibold text-slate-900">
							Tìm kiếm bệnh nhân
						</CardTitle>
						<p className="text-sm text-slate-500 mt-1">Nhập tên, mã bệnh nhân hoặc số điện thoại</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-6">
				<div className="relative max-w-3xl mx-auto">
					<div className="relative">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
						<Input
							type="text"
							placeholder="Tìm kiếm bệnh nhân..."
							value={searchQuery}
							onChange={e => onSearchChange(e.target.value)}
							className="pl-12 pr-4 py-6 text-base border-2 border-slate-300 focus:border-blue-600 rounded-xl bg-white"
							autoFocus
						/>
					</div>

					{/* Search Results Dropdown */}
					{searchResults.length > 0 && (
						<div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
							{searchResults.map(patient => (
								<div
									key={patient.id}
									onClick={() => onCheckIn(patient)}
									className="group p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<p className="font-semibold text-slate-900 text-base">
													{patient.full_name}
												</p>
												<span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-mono font-semibold">
													{patient.patient_code}
												</span>
											</div>
											<div className="flex items-center gap-4 text-sm text-slate-600">
												<span className="flex items-center gap-1.5">
													<Phone className="h-3.5 w-3.5" />
													{patient.phone}
												</span>
												{patient.lastVisit && (
													<span className="text-xs text-slate-500">
														Khám lần cuối: {formatDate(patient.lastVisit)}
													</span>
												)}
											</div>
										</div>
										<Button size="default" className="bg-blue-600 hover:bg-blue-700 text-white">
											<UserCheck className="h-4 w-4 mr-2" />
											Đăng ký khám
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{/* No Results */}
					{searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
						<div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-8 text-center">
							<Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
							<p className="text-slate-600 font-medium mb-4">Không tìm thấy bệnh nhân</p>
							<Button onClick={onAddPatient} className="bg-blue-600 hover:bg-blue-700 text-white">
								<Plus className="h-4 w-4 mr-2" />
								Thêm bệnh nhân mới
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
