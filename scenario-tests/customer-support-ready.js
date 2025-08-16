// Customer Support Ticket Management
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with tickets JSON structure

const data = $input.first().json;
const tickets = data.tickets;

// 1. Process support tickets
const processedTickets = tickets.map((ticket) => {
	const ticketId = 'TICKET-' + uuid.v4();
	const createdDate = dayjs(ticket.createdAt);
	const emailValid = validator.isEmail(ticket.customerEmail);

	// Calculate ticket metrics
	const hoursOpen = dayjs().diff(createdDate, 'hour');
	const daysOpen = dayjs().diff(createdDate, 'day');

	// Determine urgency based on priority and time
	let urgency = 'Low';
	if (ticket.priority === 'critical' && hoursOpen > 4) urgency = 'Overdue';
	else if (ticket.priority === 'high' && hoursOpen > 24) urgency = 'Overdue';
	else if (ticket.priority === 'critical') urgency = 'Critical';
	else if (ticket.priority === 'high') urgency = 'High';
	else if (hoursOpen > 72) urgency = 'Aging';

	// Generate ticket hash
	const ticketHash = CryptoJS.SHA256(ticket.subject + ticket.customerEmail)
		.toString()
		.substring(0, 8);

	// Analyze ticket content
	const descriptionLength = ticket.description.length;
	const isDetailedDescription = descriptionLength > 100;

	return {
		...ticket,
		ticketId,
		ticketHash,
		emailValid,
		timing: {
			created: createdDate.format('YYYY-MM-DD HH:mm:ss'),
			hoursOpen,
			daysOpen,
			urgency,
			isStale: daysOpen > 7,
		},
		analysis: {
			descriptionLength,
			isDetailedDescription,
			hasAttachments: ticket.attachments && ticket.attachments.length > 0,
			estimatedResolution:
				ticket.priority === 'critical'
					? '4 hours'
					: ticket.priority === 'high'
						? '24 hours'
						: '72 hours',
		},
	};
});

// 2. Support analytics
const supportAnalytics = {
	totalTickets: processedTickets.length,
	openTickets: processedTickets.filter((t) => t.status === 'open').length,
	closedTickets: processedTickets.filter((t) => t.status === 'closed').length,
	urgentTickets: processedTickets.filter(
		(t) => t.timing.urgency === 'Critical' || t.timing.urgency === 'Overdue',
	).length,
	avgHoursOpen: _.meanBy(
		processedTickets.filter((t) => t.status === 'open'),
		'timing.hoursOpen',
	),
	priorityBreakdown: _.countBy(processedTickets, 'priority'),
	categoryBreakdown: _.countBy(processedTickets, 'category'),
	statusBreakdown: _.countBy(processedTickets, 'status'),
	validEmails: processedTickets.filter((t) => t.emailValid).length,
	staleTickets: processedTickets.filter((t) => t.timing.isStale).length,
};

// 3. Create Excel support report
const supportWorkbook = XLSX.utils.book_new();

const ticketsSheet = XLSX.utils.json_to_sheet(
	processedTickets.map((t) => ({
		'Ticket ID': t.ticketId,
		Subject: t.subject,
		Customer: t.customerName,
		'Email Valid': t.emailValid ? 'Yes' : 'No',
		Priority: t.priority,
		Category: t.category,
		Status: t.status,
		'Hours Open': t.timing.hoursOpen,
		Urgency: t.timing.urgency,
		'Assigned To': t.assignedTo || 'Unassigned',
		Created: t.timing.created,
	})),
);
XLSX.utils.book_append_sheet(supportWorkbook, ticketsSheet, 'Tickets');

const supportBuffer = XLSX.write(supportWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '🎫 Customer Support Complete!',
		totalTickets: supportAnalytics.totalTickets,
		openTickets: supportAnalytics.openTickets,
		urgentTickets: supportAnalytics.urgentTickets,
		avgResponseTime: Math.round(supportAnalytics.avgHoursOpen) + ' hours',
	},
	tickets: processedTickets,
	analytics: supportAnalytics,
	alerts: {
		overdueTickets: processedTickets
			.filter((t) => t.timing.urgency === 'Overdue')
			.map((t) => t.ticketId),
		criticalTickets: processedTickets
			.filter((t) => t.priority === 'critical' && t.status === 'open')
			.map((t) => t.ticketId),
		staleTickets: processedTickets.filter((t) => t.timing.isStale).map((t) => t.ticketId),
	},
	reports: {
		excel: supportBuffer.toString('base64'),
		size: Math.round(supportBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'XLSX'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
