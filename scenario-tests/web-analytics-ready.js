// Web Analytics & Traffic Analysis
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with analytics JSON structure

const data = $input.first().json;
const analytics = data.analytics;
const sessions = data.sessions;

// 1. Process analytics data
const processedAnalytics = analytics.map((entry) => {
	const entryDate = dayjs(entry.date);
	const analyticsId = 'ANALYTICS-' + uuid.v4();
	
	// Calculate metrics
	const bounceRate = (entry.bounces / entry.sessions) * 100;
	const conversionRate = (entry.conversions / entry.sessions) * 100;
	const avgSessionDuration = entry.totalDuration / entry.sessions;
	
	return {
		...entry,
		analyticsId,
		date: entryDate.format('YYYY-MM-DD'),
		dayOfWeek: entryDate.format('dddd'),
		bounceRate: Math.round(bounceRate * 100) / 100,
		conversionRate: Math.round(conversionRate * 100) / 100,
		avgSessionDuration: Math.round(avgSessionDuration),
		performance: bounceRate < 40 && conversionRate > 2 ? 'Good' : 'Needs Improvement'
	};
});

// 2. Process session data
const processedSessions = sessions.map(session => {
	const sessionStart = dayjs(session.startTime);
	const sessionEnd = dayjs(session.endTime);
	const duration = sessionEnd.diff(sessionStart, 'minute');
	
	const sessionId = 'SES-' + uuid.v4();
	const userHash = CryptoJS.SHA256(session.userId).toString().substring(0, 8);
	
	return {
		...session,
		sessionId,
		userHash,
		startTime: sessionStart.format('YYYY-MM-DD HH:mm:ss'),
		endTime: sessionEnd.format('YYYY-MM-DD HH:mm:ss'),
		duration,
		hour: sessionStart.hour(),
		isBusinessHours: sessionStart.hour() >= 9 && sessionStart.hour() <= 17
	};
});

// 3. Generate analytics summary
const analyticsSummary = {
	totalSessions: _.sumBy(processedAnalytics, 'sessions'),
	totalPageviews: _.sumBy(processedAnalytics, 'pageviews'),
	totalConversions: _.sumBy(processedAnalytics, 'conversions'),
	avgBounceRate: _.meanBy(processedAnalytics, 'bounceRate'),
	avgConversionRate: _.meanBy(processedAnalytics, 'conversionRate'),
	avgSessionDuration: _.meanBy(processedSessions, 'duration'),
	peakHours: _.countBy(processedSessions, 'hour'),
	businessHoursSessions: processedSessions.filter(s => s.isBusinessHours).length
};

// 4. Create Excel report
const analyticsWorkbook = XLSX.utils.book_new();

const analyticsSheet = XLSX.utils.json_to_sheet(
	processedAnalytics.map((a) => ({
		'Date': a.date,
		'Day': a.dayOfWeek,
		'Sessions': a.sessions,
		'Pageviews': a.pageviews,
		'Bounce Rate': a.bounceRate + '%',
		'Conversion Rate': a.conversionRate + '%',
		'Conversions': a.conversions,
		'Performance': a.performance
	}))
);
XLSX.utils.book_append_sheet(analyticsWorkbook, analyticsSheet, 'Analytics');

const sessionsSheet = XLSX.utils.json_to_sheet(
	processedSessions.slice(0, 100).map((s) => ({ // Limit to first 100 sessions
		'Session ID': s.sessionId,
		'Start Time': s.startTime,
		'Duration (min)': s.duration,
		'Pages': s.pagesVisited,
		'Business Hours': s.isBusinessHours ? 'Yes' : 'No',
		'Source': s.source
	}))
);
XLSX.utils.book_append_sheet(analyticsWorkbook, sessionsSheet, 'Sessions');

const analyticsBuffer = XLSX.write(analyticsWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '📊 Web Analytics Complete!',
		totalSessions: analyticsSummary.totalSessions,
		avgBounceRate: Math.round(analyticsSummary.avgBounceRate) + '%',
		avgConversionRate: Math.round(analyticsSummary.avgConversionRate) + '%',
		businessHoursTraffic: Math.round((analyticsSummary.businessHoursSessions / processedSessions.length) * 100) + '%'
	},
	analytics: processedAnalytics,
	sessions: processedSessions.slice(0, 50), // Return limited sessions
	summary: analyticsSummary,
	reports: {
		excel: analyticsBuffer.toString('base64'),
		size: Math.round(analyticsBuffer.length / 1024) + ' KB'
	},
	librariesUsed: ['dayjs', 'CryptoJS', 'uuid', 'lodash', 'XLSX'],
	analyzedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
};