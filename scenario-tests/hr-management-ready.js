// HR Management & Employee Processing
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with employees JSON structure

const data = $input.first().json;
const employees = data.employees;

// 1. Process employee data with validation
const processedEmployees = employees.map((employee) => {
	// Validate email and calculate metrics
	const emailValid = validator.isEmail(employee.email);
	const hireDate = dayjs(employee.hireDate);
	const daysEmployed = dayjs().diff(hireDate, 'day');
	const yearsEmployed = Math.floor(daysEmployed / 365);

	// Generate employee ID and hash
	const employeeId = 'EMP-' + uuid.v4();
	const employeeHash = CryptoJS.SHA256(employee.email + employee.name)
		.toString()
		.substring(0, 10);

	// Calculate salary metrics
	const annualSalary = employee.salary;
	const monthlySalary = annualSalary / 12;
	const dailySalary = annualSalary / 365;

	// Determine employment status
	let status = 'Active';
	if (employee.terminationDate) {
		status = 'Terminated';
	} else if (daysEmployed < 90) {
		status = 'Probation';
	} else if (yearsEmployed >= 5) {
		status = 'Senior';
	}

	return {
		...employee,
		employeeId,
		employeeHash,
		emailValid,
		employment: {
			hireDate: hireDate.format('YYYY-MM-DD'),
			daysEmployed,
			yearsEmployed,
			status,
			isLongTerm: yearsEmployed >= 2,
		},
		compensation: {
			annual: annualSalary,
			monthly: Math.round(monthlySalary),
			daily: Math.round(dailySalary),
			annualFormatted: '$' + annualSalary.toLocaleString(),
			monthlyFormatted: '$' + Math.round(monthlySalary).toLocaleString(),
		},
		contact: {
			email: employee.email,
			emailValid,
			phone: employee.phone || 'Not provided',
		},
	};
});

// 2. HR Analytics with lodash
const hrAnalytics = {
	totalEmployees: processedEmployees.length,
	activeEmployees: processedEmployees.filter((e) => e.employment.status === 'Active').length,
	probationEmployees: processedEmployees.filter((e) => e.employment.status === 'Probation').length,
	seniorEmployees: processedEmployees.filter((e) => e.employment.status === 'Senior').length,
	avgYearsEmployed: _.meanBy(processedEmployees, 'employment.yearsEmployed'),
	avgSalary: _.meanBy(processedEmployees, 'compensation.annual'),
	totalPayroll: _.sumBy(processedEmployees, 'compensation.annual'),
	departmentBreakdown: _.countBy(processedEmployees, 'department'),
	statusBreakdown: _.countBy(processedEmployees, 'employment.status'),
	validEmails: processedEmployees.filter((e) => e.emailValid).length,
	longTermEmployees: processedEmployees.filter((e) => e.employment.isLongTerm).length,
};

// 3. Generate employee badges with QR codes
const employeesWithBadges = await Promise.all(
	processedEmployees.map(async (employee) => {
		const badgeData = JSON.stringify({
			employeeId: employee.employeeId,
			name: employee.name,
			department: employee.department,
			hireDate: employee.employment.hireDate,
		});

		const badgeQR = await QRCode.toDataURL(badgeData, {
			width: 120,
			margin: 1,
		});

		return { ...employee, badgeQR };
	}),
);

// 4. Create comprehensive HR Excel report
const hrWorkbook = XLSX.utils.book_new();

// Employee roster sheet
const employeeSheet = XLSX.utils.json_to_sheet(
	employeesWithBadges.map((e) => ({
		'Employee ID': e.employeeId,
		Name: e.name,
		Department: e.department,
		Position: e.position,
		'Email Valid': e.emailValid ? 'Yes' : 'No',
		'Hire Date': e.employment.hireDate,
		'Years Employed': e.employment.yearsEmployed,
		Status: e.employment.status,
		'Annual Salary': e.compensation.annualFormatted,
		'Monthly Salary': e.compensation.monthlyFormatted,
	})),
);
XLSX.utils.book_append_sheet(hrWorkbook, employeeSheet, 'Employees');

// Analytics summary sheet
const summaryData = [
	{ Metric: 'Total Employees', Value: hrAnalytics.totalEmployees },
	{ Metric: 'Active Employees', Value: hrAnalytics.activeEmployees },
	{ Metric: 'Average Years Employed', Value: Math.round(hrAnalytics.avgYearsEmployed) },
	{ Metric: 'Average Salary', Value: '$' + Math.round(hrAnalytics.avgSalary).toLocaleString() },
	{ Metric: 'Total Payroll', Value: '$' + hrAnalytics.totalPayroll.toLocaleString() },
	{
		Metric: 'Email Validation Rate',
		Value: Math.round((hrAnalytics.validEmails / hrAnalytics.totalEmployees) * 100) + '%',
	},
];
const summarySheet = XLSX.utils.json_to_sheet(summaryData);
XLSX.utils.book_append_sheet(hrWorkbook, summarySheet, 'HR Summary');

const hrBuffer = XLSX.write(hrWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '👥 HR Management Complete!',
		totalEmployees: hrAnalytics.totalEmployees,
		activeEmployees: hrAnalytics.activeEmployees,
		avgYearsEmployed: Math.round(hrAnalytics.avgYearsEmployed),
		totalPayroll: '$' + hrAnalytics.totalPayroll.toLocaleString(),
	},
	employees: employeesWithBadges,
	analytics: hrAnalytics,
	insights: {
		retentionRate:
			Math.round((hrAnalytics.longTermEmployees / hrAnalytics.totalEmployees) * 100) + '%',
		departmentSizes: hrAnalytics.departmentBreakdown,
		statusDistribution: hrAnalytics.statusBreakdown,
	},
	reports: {
		excel: hrBuffer.toString('base64'),
		size: Math.round(hrBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
