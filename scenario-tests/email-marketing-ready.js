// Email Marketing Campaign Manager
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with campaigns and subscribers JSON structure

const data = $input.first().json;
const campaigns = data.campaigns;
const subscribers = data.subscribers;

// 1. Process email campaigns with validation
const processedCampaigns = campaigns.map((campaign) => {
	// Validate sender email
	const senderValid = validator.isEmail(campaign.senderEmail);

	// Parse send date
	const sendDate = dayjs(campaign.sendDate);
	const daysUntilSend = sendDate.diff(dayjs(), 'day');

	// Generate campaign ID and hash
	const campaignId = 'CAMP-' + uuid.v4();
	const contentHash = CryptoJS.SHA256(campaign.subject + campaign.content)
		.toString()
		.substring(0, 12);

	// Analyze email content
	const contentLength = campaign.content.length;
	const subjectLength = campaign.subject.length;
	const isOptimalSubject = subjectLength >= 20 && subjectLength <= 50;
	const isOptimalContent = contentLength >= 200 && contentLength <= 2000;

	// Extract links from content
	const linkRegex = /(https?:\/\/[^\s]+)/g;
	const extractedLinks = campaign.content.match(linkRegex) || [];
	const validLinks = extractedLinks.filter((link) => validator.isURL(link));

	return {
		...campaign,
		campaignId,
		contentHash,
		senderValid,
		scheduling: {
			sendDate: sendDate.format('YYYY-MM-DD HH:mm:ss'),
			daysUntilSend,
			status: daysUntilSend > 0 ? 'Scheduled' : daysUntilSend === 0 ? 'Sending Today' : 'Sent',
			dayOfWeek: sendDate.format('dddd'),
			isWeekend: sendDate.day() === 0 || sendDate.day() === 6,
		},
		contentAnalysis: {
			subjectLength,
			contentLength,
			isOptimalSubject,
			isOptimalContent,
			extractedLinks,
			validLinks: validLinks.length,
			totalLinks: extractedLinks.length,
			linkValidationRate:
				extractedLinks.length > 0
					? Math.round((validLinks.length / extractedLinks.length) * 100)
					: 100,
		},
		targeting: {
			audience: campaign.targetAudience,
			estimatedDelivery: Math.floor(Math.random() * 10000) + 5000, // Simulated
		},
	};
});

// 2. Process subscriber data
const processedSubscribers = subscribers.map((subscriber) => {
	const emailValid = validator.isEmail(subscriber.email);
	const subscribedDate = dayjs(subscriber.subscribedAt);
	const daysSinceSubscribed = dayjs().diff(subscribedDate, 'day');

	// Generate subscriber hash for privacy
	const subscriberHash = CryptoJS.SHA256(subscriber.email).toString().substring(0, 10);
	const subscriberId = 'SUB-' + uuid.v4();

	return {
		...subscriber,
		subscriberId,
		subscriberHash,
		emailValid,
		subscribedDate: subscribedDate.format('YYYY-MM-DD'),
		daysSinceSubscribed,
		segment: daysSinceSubscribed < 30 ? 'New' : daysSinceSubscribed < 365 ? 'Active' : 'Veteran',
	};
});

// 3. Campaign analytics with lodash
const campaignAnalytics = {
	totalCampaigns: processedCampaigns.length,
	scheduledCampaigns: processedCampaigns.filter((c) => c.scheduling.status === 'Scheduled').length,
	avgSubjectLength: _.meanBy(processedCampaigns, 'contentAnalysis.subjectLength'),
	avgContentLength: _.meanBy(processedCampaigns, 'contentAnalysis.contentLength'),
	optimizedCampaigns: processedCampaigns.filter(
		(c) => c.contentAnalysis.isOptimalSubject && c.contentAnalysis.isOptimalContent,
	).length,
	totalLinks: _.sumBy(processedCampaigns, 'contentAnalysis.totalLinks'),
	validSenders: processedCampaigns.filter((c) => c.senderValid).length,

	subscribers: {
		total: processedSubscribers.length,
		validEmails: processedSubscribers.filter((s) => s.emailValid).length,
		segments: _.countBy(processedSubscribers, 'segment'),
		averageDaysSubscribed: _.meanBy(processedSubscribers, 'daysSinceSubscribed'),
	},
};

// 4. Generate campaign QR codes for tracking
const campaignsWithQR = await Promise.all(
	processedCampaigns.map(async (campaign) => {
		const trackingData = JSON.stringify({
			campaignId: campaign.campaignId,
			subject: campaign.subject.substring(0, 50),
			sendDate: campaign.scheduling.sendDate,
		});

		const qrCode = await QRCode.toDataURL(trackingData, {
			width: 150,
			margin: 2,
		});

		return { ...campaign, trackingQR: qrCode };
	}),
);

// 5. Create Excel report with campaign and subscriber data
const emailWorkbook = XLSX.utils.book_new();

// Campaigns sheet
const campaignsSheet = XLSX.utils.json_to_sheet(
	campaignsWithQR.map((c) => ({
		'Campaign ID': c.campaignId,
		Subject: c.subject,
		'Sender Valid': c.senderValid ? 'Yes' : 'No',
		'Send Date': c.scheduling.sendDate,
		Status: c.scheduling.status,
		'Subject Length': c.contentAnalysis.subjectLength,
		'Content Length': c.contentAnalysis.contentLength,
		'Optimal Subject': c.contentAnalysis.isOptimalSubject ? 'Yes' : 'No',
		'Total Links': c.contentAnalysis.totalLinks,
		'Valid Links': c.contentAnalysis.validLinks,
		'Target Audience': c.targetAudience,
	})),
);
XLSX.utils.book_append_sheet(emailWorkbook, campaignsSheet, 'Campaigns');

// Subscribers sheet
const subscribersSheet = XLSX.utils.json_to_sheet(
	processedSubscribers.map((s) => ({
		'Subscriber ID': s.subscriberId,
		Email: s.email,
		'Email Valid': s.emailValid ? 'Yes' : 'No',
		Name: s.name,
		'Subscribed Date': s.subscribedDate,
		'Days Subscribed': s.daysSinceSubscribed,
		Segment: s.segment,
		Status: s.status,
	})),
);
XLSX.utils.book_append_sheet(emailWorkbook, subscribersSheet, 'Subscribers');

const emailBuffer = XLSX.write(emailWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '📧 Email Marketing Campaign Complete!',
		totalCampaigns: campaignAnalytics.totalCampaigns,
		scheduledCampaigns: campaignAnalytics.scheduledCampaigns,
		totalSubscribers: campaignAnalytics.subscribers.total,
		validEmailRate:
			Math.round(
				(campaignAnalytics.subscribers.validEmails / campaignAnalytics.subscribers.total) * 100,
			) + '%',
	},
	campaigns: campaignsWithQR,
	subscribers: processedSubscribers,
	analytics: campaignAnalytics,
	recommendations: {
		optimizeSubjects: processedCampaigns.filter((c) => !c.contentAnalysis.isOptimalSubject).length,
		fixInvalidSenders: processedCampaigns.filter((c) => !c.senderValid).length,
		cleanInvalidEmails: processedSubscribers.filter((s) => !s.emailValid).length,
	},
	reports: {
		excel: emailBuffer.toString('base64'),
		size: Math.round(emailBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
