// PDF Data Extraction & Processing
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with pdfData JSON structure

const data = $input.first().json;
const pdfRequests = data.pdfRequests;

// 1. Process PDF extraction requests
const processedExtractions = pdfRequests.map((request) => {
	const extractionId = 'PDF-' + uuid.v4();
	const requestDate = dayjs(request.requestedAt);

	// Simulate PDF text extraction (in real scenario, would use pdfLib)
	const extractedText =
		request.pdfContent ||
		'Sample PDF content extracted successfully. This document contains important business information including financial data, contact details, and strategic planning information.';

	// Extract emails from PDF content
	const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
	const extractedEmails = extractedText.match(emailRegex) || [];
	const validEmails = extractedEmails.filter((email) => validator.isEmail(email));

	// Extract phone numbers
	const phoneRegex = /(\+?1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/g;
	const extractedPhones = extractedText.match(phoneRegex) || [];

	// Extract monetary amounts
	const moneyRegex = /\$[\d,]+\.?\d*/g;
	const extractedAmounts = extractedText.match(moneyRegex) || [];
	const totalAmount = extractedAmounts.reduce((sum, amount) => {
		const numericValue = parseFloat(amount.replace(/[$,]/g, ''));
		return sum + (isNaN(numericValue) ? 0 : numericValue);
	}, 0);

	// Extract dates
	const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
	const extractedDates = extractedText.match(dateRegex) || [];
	const validDates = extractedDates.filter((date) => dayjs(date).isValid());

	// Text analysis
	const wordCount = extractedText.split(' ').filter((word) => word.length > 0).length;
	const pageCount = Math.ceil(extractedText.length / 2000); // Estimate pages

	// Generate content hash for duplicate detection
	const contentHash = CryptoJS.SHA256(extractedText).toString().substring(0, 12);

	// Create structured data extraction
	const structuredData = {
		documentType: extractedText.toLowerCase().includes('invoice')
			? 'Invoice'
			: extractedText.toLowerCase().includes('contract')
				? 'Contract'
				: extractedText.toLowerCase().includes('report')
					? 'Report'
					: 'General Document',
		confidentiality: extractedText.toLowerCase().includes('confidential')
			? 'Confidential'
			: 'Public',
		hasFinancialData: extractedAmounts.length > 0,
		hasContactInfo: validEmails.length > 0 || extractedPhones.length > 0,
		language: 'English', // Could be enhanced with language detection
	};

	return {
		...request,
		extractionId,
		contentHash,
		timing: {
			requested: requestDate.format('YYYY-MM-DD HH:mm:ss'),
			processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
			processingTime: '2.5 seconds', // Simulated
		},
		extraction: {
			text: extractedText.substring(0, 500) + '...', // Truncated for output
			fullTextLength: extractedText.length,
			wordCount,
			pageCount,
			emails: validEmails,
			phones: extractedPhones,
			amounts: extractedAmounts,
			dates: validDates,
			totalFinancialValue: totalAmount,
		},
		analysis: {
			documentType: structuredData.documentType,
			confidentiality: structuredData.confidentiality,
			hasFinancialData: structuredData.hasFinancialData,
			hasContactInfo: structuredData.hasContactInfo,
			dataQuality: {
				emailCount: validEmails.length,
				phoneCount: extractedPhones.length,
				financialItemsCount: extractedAmounts.length,
				dateCount: validDates.length,
			},
		},
	};
});

// 2. Extraction analytics
const extractionAnalytics = {
	totalDocuments: processedExtractions.length,
	totalPages: _.sumBy(processedExtractions, 'extraction.pageCount'),
	totalWords: _.sumBy(processedExtractions, 'extraction.wordCount'),
	totalEmails: _.sumBy(processedExtractions, 'extraction.emails.length'),
	totalPhones: _.sumBy(processedExtractions, 'extraction.phones.length'),
	totalFinancialValue: _.sumBy(processedExtractions, 'extraction.totalFinancialValue'),
	documentTypes: _.countBy(processedExtractions, 'analysis.documentType'),
	confidentialDocs: processedExtractions.filter(
		(e) => e.analysis.confidentiality === 'Confidential',
	).length,
	docsWithFinancialData: processedExtractions.filter((e) => e.analysis.hasFinancialData).length,
	avgWordsPerDoc: _.meanBy(processedExtractions, 'extraction.wordCount'),
};

// 3. Create comprehensive PDF extraction Excel report
const pdfWorkbook = XLSX.utils.book_new();

// Extraction results sheet
const extractionSheet = XLSX.utils.json_to_sheet(
	processedExtractions.map((e) => ({
		'Extraction ID': e.extractionId,
		'Source File': e.fileName,
		'Document Type': e.analysis.documentType,
		'Word Count': e.extraction.wordCount,
		'Page Count': e.extraction.pageCount,
		'Emails Found': e.extraction.emails.length,
		'Phones Found': e.extraction.phones.length,
		'Financial Items': e.extraction.amounts.length,
		'Total Value':
			e.extraction.totalFinancialValue > 0
				? '$' + e.extraction.totalFinancialValue.toLocaleString()
				: 'N/A',
		Confidentiality: e.analysis.confidentiality,
		'Processed At': e.timing.processedAt,
	})),
);
XLSX.utils.book_append_sheet(pdfWorkbook, extractionSheet, 'PDF Extractions');

// Extracted contacts sheet (if any emails/phones found)
const allContacts = _.flatten(
	processedExtractions.map((e) =>
		e.extraction.emails
			.map((email) => ({ email, source: e.fileName, type: 'email' }))
			.concat(e.extraction.phones.map((phone) => ({ phone, source: e.fileName, type: 'phone' }))),
	),
);

if (allContacts.length > 0) {
	const contactsSheet = XLSX.utils.json_to_sheet(allContacts);
	XLSX.utils.book_append_sheet(pdfWorkbook, contactsSheet, 'Extracted Contacts');
}

const pdfBuffer = XLSX.write(pdfWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '📄 PDF Data Extraction Complete!',
		totalDocuments: extractionAnalytics.totalDocuments,
		totalPages: extractionAnalytics.totalPages,
		emailsExtracted: extractionAnalytics.totalEmails,
		financialValue: '$' + extractionAnalytics.totalFinancialValue.toLocaleString(),
	},
	extractions: processedExtractions,
	analytics: extractionAnalytics,
	insights: {
		documentTypeBreakdown: extractionAnalytics.documentTypes,
		avgWordsPerPage: Math.round(
			extractionAnalytics.avgWordsPerDoc /
				(extractionAnalytics.totalPages / extractionAnalytics.totalDocuments),
		),
		dataRichness:
			Math.round(
				((extractionAnalytics.totalEmails + extractionAnalytics.totalPhones) /
					extractionAnalytics.totalDocuments) *
					100,
			) /
				100 +
			' contacts per doc',
	},
	reports: {
		excel: pdfBuffer.toString('base64'),
		size: Math.round(pdfBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'lodash', 'XLSX'],
	extractedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
