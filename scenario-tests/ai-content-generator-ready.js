// AI-Powered Content Generator & SEO Optimizer
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with contentRequests JSON structure

const data = $input.first().json;
const requests = data.contentRequests;

// 1. Generate AI-powered content with templates and optimization
const generatedContent = requests.map((request) => {
	const contentId = 'CONTENT-' + uuid.v4();
	const createdDate = dayjs();

	// Generate content based on type and keywords
	let generatedText = '';
	const keywords = request.keywords || [];
	const keywordText = keywords.join(', ');

	if (request.type === 'blog_post') {
		const blogTemplate = Handlebars.compile(`
# {{title}}

## Introduction
{{description}}

## Key Points
{{#each keywords}}
- {{this}} is crucial for modern businesses
{{/each}}

## Analysis
Based on current trends in {{industry}}, we can see that {{keywords.[0]}} is becoming increasingly important.

## Conclusion
The future of {{industry}} depends on understanding {{keywords.[1]}} and implementing {{keywords.[2]}} strategies.

*Generated on {{date}} | Word count: {{wordCount}}*
		`);

		generatedText = blogTemplate({
			title: request.title,
			description: request.description,
			keywords: keywords,
			industry: request.industry || 'technology',
			date: createdDate.format('YYYY-MM-DD'),
			wordCount: 'calculated below',
		});
	} else if (request.type === 'product_description') {
		const productTemplate = Handlebars.compile(`
**{{productName}}** - {{tagline}}

{{description}}

🌟 **Key Features:**
{{#each features}}
• {{this}}
{{/each}}

💰 **Pricing:** {{price}}
🚀 **Perfect for:** {{targetAudience}}

Keywords: {{keywords}}
		`);

		generatedText = productTemplate({
			productName: request.productName,
			tagline: request.tagline || 'Revolutionary Solution',
			description: request.description,
			features: request.features || [
				'Advanced Technology',
				'User-Friendly Design',
				'Premium Quality',
			],
			price: request.price || 'Contact for pricing',
			targetAudience: request.targetAudience || 'professionals',
			keywords: keywordText,
		});
	}

	// Analyze generated content
	const wordCount = generatedText.split(' ').filter((w) => w.length > 0).length;
	const characterCount = generatedText.length;
	const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

	// SEO analysis
	const keywordDensity =
		keywords.length > 0
			? keywords.map((keyword) => ({
					keyword,
					count: (generatedText.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || [])
						.length,
					density: (
						((generatedText.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || [])
							.length /
							wordCount) *
						100
					).toFixed(2),
				}))
			: [];

	// Generate URL-safe slug
	const slug = request.title
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.substring(0, 60);

	// Create content hash for plagiarism detection
	const contentHash = CryptoJS.SHA256(generatedText).toString().substring(0, 16);

	// Generate meta tags
	const metaDescription = request.description.substring(0, 155) + '...';
	const metaKeywords = keywords.slice(0, 10).join(', ');

	return {
		...request,
		contentId,
		slug,
		contentHash,
		generatedContent: generatedText,
		seo: {
			wordCount,
			characterCount,
			readingTime: readingTime + ' min read',
			keywordDensity,
			metaDescription,
			metaKeywords,
			titleLength: request.title.length,
			isOptimalTitle: request.title.length >= 30 && request.title.length <= 60,
			isOptimalDescription: request.description.length >= 120 && request.description.length <= 155,
		},
		performance: {
			estimatedSEOScore: Math.min(
				100,
				(request.title.length >= 30 ? 20 : 10) +
					(keywords.length >= 3 ? 20 : 10) +
					(wordCount >= 300 ? 30 : 15) +
					(request.description.length >= 120 ? 20 : 10) +
					(keywordDensity.length > 0 ? 10 : 0),
			),
		},
		timing: {
			created: createdDate.format('YYYY-MM-DD HH:mm:ss'),
			estimatedPublishDate: createdDate.add(1, 'day').format('YYYY-MM-DD'),
		},
	};
});

