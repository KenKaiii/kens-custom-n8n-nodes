// Social Media Content Scheduler & Analytics
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with socialPosts and performanceData JSON structure

const data = $input.first().json;
const posts = data.socialPosts;
const performance = data.performanceData;

// 1. Process social media content with multiple libraries
const processedPosts = posts.map((post) => {
	// Parse scheduled time with dayjs
	const scheduledTime = dayjs(post.scheduledTime);
	const timeUntilPost = scheduledTime.diff(dayjs(), 'minute');

	// Extract hashtags with regex and validate URLs
	const hashtagRegex = /#\w+/g;
	const extractedHashtags = post.content.match(hashtagRegex) || [];
	const mediaValid = post.mediaUrl ? validator.isURL(post.mediaUrl) : false;

	// Generate content hash for duplicate detection
	const contentHash = CryptoJS.SHA256(post.content.toLowerCase().replace(/\s+/g, ' '))
		.toString()
		.substring(0, 12);

	// Create post ID
	const postId = 'POST-' + uuid.v4();

	// Analyze content length for platform optimization
	const platformLimits = {
		Twitter: 280,
		LinkedIn: 3000,
		Facebook: 63206,
		Instagram: 2200,
	};

	const contentLength = post.content.length;
	const isOptimalLength = contentLength <= platformLimits[post.platform];

	// Generate URL-safe slug from content
	const contentSlug = post.content
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.substring(0, 50);

	return {
		...post,
		postId,
		contentHash,
		contentSlug,
		extractedHashtags,
		originalContent: post.content, // Preserve original content
		scheduling: {
			scheduledTime: scheduledTime.format('YYYY-MM-DD HH:mm:ss'),
			timeUntilPost: timeUntilPost > 0 ? timeUntilPost + ' minutes' : 'Past due',
			dayOfWeek: scheduledTime.format('dddd'),
			isWeekend: scheduledTime.day() === 0 || scheduledTime.day() === 6,
			timeZone: 'UTC',
		},
		contentMetrics: {
			length: contentLength,
			isOptimalLength,
			limit: platformLimits[post.platform],
			extractedHashtags,
			hashtagCount: extractedHashtags.length,
			hasMedia: !!post.mediaUrl,
			mediaValid,
		},
		targeting: {
			audience: post.targetAudience,
			platform: post.platform,
			estimatedReach: Math.floor(Math.random() * 10000) + 1000,
		},
	};
});

// 2. Analyze performance data with lodash
const performanceAnalysis = {
	totalPosts: processedPosts.length,
	platformBreakdown: _.countBy(processedPosts, 'platform'),
	averageContentLength: _.meanBy(processedPosts, 'contentMetrics.length'),
	postsWithMedia: processedPosts.filter((p) => p.contentMetrics.hasMedia).length,
	weekendPosts: processedPosts.filter((p) => p.scheduling.isWeekend).length,
	hashtagUsage: _.flatten(processedPosts.map((p) => p.extractedHashtags)),
	totalHashtags: _.flatten(processedPosts.map((p) => p.extractedHashtags)).length,
};

// 3. Generate QR codes for post sharing
const postsWithQR = await Promise.all(
	processedPosts.map(async (post) => {
		const shareData = JSON.stringify({
			postId: post.postId,
			platform: post.platform,
			scheduledTime: post.scheduling.scheduledTime,
			content: post.originalContent.substring(0, 100),
		});

		const qrCode = await QRCode.toDataURL(shareData, {
			width: 200,
			margin: 2,
			color: { dark: '#1DA1F2', light: '#FFFFFF' },
		});

		return { ...post, shareQR: qrCode };
	}),
);

// 4. Create Excel report with XLSX
const socialWorkbook = XLSX.utils.book_new();

const postsSheet = XLSX.utils.json_to_sheet(
	postsWithQR.map((p) => ({
		'Post ID': p.postId,
		Platform: p.platform,
		Content: p.originalContent,
		'Scheduled Time': p.scheduling.scheduledTime,
		'Content Length': p.contentMetrics.length,
		'Optimal Length': p.contentMetrics.isOptimalLength ? 'Yes' : 'No',
		'Hashtag Count': p.contentMetrics.hashtagCount,
		'Has Media': p.contentMetrics.hasMedia ? 'Yes' : 'No',
		'Target Audience': p.targetAudience,
		'Weekend Post': p.scheduling.isWeekend ? 'Yes' : 'No',
	})),
);
XLSX.utils.book_append_sheet(socialWorkbook, postsSheet, 'Social Posts');

const socialBuffer = XLSX.write(socialWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '📱 Social Media Scheduler Complete!',
		totalPosts: performanceAnalysis.totalPosts,
		platforms: Object.keys(performanceAnalysis.platformBreakdown).join(', '),
		avgContentLength: Math.round(performanceAnalysis.averageContentLength),
		totalHashtags: performanceAnalysis.totalHashtags,
	},
	posts: postsWithQR,
	analytics: performanceAnalysis,
	reports: {
		excel: socialBuffer.toString('base64'),
		size: Math.round(socialBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['dayjs', 'validator', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	scheduledAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};