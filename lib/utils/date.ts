export function formatDate(dateString: string | null): string {
	if (!dateString) return "N/A"
	try {
		const date = new Date(dateString)
		if (isNaN(date.getTime())) return dateString
		
		const day = String(date.getDate()).padStart(2, "0")
		const month = String(date.getMonth() + 1).padStart(2, "0")
		const year = date.getFullYear()
		
		return `${day}/${month}/${year}`
	} catch {
		return dateString
	}
}

export function formatGender(gender: string | null): string {
	if (!gender) return "N/A"
	const genderMap: Record<string, string> = {
		male: "Nam",
		female: "Nữ",
		other: "Khác",
	}
	return genderMap[gender] || gender
}