// 2. Content analytics and optimization suggestions
const contentAnalytics = {
	totalContent: generatedContent.length,
	avgWordCount: _.meanBy(generatedContent, 'seo.wordCount'),
	avgSEOScore: _.meanBy(generatedContent, 'performance.estimatedSEOScore'),
	contentTypes: _.countBy(generatedContent, 'type'),
	avgReadingTime: _.meanBy(generatedContent, (c) => parseInt(c.seo.readingTime)),
	optimizedContent: generatedContent.filter((c) => c.performance.estimatedSEOScore >= 80).length,
	totalKeywords: _.sumBy(generatedContent, (c) => c.keywords.length),
	topKeywords: _.flatten(generatedContent.map((c) => c.keywords)),
};

// 3. Generate QR codes for content sharing
const contentWithQR = await Promise.all(
	generatedContent.map(async (content) => {
		const shareData = JSON.stringify({
			contentId: content.contentId,
			title: content.title,
			type: content.type,
			seoScore: content.performance.estimatedSEOScore,
		});

		const qrCode = await QRCode.toDataURL(shareData, {
			width: 150,
			margin: 2,
			color: { dark: '#6366F1', light: '#FFFFFF' },
		});

		return { ...content, shareQR: qrCode };
	}),
);

// 4. Create comprehensive content Excel report
const contentWorkbook = XLSX.utils.book_new();

// Content overview sheet
const contentSheet = XLSX.utils.json_to_sheet(
	contentWithQR.map((c) => ({
		'Content ID': c.contentId,
		Title: c.title,
		Type: c.type,
		'Word Count': c.seo.wordCount,
		'Reading Time': c.seo.readingTime,
		'SEO Score': c.performance.estimatedSEOScore,
		Keywords: c.keywords.join(', '),
		Slug: c.slug,
		'Meta Description': c.seo.metaDescription,
		'Optimal Title': c.seo.isOptimalTitle ? 'Yes' : 'No',
		Created: c.timing.created,
	})),
);
XLSX.utils.book_append_sheet(contentWorkbook, contentSheet, 'Generated Content');

// SEO analysis sheet
const seoData = [
	{ Metric: 'Total Content Pieces', Value: contentAnalytics.totalContent },
	{ Metric: 'Average Word Count', Value: Math.round(contentAnalytics.avgWordCount) },
	{ Metric: 'Average SEO Score', Value: Math.round(contentAnalytics.avgSEOScore) + '/100' },
	{
		Metric: 'Optimized Content',
		Value: contentAnalytics.optimizedContent + '/' + contentAnalytics.totalContent,
	},
	{ Metric: 'Total Keywords', Value: contentAnalytics.totalKeywords },
	{ Metric: 'Blog Posts', Value: contentAnalytics.contentTypes.blog_post || 0 },
	{ Metric: 'Product Descriptions', Value: contentAnalytics.contentTypes.product_description || 0 },
];
const seoSheet = XLSX.utils.json_to_sheet(seoData);
XLSX.utils.book_append_sheet(contentWorkbook, seoSheet, 'SEO Analysis');

const contentBuffer = XLSX.write(contentWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '🤖 AI Content Generator Complete!',
		totalContent: contentAnalytics.totalContent,
		avgWordCount: Math.round(contentAnalytics.avgWordCount),
		avgSEOScore: Math.round(contentAnalytics.avgSEOScore) + '/100',
		optimizedPieces: contentAnalytics.optimizedContent + '/' + contentAnalytics.totalContent,
	},
	content: contentWithQR,
	analytics: contentAnalytics,
	optimization: {
		topKeywords: _.take(
			_.orderBy(Object.entries(_.countBy(contentAnalytics.topKeywords)), '1', 'desc'),
			10,
		),
		recommendations: generatedContent
			.filter((c) => c.performance.estimatedSEOScore < 80)
			.map((c) => ({
				contentId: c.contentId,
				title: c.title,
				issues: [
					...(c.seo.titleLength < 30 ? ['Title too short'] : []),
					...(c.keywords.length < 3 ? ['Need more keywords'] : []),
					...(c.seo.wordCount < 300 ? ['Content too short'] : []),
				],
			})),
	},
	reports: {
		excel: contentBuffer.toString('base64'),
		size: Math.round(contentBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['dayjs', 'CryptoJS', 'uuid', 'Handlebars', 'lodash', 'QRCode', 'XLSX'],
	generatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
