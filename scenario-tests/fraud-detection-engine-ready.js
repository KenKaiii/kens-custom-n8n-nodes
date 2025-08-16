// Advanced Fraud Detection & Risk Assessment Engine
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with transactions JSON structure

const data = $input.first().json;
const transactions = data.transactions;

// 1. Advanced fraud detection with machine learning-style analysis
const analyzedTransactions = transactions.map((transaction) => {
	const txId = 'FRD-' + uuid.v4();
	const txDate = dayjs(transaction.timestamp);
	const emailValid = validator.isEmail(transaction.customerEmail);

	// Advanced fraud scoring algorithm
	let fraudScore = 0;
	const fraudIndicators = [];

	// Amount-based risk factors
	if (transaction.amount > 10000) {
		fraudScore += 25;
		fraudIndicators.push('High transaction amount');
	} else if (transaction.amount > 5000) {
		fraudScore += 15;
		fraudIndicators.push('Elevated transaction amount');
	}

	// Time-based analysis
	const hour = txDate.hour();
	const isWeekend = txDate.day() === 0 || txDate.day() === 6;
	const isNightTime = hour < 6 || hour > 22;

	if (isNightTime) {
		fraudScore += 20;
		fraudIndicators.push('Unusual transaction time');
	}

	if (isWeekend) {
		fraudScore += 10;
		fraudIndicators.push('Weekend transaction');
	}

	// Geographic and contact validation
	if (!emailValid) {
		fraudScore += 30;
		fraudIndicators.push('Invalid email address');
	}

	// Payment method risk assessment
	const paymentRisk = {
		credit_card: 5,
		bank_transfer: 10,
		crypto: 25,
		wire_transfer: 15,
		paypal: 8,
	};

	const methodRisk = paymentRisk[transaction.paymentMethod] || 20;
	fraudScore += methodRisk;

	if (methodRisk > 15) {
		fraudIndicators.push('High-risk payment method');
	}

	// Velocity analysis (simulate checking recent transactions)
	const recentTransactionCount = Math.floor(Math.random() * 5); // Simulated
	if (recentTransactionCount > 3) {
		fraudScore += 35;
		fraudIndicators.push('High transaction velocity');
	}

	// Device fingerprinting simulation
	const deviceFingerprint = CryptoJS.SHA256(
		transaction.userAgent + transaction.ipAddress + transaction.deviceId,
	)
		.toString()
		.substring(0, 16);

	// IP analysis (basic geo validation)
	const ipValid = validator.isIP(transaction.ipAddress);
	if (!ipValid) {
		fraudScore += 25;
		fraudIndicators.push('Invalid IP address');
	}

	// Generate risk level
	let riskLevel = 'LOW';
	let actionRequired = 'APPROVE';

	if (fraudScore >= 70) {
		riskLevel = 'CRITICAL';
		actionRequired = 'BLOCK';
	} else if (fraudScore >= 50) {
		riskLevel = 'HIGH';
		actionRequired = 'MANUAL_REVIEW';
	} else if (fraudScore >= 30) {
		riskLevel = 'MEDIUM';
		actionRequired = 'ADDITIONAL_VERIFICATION';
	}

	// Create security tokens
	const securityToken = jwt.sign(
		{
			txId,
			fraudScore,
			riskLevel,
			timestamp: txDate.format(),
			deviceFingerprint,
		},
		'fraud-detection-secret',
		{ expiresIn: '24h' },
	);

	return {
		...transaction,
		txId,
		deviceFingerprint,
		emailValid,
		ipValid,
		timing: {
			timestamp: txDate.format('YYYY-MM-DD HH:mm:ss'),
			hour,
			isWeekend,
			isNightTime,
			daysAgo: dayjs().diff(txDate, 'day'),
		},
		fraudAnalysis: {
			score: Math.min(100, fraudScore),
			riskLevel,
			actionRequired,
			indicators: fraudIndicators,
			confidence: Math.min(100, 85 + fraudIndicators.length * 3),
		},
		security: {
			securityToken: securityToken.substring(0, 20) + '...',
			deviceTrusted: fraudScore < 30,
			requiresVerification: actionRequired !== 'APPROVE',
		},
		financial: {
			amount: transaction.amount,
			amountFormatted: '$' + transaction.amount.toLocaleString(),
			paymentMethodRisk: methodRisk,
			estimatedLoss: riskLevel === 'CRITICAL' ? transaction.amount : 0,
		},
	};
});

