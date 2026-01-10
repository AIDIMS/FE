export interface DashboardStatistics {
	totalPatients: number;
	totalPatientsChange: number;
	visitsToday: number;
	visitsTodayChange: number;
	imagingOrdersPending: number;
	imagingOrdersTotal: number;
	averageWaitTimeMinutes: number;
	averageWaitTimeChange: number;
}

export interface DepartmentStat {
	departmentName: string;
	staffCount: number;
	percentage: number;
}

export interface DepartmentStatistics {
	departments: DepartmentStat[];
	totalStaff: number;
	totalActiveStaff: number;
}

export interface DailyActivity {
	date: string;
	dayOfWeek: string;
	dayOfWeekVi: string;
	visitCount: number;
	imagingOrderCount: number;
}

export interface WeeklyActivity {
	activities: DailyActivity[];
	weekStartDate: string;
	weekEndDate: string;
}

export interface DashboardData {
	statistics: DashboardStatistics;
	departmentStatistics: DepartmentStatistics;
	weeklyActivity: WeeklyActivity;
}
