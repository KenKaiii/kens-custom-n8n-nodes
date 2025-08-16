// Image to Video Converter & Media Processor
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with imageJobs JSON structure

const data = $input.first().json;
const imageJobs = data.imageJobs;

// 1. Process image-to-video conversion jobs
const processedJobs = imageJobs.map((job) => {
	const jobId = 'IMG2VID-' + uuid.v4();
	const createdDate = dayjs(job.createdAt);

	// Validate image URLs
	const validImages = job.imageUrls.filter((url) => validator.isURL(url));
	const invalidImages = job.imageUrls.length - validImages.length;

	// Calculate video specifications
	const frameCount = validImages.length;
	const videoDuration = frameCount * (job.frameDuration || 2); // seconds per frame
	const estimatedFileSize = frameCount * 0.5; // MB estimate

	// Generate processing timeline
	const estimatedProcessingTime = frameCount * 3 + 30; // 3 seconds per frame + 30s overhead
	const completionTime = dayjs().add(estimatedProcessingTime, 'second');

	// Create job hash for tracking
	const jobHash = CryptoJS.SHA256(job.title + job.imageUrls.join('') + job.outputFormat)
		.toString()
		.substring(0, 12);

	// Generate video metadata
	const videoMetadata = {
		title: job.title,
		description: job.description || 'Generated video from image sequence',
		duration: videoDuration + ' seconds',
		fps: job.fps || 1, // frames per second
		resolution: job.resolution || '1920x1080',
		format: job.outputFormat || 'mp4',
		codec: job.outputFormat === 'webm' ? 'VP9' : 'H.264',
	};

	// Audio processing (if background music specified)
	const audioProcessing = {
		hasBackgroundMusic: !!job.backgroundMusicUrl,
		musicUrl: job.backgroundMusicUrl || null,
		musicValid: job.backgroundMusicUrl ? validator.isURL(job.backgroundMusicUrl) : false,
		audioFadeIn: job.audioFadeIn || 2,
		audioFadeOut: job.audioFadeOut || 2,
		audioVolume: job.audioVolume || 0.5,
	};

	// Transition effects
	const transitionEffects = {
		type: job.transitionType || 'fade',
		duration: job.transitionDuration || 0.5,
		hasCustomTransitions: !!job.customTransitions,
		effectsCount: (job.customTransitions || []).length,
	};

	return {
		...job,
		jobId,
		jobHash,
		timing: {
			created: createdDate.format('YYYY-MM-DD HH:mm:ss'),
			estimatedCompletion: completionTime.format('YYYY-MM-DD HH:mm:ss'),
			processingTimeMinutes: Math.round(estimatedProcessingTime / 60),
			queuePosition: Math.floor(Math.random() * 3) + 1,
		},
		validation: {
			validImages,
			invalidImages,
			validImageCount: validImages.length,
			allImagesValid: invalidImages === 0,
			hasMinimumImages: validImages.length >= 2,
		},
		videoSpecs: {
			...videoMetadata,
			frameCount,
			estimatedFileSizeMB: Math.round(estimatedFileSize),
			compressionRatio:
				job.quality === 'high' ? '10:1' : job.quality === 'medium' ? '15:1' : '20:1',
		},
		audioProcessing,
		effects: transitionEffects,
		output: {
			format: job.outputFormat || 'mp4',
			quality: job.quality || 'medium',
			downloadUrl:
				'https://storage.company.com/videos/' + jobHash + '.' + (job.outputFormat || 'mp4'),
			shareableLink: 'https://share.company.com/v/' + jobHash,
		},
	};
});

// 2. Video processing analytics
const processingAnalytics = {
	totalJobs: processedJobs.length,
	totalImages: _.sumBy(processedJobs, 'validation.validImageCount'),
	totalVideoDuration: _.sumBy(processedJobs, (j) => parseInt(j.videoSpecs.duration)),
	totalProcessingTime: _.sumBy(processedJobs, 'timing.processingTimeMinutes'),
	avgImagesPerVideo: _.meanBy(processedJobs, 'validation.validImageCount'),
	avgVideoDuration: _.meanBy(processedJobs, (j) => parseInt(j.videoSpecs.duration)),
	formatBreakdown: _.countBy(processedJobs, 'output.format'),
	qualityBreakdown: _.countBy(processedJobs, 'output.quality'),
	jobsWithAudio: processedJobs.filter((j) => j.audioProcessing.hasBackgroundMusic).length,
	jobsWithEffects: processedJobs.filter((j) => j.effects.hasCustomTransitions).length,
	estimatedTotalFileSize: _.sumBy(processedJobs, 'videoSpecs.estimatedFileSizeMB'),
};