// 2. Fraud detection analytics
const fraudAnalytics = {
	totalTransactions: analyzedTransactions.length,
	totalValue: _.sumBy(analyzedTransactions, 'amount'),
	riskLevelBreakdown: _.countBy(analyzedTransactions, 'fraudAnalysis.riskLevel'),
	actionBreakdown: _.countBy(analyzedTransactions, 'fraudAnalysis.actionRequired'),
	paymentMethodBreakdown: _.countBy(analyzedTransactions, 'paymentMethod'),
	avgFraudScore: _.meanBy(analyzedTransactions, 'fraudAnalysis.score'),
	blockedTransactions: analyzedTransactions.filter(
		(t) => t.fraudAnalysis.actionRequired === 'BLOCK',
	),
	reviewTransactions: analyzedTransactions.filter(
		(t) => t.fraudAnalysis.actionRequired === 'MANUAL_REVIEW',
	),
	approvedTransactions: analyzedTransactions.filter(
		(t) => t.fraudAnalysis.actionRequired === 'APPROVE',
	),
	potentialLoss: _.sumBy(
		analyzedTransactions.filter((t) => t.fraudAnalysis.riskLevel === 'CRITICAL'),
		'amount',
	),
	savedAmount: _.sumBy(
		analyzedTransactions.filter((t) => t.fraudAnalysis.actionRequired === 'BLOCK'),
		'amount',
	),
};

// 3. Create comprehensive fraud detection Excel report
const fraudWorkbook = XLSX.utils.book_new();

// Transactions analysis sheet
const transactionsSheet = XLSX.utils.json_to_sheet(
	analyzedTransactions.map((t) => ({
		'Transaction ID': t.txId,
		'Customer Email': t.customerEmail,
		'Email Valid': t.emailValid ? 'Yes' : 'No',
		Amount: t.financial.amountFormatted,
		'Payment Method': t.paymentMethod,
		'Fraud Score': t.fraudAnalysis.score,
		'Risk Level': t.fraudAnalysis.riskLevel,
		'Action Required': t.fraudAnalysis.actionRequired,
		'Indicators Count': t.fraudAnalysis.indicators.length,
		Confidence: t.fraudAnalysis.confidence + '%',
		Timestamp: t.timing.timestamp,
		'Night Transaction': t.timing.isNightTime ? 'Yes' : 'No',
		Weekend: t.timing.isWeekend ? 'Yes' : 'No',
	})),
);
XLSX.utils.book_append_sheet(fraudWorkbook, transactionsSheet, 'Fraud Analysis');

// Risk summary sheet
const riskData = [
	{ Metric: 'Total Transactions', Value: fraudAnalytics.totalTransactions },
	{ Metric: 'Total Value', Value: '$' + fraudAnalytics.totalValue.toLocaleString() },
	{ Metric: 'Blocked Transactions', Value: fraudAnalytics.blockedTransactions.length },
	{ Metric: 'Manual Review Required', Value: fraudAnalytics.reviewTransactions.length },
	{ Metric: 'Auto Approved', Value: fraudAnalytics.approvedTransactions.length },
	{ Metric: 'Average Fraud Score', Value: Math.round(fraudAnalytics.avgFraudScore) },
	{ Metric: 'Potential Loss Prevented', Value: '$' + fraudAnalytics.savedAmount.toLocaleString() },
	{
		Metric: 'Detection Rate',
		Value:
			Math.round(
				((fraudAnalytics.blockedTransactions.length + fraudAnalytics.reviewTransactions.length) /
					fraudAnalytics.totalTransactions) *
					100,
			) + '%',
	},
];
const riskSheet = XLSX.utils.json_to_sheet(riskData);
XLSX.utils.book_append_sheet(fraudWorkbook, riskSheet, 'Risk Summary');

const fraudBuffer = XLSX.write(fraudWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '🛡️ Fraud Detection Engine Complete!',
		totalTransactions: fraudAnalytics.totalTransactions,
		blockedTransactions: fraudAnalytics.blockedTransactions.length,
		savedAmount: '$' + fraudAnalytics.savedAmount.toLocaleString(),
		detectionRate:
			Math.round(
				((fraudAnalytics.blockedTransactions.length + fraudAnalytics.reviewTransactions.length) /
					fraudAnalytics.totalTransactions) *
					100,
			) + '%',
	},
	transactions: analyzedTransactions,
	analytics: fraudAnalytics,
	alerts: {
		criticalRisk: analyzedTransactions
			.filter((t) => t.fraudAnalysis.riskLevel === 'CRITICAL')
			.map((t) => t.txId),
		manualReview: analyzedTransactions
			.filter((t) => t.fraudAnalysis.actionRequired === 'MANUAL_REVIEW')
			.map((t) => t.txId),
		suspiciousPatterns: [
			'High-value night transactions: ' +
				analyzedTransactions.filter((t) => t.timing.isNightTime && t.amount > 5000).length,
			'Weekend high-risk payments: ' +
				analyzedTransactions.filter((t) => t.timing.isWeekend && t.paymentMethod === 'crypto')
					.length,
			'Invalid contact info: ' +
				analyzedTransactions.filter((t) => !t.emailValid || !t.ipValid).length,
		],
	},
	reports: {
		excel: fraudBuffer.toString('base64'),
		size: Math.round(fraudBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['validator', 'dayjs', 'CryptoJS', 'uuid', 'jwt', 'lodash', 'XLSX'],
	analyzedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
