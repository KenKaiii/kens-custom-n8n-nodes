// QR Code Generator & Batch Processing
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with qrRequests JSON structure

const data = $input.first().json;
const qrRequests = data.qrRequests;

// 1. Process QR code generation requests
const processedQRCodes = await Promise.all(
	qrRequests.map(async (request) => {
		const qrId = 'QR-' + uuid.v4();
		const createdDate = dayjs();
		
		// Determine QR code type and format data accordingly
		let qrData = '';
		let qrType = 'text';
		
		if (request.type === 'url') {
			qrData = request.url;
			qrType = 'URL';
		} else if (request.type === 'email') {
			qrData = `mailto:${request.email}?subject=${encodeURIComponent(request.subject || '')}&body=${encodeURIComponent(request.body || '')}`;
			qrType = 'Email';
		} else if (request.type === 'phone') {
			qrData = `tel:${request.phone}`;
			qrType = 'Phone';
		} else if (request.type === 'sms') {
			qrData = `sms:${request.phone}?body=${encodeURIComponent(request.message || '')}`;
			qrType = 'SMS';
		} else if (request.type === 'wifi') {
			qrData = `WIFI:T:${request.security || 'WPA'};S:${request.ssid};P:${request.password};H:${request.hidden || 'false'};`;
			qrType = 'WiFi';
		} else if (request.type === 'vcard') {
			qrData = `BEGIN:VCARD
VERSION:3.0
FN:${request.name}
ORG:${request.company || ''}
TEL:${request.phone || ''}
EMAIL:${request.email || ''}
URL:${request.website || ''}
END:VCARD`;
			qrType = 'vCard';
		} else {
			qrData = request.text || request.data || '';
			qrType = 'Text';
		}
		
		// Validate the data
		const dataValid = qrData.length > 0 && qrData.length <= 2048; // QR code size limit
		
		// Generate QR code with custom styling
		const qrOptions = {
			width: request.size || 256,
			margin: request.margin || 2,
			color: {
				dark: request.darkColor || '#000000',
				light: request.lightColor || '#FFFFFF'
			},
			errorCorrectionLevel: request.errorCorrection || 'M'
		};
		
		const qrCodeImage = await QRCode.toDataURL(qrData, qrOptions);
		
		// Generate download hash
		const downloadHash = CryptoJS.SHA256(qrData + createdDate.format()).toString().substring(0, 10);
		
		// Calculate QR code metrics
		const estimatedScanDistance = request.size >= 512 ? '10 feet' : 
									  request.size >= 256 ? '5 feet' : 
									  request.size >= 128 ? '3 feet' : '1 foot';
		
		return {
			...request,
			qrId,
			qrType,
			qrData: qrData.length > 100 ? qrData.substring(0, 100) + '...' : qrData,
			fullQrData: qrData,
			downloadHash,
			validation: {
				dataValid,
				dataLength: qrData.length,
				withinSizeLimit: qrData.length <= 2048,
				hasRequiredFields: !!qrData
			},
			generation: {
				qrCodeBase64: qrCodeImage,
				options: qrOptions,
				estimatedScanDistance,
				errorCorrectionLevel: qrOptions.errorCorrectionLevel,
				complexity: qrData.length > 500 ? 'High' : qrData.length > 100 ? 'Medium' : 'Low'
			},
			timing: {
				created: createdDate.format('YYYY-MM-DD HH:mm:ss'),
				generationTime: '0.2 seconds',
				expiresAt: request.type === 'temp' ? dayjs().add(24, 'hour').format('YYYY-MM-DD HH:mm:ss') : 'Never'
			},
			usage: {
				downloadUrl: `https://qr.company.com/download/${downloadHash}`,
				previewUrl: `https://qr.company.com/preview/${downloadHash}`,
				trackingEnabled: request.trackScans || false,
				expectedScans: request.expectedUsage || 'Unknown'
			}
		};
	})
);

// 2. QR code analytics
const qrAnalytics = {
	totalQRCodes: processedQRCodes.length,
	typeBreakdown: _.countBy(processedQRCodes, 'qrType'),
	sizeBreakdown: _.countBy(processedQRCodes, 'generation.options.width'),
	complexityBreakdown: _.countBy(processedQRCodes, 'generation.complexity'),
	avgDataLength: _.meanBy(processedQRCodes, 'validation.dataLength'),
	validQRCodes: processedQRCodes.filter(qr => qr.validation.dataValid).length,
	errorCorrectionBreakdown: _.countBy(processedQRCodes, 'generation.errorCorrectionLevel'),
	trackingEnabled: processedQRCodes.filter(qr => qr.usage.trackingEnabled).length,
	estimatedTotalScans: processedQRCodes.length * 50 // Rough estimate
};

// 3. Create comprehensive QR code Excel report
const qrWorkbook = XLSX.utils.book_new();

// QR codes overview sheet
const qrSheet = XLSX.utils.json_to_sheet(
	processedQRCodes.map((qr) => ({
		'QR ID': qr.qrId,
		'Type': qr.qrType,
		'Data Preview': qr.qrData,
		'Data Length': qr.validation.dataLength,
		'Size (px)': qr.generation.options.width,
		'Complexity': qr.generation.complexity,
		'Scan Distance': qr.generation.estimatedScanDistance,
		'Error Correction': qr.generation.errorCorrectionLevel,
		'Tracking': qr.usage.trackingEnabled ? 'Yes' : 'No',
		'Valid': qr.validation.dataValid ? 'Yes' : 'No',
		'Created': qr.timing.created
	}))
);
XLSX.utils.book_append_sheet(qrWorkbook, qrSheet, 'QR Codes');

// Analytics summary sheet
const analyticsData = [
	{ Metric: 'Total QR Codes', Value: qrAnalytics.totalQRCodes },
	{ Metric: 'Valid QR Codes', Value: qrAnalytics.validQRCodes },
	{ Metric: 'Average Data Length', Value: Math.round(qrAnalytics.avgDataLength) + ' characters' },
	{ Metric: 'Most Common Type', Value: Object.entries(qrAnalytics.typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' },
	{ Metric: 'Most Common Size', Value: Object.entries(qrAnalytics.sizeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] + 'px' || 'N/A' },
	{ Metric: 'Tracking Enabled', Value: qrAnalytics.trackingEnabled },
	{ Metric: 'Estimated Total Scans', Value: qrAnalytics.estimatedTotalScans }
];
const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData);
XLSX.utils.book_append_sheet(qrWorkbook, analyticsSheet, 'QR Analytics');

const qrBuffer = XLSX.write(qrWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '📱 QR Code Generator Complete!',
		totalQRCodes: qrAnalytics.totalQRCodes,
		validCodes: qrAnalytics.validQRCodes + '/' + qrAnalytics.totalQRCodes,
		mostCommonType: Object.entries(qrAnalytics.typeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
		avgDataLength: Math.round(qrAnalytics.avgDataLength) + ' chars'
	},
	qrCodes: processedQRCodes,
	analytics: qrAnalytics,
	insights: {
		typeUsage: qrAnalytics.typeBreakdown,
		sizePreferences: qrAnalytics.sizeBreakdown,
		complexityDistribution: qrAnalytics.complexityBreakdown
	},
	reports: {
		excel: qrBuffer.toString('base64'),
		size: Math.round(qrBuffer.length / 1024) + ' KB'
	},
	librariesUsed: ['QRCode', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'XLSX'],
	generatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
};