// 3. Generate download QR codes for each video
const jobsWithQR = await Promise.all(
	processedJobs.map(async (job) => {
		const downloadData = JSON.stringify({
			jobId: job.jobId,
			title: job.title,
			downloadUrl: job.output.downloadUrl,
			shareableLink: job.output.shareableLink,
		});

		const downloadQR = await QRCode.toDataURL(downloadData, {
			width: 200,
			margin: 2,
			color: { dark: '#FF6B6B', light: '#FFFFFF' },
		});

		return { ...job, downloadQR };
	}),
);

// 4. Create comprehensive video processing Excel report
const videoWorkbook = XLSX.utils.book_new();

// Jobs overview sheet
const jobsSheet = XLSX.utils.json_to_sheet(
	jobsWithQR.map((j) => ({
		'Job ID': j.jobId,
		Title: j.title,
		'Valid Images': j.validation.validImageCount,
		'Invalid Images': j.validation.invalidImages,
		'Video Duration': j.videoSpecs.duration,
		'Frame Count': j.videoSpecs.frameCount,
		'Output Format': j.output.format,
		Quality: j.output.quality,
		'Estimated Size (MB)': j.videoSpecs.estimatedFileSizeMB,
		'Has Audio': j.audioProcessing.hasBackgroundMusic ? 'Yes' : 'No',
		'Processing Time': j.timing.processingTimeMinutes + ' min',
		Status: 'Queued',
		Created: j.timing.created,
	})),
);
XLSX.utils.book_append_sheet(videoWorkbook, jobsSheet, 'Video Jobs');

// Processing analytics sheet
const analyticsData = [
	{ Metric: 'Total Jobs', Value: processingAnalytics.totalJobs },
	{ Metric: 'Total Images Processed', Value: processingAnalytics.totalImages },
	{ Metric: 'Total Video Duration', Value: processingAnalytics.totalVideoDuration + ' seconds' },
	{ Metric: 'Total Processing Time', Value: processingAnalytics.totalProcessingTime + ' minutes' },
	{ Metric: 'Average Images per Video', Value: Math.round(processingAnalytics.avgImagesPerVideo) },
	{ Metric: 'Jobs with Audio', Value: processingAnalytics.jobsWithAudio },
	{ Metric: 'Jobs with Effects', Value: processingAnalytics.jobsWithEffects },
	{
		Metric: 'Estimated Total File Size',
		Value: processingAnalytics.estimatedTotalFileSize + ' MB',
	},
];
const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData);
XLSX.utils.book_append_sheet(videoWorkbook, analyticsSheet, 'Processing Analytics');

const videoBuffer = XLSX.write(videoWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '🎥 Image to Video Conversion Complete!',
		totalJobs: processingAnalytics.totalJobs,
		totalImages: processingAnalytics.totalImages,
		totalVideoDuration: processingAnalytics.totalVideoDuration + ' seconds',
		avgProcessingTime:
			Math.round(processingAnalytics.totalProcessingTime / processingAnalytics.totalJobs) +
			' min/video',
	},
	jobs: jobsWithQR,
	analytics: processingAnalytics,
	insights: {
		mostPopularFormat: Object.entries(processingAnalytics.formatBreakdown).sort(
			(a, b) => b[1] - a[1],
		)[0]?.[0],
		preferredQuality: Object.entries(processingAnalytics.qualityBreakdown).sort(
			(a, b) => b[1] - a[1],
		)[0]?.[0],
		efficiencyScore:
			Math.round((processingAnalytics.totalImages / processingAnalytics.totalProcessingTime) * 60) +
			' images/hour',
	},
	reports: {
		excel: videoBuffer.toString('base64'),
		size: Math.round(videoBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
