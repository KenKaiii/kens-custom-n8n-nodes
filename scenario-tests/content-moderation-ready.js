// Content Moderation & Community Management
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with posts JSON structure

const data = $input.first().json;
const posts = data.posts;

// 1. Process user-generated content for moderation
const moderatedPosts = posts.map((post) => {
	const postId = 'POST-' + uuid.v4();
	const createdDate = dayjs(post.createdAt);
	const emailValid = validator.isEmail(post.userEmail);

	// Content analysis
	const contentLength = post.content.length;
	const wordCount = post.content.split(' ').length;

	// Profanity detection (simple keyword-based)
	const profanityWords = ['spam', 'scam', 'fake', 'banned'];
	const profanityCount = profanityWords.filter((word) =>
		post.content.toLowerCase().includes(word),
	).length;

	// URL detection
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const urls = post.content.match(urlRegex) || [];
	const validUrls = urls.filter((url) => validator.isURL(url));

	// Calculate risk score
	let riskScore = 0;
	if (profanityCount > 0) riskScore += profanityCount * 20;
	if (urls.length > 2) riskScore += 15;
	if (contentLength > 1000) riskScore += 10;
	if (!emailValid) riskScore += 25;
	if (post.reportCount > 0) riskScore += post.reportCount * 10;

	// Determine moderation action
	let moderationAction = 'approved';
	if (riskScore >= 50) moderationAction = 'blocked';
	else if (riskScore >= 25) moderationAction = 'review';
	else if (riskScore >= 10) moderationAction = 'flagged';

	// Generate content hash
	const contentHash = CryptoJS.SHA256(post.content).toString().substring(0, 12);

	return {
		...post,
		postId,
		contentHash,
		emailValid,
		timing: {
			created: createdDate.format('YYYY-MM-DD HH:mm:ss'),
			hoursAgo: dayjs().diff(createdDate, 'hour'),
			daysAgo: dayjs().diff(createdDate, 'day'),
		},
		analysis: {
			contentLength,
			wordCount,
			profanityCount,
			urls: urls.length,
			validUrls: validUrls.length,
			riskScore,
			moderationAction,
			needsReview: moderationAction === 'review' || moderationAction === 'flagged',
		},
		safety: {
			isSpam: profanityCount > 0 || urls.length > 3,
			hasReports: post.reportCount > 0,
			trustScore: Math.max(0, 100 - riskScore),
		},
	};
});

// 2. Moderation analytics
const moderationAnalytics = {
	totalPosts: moderatedPosts.length,
	approvedPosts: moderatedPosts.filter((p) => p.analysis.moderationAction === 'approved').length,
	blockedPosts: moderatedPosts.filter((p) => p.analysis.moderationAction === 'blocked').length,
	reviewPosts: moderatedPosts.filter((p) => p.analysis.moderationAction === 'review').length,
	flaggedPosts: moderatedPosts.filter((p) => p.analysis.moderationAction === 'flagged').length,
	avgRiskScore: _.meanBy(moderatedPosts, 'analysis.riskScore'),
	avgTrustScore: _.meanBy(moderatedPosts, 'safety.trustScore'),
	spamPosts: moderatedPosts.filter((p) => p.safety.isSpam).length,
	reportedPosts: moderatedPosts.filter((p) => p.safety.hasReports).length,
	validEmails: moderatedPosts.filter((p) => p.emailValid).length,
	actionBreakdown: _.countBy(moderatedPosts, 'analysis.moderationAction'),
};

// 3. Create moderation Excel report
const moderationWorkbook = XLSX.utils.book_new();

const postsSheet = XLSX.utils.json_to_sheet(
	moderatedPosts.map((p) => ({
		'Post ID': p.postId,
		Username: p.username,
		'Email Valid': p.emailValid ? 'Yes' : 'No',
		'Content Preview': p.content.substring(0, 50) + '...',
		'Word Count': p.analysis.wordCount,
		'URLs Found': p.analysis.urls,
		'Risk Score': p.analysis.riskScore,
		'Trust Score': p.safety.trustScore,
		Action: p.analysis.moderationAction,
		Reports: p.reportCount,
		Created: p.timing.created,
	})),
);
XLSX.utils.book_append_sheet(moderationWorkbook, postsSheet, 'Posts');

const moderationBuffer = XLSX.write(moderationWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '🛡️ Content Moderation Complete!',
		totalPosts: moderationAnalytics.totalPosts,
		approvedPosts: moderationAnalytics.approvedPosts,
		blockedPosts: moderationAnalytics.blockedPosts,
		needsReview: moderationAnalytics.reviewPosts + moderationAnalytics.flaggedPosts,
	},
	posts: moderatedPosts,
	analytics: moderationAnalytics,
	alerts: {
		highRiskPosts: moderatedPosts.filter((p) => p.analysis.riskScore >= 50).map((p) => p.postId),
		spamPosts: moderatedPosts.filter((p) => p.safety.isSpam).map((p) => p.postId),
		reportedPosts: moderatedPosts.filter((p) => p.safety.hasReports).map((p) => p.postId),
	},
	reports: {
		excel: moderationBuffer.toString('base64'),
		size: Math.round(moderationBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	moderatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
