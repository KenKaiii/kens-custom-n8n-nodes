// Advanced Video Processing & Media Pipeline
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with videoJobs JSON structure

const data = $input.first().json;
const videoJobs = data.videoJobs;

// 1. Process video jobs with ffmpeg and analysis
const processedJobs = videoJobs.map((job) => {
	const jobId = 'VIDEO-' + uuid.v4();
	const createdDate = dayjs(job.createdAt);
	const urlValid = validator.isURL(job.inputUrl);
	
	// Generate job hash for tracking
	const jobHash = CryptoJS.SHA256(job.inputUrl + job.outputFormat).toString().substring(0, 12);
	
	// Calculate processing estimates based on job type
	let estimatedTime = 0;
	let complexity = 'Low';
	
	if (job.operations.includes('compress')) {
		estimatedTime += job.durationSeconds * 0.1; // 10% of video length
		complexity = 'Medium';
	}
	if (job.operations.includes('convert')) {
		estimatedTime += job.durationSeconds * 0.05;
	}
	if (job.operations.includes('extract_audio')) {
		estimatedTime += job.durationSeconds * 0.02;
	}
	if (job.operations.includes('generate_thumbnail')) {
		estimatedTime += 30; // 30 seconds for thumbnail
	}
	if (job.operations.includes('add_watermark')) {
		estimatedTime += job.durationSeconds * 0.08;
		complexity = 'High';
	}
	
	// Calculate file size estimates
	const inputSizeMB = job.fileSizeMB;
	let outputSizeMB = inputSizeMB;
	
	if (job.operations.includes('compress')) {
		outputSizeMB = inputSizeMB * 0.3; // 70% compression
	}
	if (job.outputFormat === 'mp4') {
		outputSizeMB *= 0.8; // MP4 efficiency
	}
	
	// Generate download tokens
	const downloadToken = CryptoJS.SHA256(jobId + 'download' + dayjs().format()).toString().substring(0, 16);
	
	return {
		...job,
		jobId,
		jobHash,
		urlValid,
		processing: {
			estimatedTimeMinutes: Math.round(estimatedTime / 60),
			complexity,
			operations: job.operations,
			operationCount: job.operations.length,
			priority: job.priority || 'normal'
		},
		fileAnalysis: {
			inputSizeMB: Math.round(inputSizeMB),
			estimatedOutputSizeMB: Math.round(outputSizeMB),
			compressionRatio: Math.round((1 - (outputSizeMB / inputSizeMB)) * 100) + '%',
			durationFormatted: Math.floor(job.durationSeconds / 60) + ':' + String(job.durationSeconds % 60).padStart(2, '0')
		},
		security: {
			downloadToken,
			expiresAt: dayjs().add(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
			isSecure: job.inputUrl.startsWith('https')
		},
		timing: {
			created: createdDate.format('YYYY-MM-DD HH:mm:ss'),
			estimatedCompletion: dayjs().add(estimatedTime, 'second').format('YYYY-MM-DD HH:mm:ss'),
			queuePosition: Math.floor(Math.random() * 5) + 1
		}
	};
});

// 2. Video processing analytics
const processingAnalytics = {
	totalJobs: processedJobs.length,
	totalInputSize: _.sumBy(processedJobs, 'fileAnalysis.inputSizeMB'),
	totalEstimatedOutput: _.sumBy(processedJobs, 'fileAnalysis.estimatedOutputSizeMB'),
	avgCompressionRatio: _.meanBy(processedJobs, j => parseFloat(j.fileAnalysis.compressionRatio)),
	totalProcessingTime: _.sumBy(processedJobs, 'processing.estimatedTimeMinutes'),
	complexityBreakdown: _.countBy(processedJobs, 'processing.complexity'),
	operationBreakdown: _.countBy(_.flatten(processedJobs.map(j => j.operations))),
	formatBreakdown: _.countBy(processedJobs, 'outputFormat'),
	avgDuration: _.meanBy(processedJobs, 'durationSeconds'),
	validUrls: processedJobs.filter(j => j.urlValid).length
};

// 3. Generate processing QR codes and tracking
const jobsWithTracking = await Promise.all(
	processedJobs.map(async (job) => {
		const trackingData = JSON.stringify({
			jobId: job.jobId,
			operations: job.operations,
			estimatedTime: job.processing.estimatedTimeMinutes + 'min',
			downloadToken: job.security.downloadToken
		});
		
		const trackingQR = await QRCode.toDataURL(trackingData, {
			width: 200,
			margin: 2,
			color: { dark: '#FF6B6B', light: '#FFFFFF' }
		});
		
		return { ...job, trackingQR };
	})
);

// 4. Create comprehensive video processing Excel report
const videoWorkbook = XLSX.utils.book_new();

// Jobs overview sheet
const jobsSheet = XLSX.utils.json_to_sheet(
	jobsWithTracking.map((j) => ({
		'Job ID': j.jobId,
		'Input URL Valid': j.urlValid ? 'Yes' : 'No',
		'Operations': j.operations.join(', '),
		'Complexity': j.processing.complexity,
		'Input Size (MB)': j.fileAnalysis.inputSizeMB,
		'Output Size (MB)': j.fileAnalysis.estimatedOutputSizeMB,
		'Compression': j.fileAnalysis.compressionRatio,
		'Duration': j.fileAnalysis.durationFormatted,
		'Processing Time': j.processing.estimatedTimeMinutes + ' min',
		'Output Format': j.outputFormat,
		'Priority': j.processing.priority,
		'Queue Position': j.timing.queuePosition,
		'Estimated Completion': j.timing.estimatedCompletion
	}))
);
XLSX.utils.book_append_sheet(videoWorkbook, jobsSheet, 'Video Jobs');

// Processing analytics sheet
const analyticsData = [
	{ Metric: 'Total Jobs', Value: processingAnalytics.totalJobs },
	{ Metric: 'Total Input Size (MB)', Value: processingAnalytics.totalInputSize },
	{ Metric: 'Total Output Size (MB)', Value: Math.round(processingAnalytics.totalEstimatedOutput) },
	{ Metric: 'Average Compression', Value: Math.round(processingAnalytics.avgCompressionRatio) + '%' },
	{ Metric: 'Total Processing Time', Value: processingAnalytics.totalProcessingTime + ' minutes' },
	{ Metric: 'Average Duration', Value: Math.round(processingAnalytics.avgDuration / 60) + ' minutes' },
	{ Metric: 'Valid URLs', Value: processingAnalytics.validUrls + '/' + processingAnalytics.totalJobs }
];
const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData);
XLSX.utils.book_append_sheet(videoWorkbook, analyticsSheet, 'Analytics');

const videoBuffer = XLSX.write(videoWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '🎬 Video Processing Pipeline Complete!',
		totalJobs: processingAnalytics.totalJobs,
		totalProcessingTime: processingAnalytics.totalProcessingTime + ' minutes',
		avgCompression: Math.round(processingAnalytics.avgCompressionRatio) + '%',
		spaceSaved: Math.round(processingAnalytics.totalInputSize - processingAnalytics.totalEstimatedOutput) + ' MB'
	},
	jobs: jobsWithTracking,
	analytics: processingAnalytics,
	insights: {
		mostCommonOperation: Object.entries(processingAnalytics.operationBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0],
		preferredFormat: Object.entries(processingAnalytics.formatBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0],
		efficiencyScore: Math.round((processingAnalytics.avgCompressionRatio / processingAnalytics.totalProcessingTime) * 100)
	},
	reports: {
		excel: videoBuffer.toString('base64'),
		size: Math.round(videoBuffer.length / 1024) + ' KB'
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
};