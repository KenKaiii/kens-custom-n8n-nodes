// Project Management & Task Tracking
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with projects JSON structure

const data = $input.first().json;
const projects = data.projects;

// 1. Process projects with task analysis
const processedProjects = projects.map((project) => {
	const projectId = 'PROJ-' + uuid.v4();
	const startDate = dayjs(project.startDate);
	const endDate = dayjs(project.endDate);
	const currentDate = dayjs();
	
	// Calculate project metrics
	const totalDays = endDate.diff(startDate, 'day');
	const daysElapsed = currentDate.diff(startDate, 'day');
	const daysRemaining = endDate.diff(currentDate, 'day');
	const progressPercent = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
	
	// Process tasks
	const processedTasks = project.tasks.map(task => {
		const taskId = 'TASK-' + uuid.v4();
		const taskDueDate = dayjs(task.dueDate);
		const isOverdue = taskDueDate.isBefore(currentDate) && task.status !== 'completed';
		const daysUntilDue = taskDueDate.diff(currentDate, 'day');
		
		return {
			...task,
			taskId,
			dueDate: taskDueDate.format('YYYY-MM-DD'),
			isOverdue,
			daysUntilDue,
			priority: task.priority || 'medium',
			assigneeValid: validator.isEmail(task.assigneeEmail)
		};
	});
	
	// Calculate task statistics
	const taskStats = {
		total: processedTasks.length,
		completed: processedTasks.filter(t => t.status === 'completed').length,
		inProgress: processedTasks.filter(t => t.status === 'in_progress').length,
		pending: processedTasks.filter(t => t.status === 'pending').length,
		overdue: processedTasks.filter(t => t.isOverdue).length,
		highPriority: processedTasks.filter(t => t.priority === 'high').length
	};
	
	taskStats.completionRate = Math.round((taskStats.completed / taskStats.total) * 100);
	
	// Generate project hash
	const projectHash = CryptoJS.SHA256(project.name + project.description).toString().substring(0, 12);
	
	return {
		...project,
		projectId,
		projectHash,
		timeline: {
			startDate: startDate.format('YYYY-MM-DD'),
			endDate: endDate.format('YYYY-MM-DD'),
			totalDays,
			daysElapsed,
			daysRemaining,
			progressPercent: Math.round(progressPercent),
			status: daysRemaining < 0 ? 'Overdue' : daysRemaining === 0 ? 'Due Today' : 'On Track'
		},
		tasks: processedTasks,
		taskStats,
		budget: {
			allocated: project.budget,
			allocatedFormatted: '$' + project.budget.toLocaleString(),
			perDay: Math.round(project.budget / totalDays),
			remaining: Math.round(project.budget * (daysRemaining / totalDays))
		}
	};
});

// 2. Project analytics with lodash
const projectAnalytics = {
	totalProjects: processedProjects.length,
	activeProjects: processedProjects.filter(p => p.timeline.status === 'On Track').length,
	overdueProjects: processedProjects.filter(p => p.timeline.status === 'Overdue').length,
	avgCompletionRate: _.meanBy(processedProjects, 'taskStats.completionRate'),
	totalBudget: _.sumBy(processedProjects, 'budget.allocated'),
	totalTasks: _.sumBy(processedProjects, 'taskStats.total'),
	completedTasks: _.sumBy(processedProjects, 'taskStats.completed'),
	overdueTasks: _.sumBy(processedProjects, 'taskStats.overdue'),
	avgProjectDuration: _.meanBy(processedProjects, 'timeline.totalDays')
};

// 3. Generate project QR codes
const projectsWithQR = await Promise.all(
	processedProjects.map(async (project) => {
		const qrData = JSON.stringify({
			projectId: project.projectId,
			name: project.name,
			progress: project.timeline.progressPercent + '%',
			status: project.timeline.status
		});
		
		const qrCode = await QRCode.toDataURL(qrData, { width: 150 });
		return { ...project, projectQR: qrCode };
	})
);

// 4. Create comprehensive project Excel report
const projectWorkbook = XLSX.utils.book_new();

// Projects overview
const projectsSheet = XLSX.utils.json_to_sheet(
	projectsWithQR.map((p) => ({
		'Project ID': p.projectId,
		'Project Name': p.name,
		'Manager': p.manager,
		'Start Date': p.timeline.startDate,
		'End Date': p.timeline.endDate,
		'Days Remaining': p.timeline.daysRemaining,
		'Progress': p.timeline.progressPercent + '%',
		'Status': p.timeline.status,
		'Total Tasks': p.taskStats.total,
		'Completed Tasks': p.taskStats.completed,
		'Completion Rate': p.taskStats.completionRate + '%',
		'Budget': p.budget.allocatedFormatted,
		'Overdue Tasks': p.taskStats.overdue
	}))
);
XLSX.utils.book_append_sheet(projectWorkbook, projectsSheet, 'Projects');

// All tasks across projects
const allTasks = _.flatten(projectsWithQR.map(p => 
	p.tasks.map(t => ({ ...t, projectName: p.name, projectId: p.projectId }))
));

const tasksSheet = XLSX.utils.json_to_sheet(
	allTasks.map((t) => ({
		'Task ID': t.taskId,
		'Project': t.projectName,
		'Task Name': t.name,
		'Assignee': t.assignee,
		'Due Date': t.dueDate,
		'Status': t.status,
		'Priority': t.priority,
		'Overdue': t.isOverdue ? 'Yes' : 'No',
		'Days Until Due': t.daysUntilDue
	}))
);
XLSX.utils.book_append_sheet(projectWorkbook, tasksSheet, 'Tasks');

const projectBuffer = XLSX.write(projectWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '📋 Project Management Complete!',
		totalProjects: projectAnalytics.totalProjects,
		activeProjects: projectAnalytics.activeProjects,
		avgCompletionRate: Math.round(projectAnalytics.avgCompletionRate) + '%',
		totalBudget: '$' + projectAnalytics.totalBudget.toLocaleString()
	},
	projects: projectsWithQR,
	analytics: projectAnalytics,
	alerts: {
		overdueProjects: projectsWithQR.filter(p => p.timeline.status === 'Overdue').map(p => p.name),
		overdueTasks: allTasks.filter(t => t.isOverdue).map(t => ({ project: t.projectName, task: t.name })),
		highPriorityTasks: allTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
	},
	reports: {
		excel: projectBuffer.toString('base64'),
		size: Math.round(projectBuffer.length / 1024) + ' KB'
	},
	librariesUsed: ['dayjs', 'CryptoJS', 'uuid', 'validator', 'lodash', 'QRCode', 'XLSX'],
	managedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
};