// Sales Pipeline & Lead Management
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with leads JSON structure

const data = $input.first().json;
const leads = data.leads;

// 1. Process leads with validation and scoring
const processedLeads = leads.map((lead) => {
	const leadId = 'LEAD-' + uuid.v4();
	const emailValid = validator.isEmail(lead.email);
	const createdDate = dayjs(lead.createdAt);
	const daysInPipeline = dayjs().diff(createdDate, 'day');
	
	// Calculate lead score based on multiple factors
	let leadScore = 0;
	if (lead.companySize === 'enterprise') leadScore += 30;
	else if (lead.companySize === 'medium') leadScore += 20;
	else leadScore += 10;
	
	if (lead.budget >= 50000) leadScore += 25;
	else if (lead.budget >= 10000) leadScore += 15;
	else leadScore += 5;
	
	if (lead.timeframe === 'immediate') leadScore += 20;
	else if (lead.timeframe === '1-3_months') leadScore += 15;
	else leadScore += 5;
	
	if (emailValid) leadScore += 10;
	if (lead.phone) leadScore += 5;
	
	// Determine lead quality
	const quality = leadScore >= 70 ? 'Hot' : leadScore >= 50 ? 'Warm' : 'Cold';
	
	// Generate lead hash for privacy
	const leadHash = CryptoJS.SHA256(lead.email + lead.company).toString().substring(0, 10);
	
	return {
		...lead,
		leadId,
		leadHash,
		emailValid,
		createdDate: createdDate.format('YYYY-MM-DD'),
		daysInPipeline,
		scoring: {
			score: leadScore,
			quality,
			factors: {
				companySize: lead.companySize,
				budget: lead.budget,
				timeframe: lead.timeframe,
				contactInfo: emailValid && lead.phone ? 'Complete' : 'Incomplete'
			}
		},
		pipeline: {
			stage: lead.stage,
			daysInStage: daysInPipeline,
			nextAction: lead.stage === 'new' ? 'Initial Contact' : 
						lead.stage === 'contacted' ? 'Follow Up' : 
						lead.stage === 'qualified' ? 'Proposal' : 'Close Deal'
		}
	};
});

// 2. Sales pipeline analytics
const pipelineAnalytics = {
	totalLeads: processedLeads.length,
	leadsByStage: _.countBy(processedLeads, 'stage'),
	leadsByQuality: _.countBy(processedLeads, 'scoring.quality'),
	avgLeadScore: _.meanBy(processedLeads, 'scoring.score'),
	avgDaysInPipeline: _.meanBy(processedLeads, 'daysInPipeline'),
	totalPipelineValue: _.sumBy(processedLeads, 'budget'),
	hotLeads: processedLeads.filter(l => l.scoring.quality === 'Hot'),
	validEmails: processedLeads.filter(l => l.emailValid).length,
	completedDeals: processedLeads.filter(l => l.stage === 'closed_won').length,
	lostDeals: processedLeads.filter(l => l.stage === 'closed_lost').length
};

// Calculate conversion rates
pipelineAnalytics.conversionRate = pipelineAnalytics.totalLeads > 0 ? 
	Math.round((pipelineAnalytics.completedDeals / pipelineAnalytics.totalLeads) * 100) : 0;

// 3. Generate lead QR codes for quick access
const leadsWithQR = await Promise.all(
	processedLeads.map(async (lead) => {
		const leadData = JSON.stringify({
			leadId: lead.leadId,
			company: lead.company,
			quality: lead.scoring.quality,
			stage: lead.stage
		});
		
		const qrCode = await QRCode.toDataURL(leadData, { width: 150 });
		return { ...lead, leadQR: qrCode };
	})
);

// 4. Create sales Excel report
const salesWorkbook = XLSX.utils.book_new();

// Leads sheet
const leadsSheet = XLSX.utils.json_to_sheet(
	leadsWithQR.map((l) => ({
		'Lead ID': l.leadId,
		'Company': l.company,
		'Contact': l.contactName,
		'Email Valid': l.emailValid ? 'Yes' : 'No',
		'Lead Score': l.scoring.score,
		'Quality': l.scoring.quality,
		'Stage': l.stage,
		'Budget': '$' + l.budget.toLocaleString(),
		'Days in Pipeline': l.daysInPipeline,
		'Next Action': l.pipeline.nextAction,
		'Source': l.source
	}))
);
XLSX.utils.book_append_sheet(salesWorkbook, leadsSheet, 'Leads');

// Pipeline summary
const pipelineData = [
	{ Metric: 'Total Leads', Value: pipelineAnalytics.totalLeads },
	{ Metric: 'Hot Leads', Value: pipelineAnalytics.hotLeads.length },
	{ Metric: 'Average Lead Score', Value: Math.round(pipelineAnalytics.avgLeadScore) },
	{ Metric: 'Conversion Rate', Value: pipelineAnalytics.conversionRate + '%' },
	{ Metric: 'Pipeline Value', Value: '$' + pipelineAnalytics.totalPipelineValue.toLocaleString() },
	{ Metric: 'Average Days in Pipeline', Value: Math.round(pipelineAnalytics.avgDaysInPipeline) }
];
const pipelineSheet = XLSX.utils.json_to_sheet(pipelineData);
XLSX.utils.book_append_sheet(salesWorkbook, pipelineSheet, 'Pipeline Summary');

const salesBuffer = XLSX.write(salesWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '💼 Sales Pipeline Complete!',
		totalLeads: pipelineAnalytics.totalLeads,
		hotLeads: pipelineAnalytics.hotLeads.length,
		conversionRate: pipelineAnalytics.conversionRate + '%',
		pipelineValue: '$' + pipelineAnalytics.totalPipelineValue.toLocaleString()
	},
	leads: leadsWithQR,
	analytics: pipelineAnalytics,
	insights: {
		topStages: Object.entries(pipelineAnalytics.leadsByStage).sort((a, b) => b[1] - a[1]),
		qualityDistribution: pipelineAnalytics.leadsByQuality,
		avgLeadScore: Math.round(pipelineAnalytics.avgLeadScore)
	},
	reports: {
		excel: salesBuffer.toString('base64'),
		size: Math.round(salesBuffer.length / 1024) + ' KB'
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
};