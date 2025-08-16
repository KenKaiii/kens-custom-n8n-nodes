// Cryptocurrency Portfolio Tracker & DeFi Analytics
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with portfolio JSON structure

const data = $input.first().json;
const portfolio = data.portfolio;
const transactions = data.transactions;

// 1. Process cryptocurrency portfolio
const processedPortfolio = portfolio.map((holding) => {
	const holdingId = 'HOLD-' + uuid.v4();
	const purchaseDate = dayjs(holding.purchaseDate);
	const daysHeld = dayjs().diff(purchaseDate, 'day');

	// Calculate portfolio metrics
	const currentValue = holding.quantity * holding.currentPrice;
	const totalCost = holding.quantity * holding.purchasePrice;
	const gainLoss = currentValue - totalCost;
	const gainLossPercent = (gainLoss / totalCost) * 100;

	// Generate wallet hash for security
	const walletHash = CryptoJS.SHA256(holding.walletAddress).toString().substring(0, 12);

	// Determine holding performance
	const performance =
		gainLossPercent > 20
			? 'Excellent'
			: gainLossPercent > 0
				? 'Profitable'
				: gainLossPercent > -10
					? 'Stable'
					: 'Loss';

	return {
		...holding,
		holdingId,
		walletHash,
		metrics: {
			currentValue: Math.round(currentValue * 100) / 100,
			totalCost: Math.round(totalCost * 100) / 100,
			gainLoss: Math.round(gainLoss * 100) / 100,
			gainLossPercent: Math.round(gainLossPercent * 100) / 100,
			performance,
			daysHeld,
		},
		formatting: {
			currentValueFormatted: '$' + currentValue.toLocaleString(),
			totalCostFormatted: '$' + totalCost.toLocaleString(),
			gainLossFormatted: (gainLoss >= 0 ? '+$' : '-$') + Math.abs(gainLoss).toLocaleString(),
			purchaseDate: purchaseDate.format('YYYY-MM-DD'),
		},
	};
});

// 2. Process transaction history
const processedTransactions = transactions.map((tx) => {
	const txId = 'TX-' + uuid.v4();
	const txDate = dayjs(tx.timestamp);
	const txHash = CryptoJS.SHA256(tx.hash).toString().substring(0, 16);
	const valueUSD = tx.amount * tx.priceUSD;

	return {
		...tx,
		txId,
		txHash,
		timestamp: txDate.format('YYYY-MM-DD HH:mm:ss'),
		daysAgo: dayjs().diff(txDate, 'day'),
		valueUSD: Math.round(valueUSD * 100) / 100,
		valueUSDFormatted: '$' + valueUSD.toLocaleString(),
	};
});

// 3. Portfolio analytics with lodash
const portfolioAnalytics = {
	totalValue: _.sumBy(processedPortfolio, 'metrics.currentValue'),
	totalCost: _.sumBy(processedPortfolio, 'metrics.totalCost'),
	totalGainLoss: _.sumBy(processedPortfolio, 'metrics.gainLoss'),
	avgGainLossPercent: _.meanBy(processedPortfolio, 'metrics.gainLossPercent'),
	topPerformers: _.orderBy(processedPortfolio, 'metrics.gainLossPercent', 'desc').slice(0, 3),
	worstPerformers: _.orderBy(processedPortfolio, 'metrics.gainLossPercent', 'asc').slice(0, 3),
	cryptoBreakdown: _.groupBy(processedPortfolio, 'symbol'),
	performanceBreakdown: _.countBy(processedPortfolio, 'metrics.performance'),
	avgHoldingPeriod: _.meanBy(processedPortfolio, 'metrics.daysHeld'),
};

portfolioAnalytics.totalGainLossPercent =
	portfolioAnalytics.totalCost > 0
		? (portfolioAnalytics.totalGainLoss / portfolioAnalytics.totalCost) * 100
		: 0;

// 4. Generate portfolio QR codes for wallet tracking
const portfolioWithQR = await Promise.all(
	processedPortfolio.map(async (holding) => {
		const walletData = JSON.stringify({
			holdingId: holding.holdingId,
			symbol: holding.symbol,
			walletHash: holding.walletHash,
			value: holding.formatting.currentValueFormatted,
		});

		const qrCode = await QRCode.toDataURL(walletData, {
			width: 150,
			margin: 2,
			color: { dark: '#F7931A', light: '#FFFFFF' }, // Bitcoin orange
		});

		return { ...holding, walletQR: qrCode };
	}),
);

// 5. Create comprehensive crypto Excel report
const cryptoWorkbook = XLSX.utils.book_new();

// Portfolio sheet
const portfolioSheet = XLSX.utils.json_to_sheet(
	portfolioWithQR.map((h) => ({
		'Holding ID': h.holdingId,
		Symbol: h.symbol,
		Name: h.name,
		Quantity: h.quantity,
		'Purchase Price': '$' + h.purchasePrice,
		'Current Price': '$' + h.currentPrice,
		'Current Value': h.formatting.currentValueFormatted,
		'Gain/Loss': h.formatting.gainLossFormatted,
		'Gain/Loss %': h.metrics.gainLossPercent + '%',
		Performance: h.metrics.performance,
		'Days Held': h.metrics.daysHeld,
		'Purchase Date': h.formatting.purchaseDate,
	})),
);
XLSX.utils.book_append_sheet(cryptoWorkbook, portfolioSheet, 'Portfolio');

// Transactions sheet
const transactionsSheet = XLSX.utils.json_to_sheet(
	processedTransactions.slice(0, 100).map((t) => ({
		// Limit for Excel
		'TX ID': t.txId,
		Symbol: t.symbol,
		Type: t.type,
		Amount: t.amount,
		'Price USD': '$' + t.priceUSD,
		'Value USD': t.valueUSDFormatted,
		Timestamp: t.timestamp,
		'Days Ago': t.daysAgo,
	})),
);
XLSX.utils.book_append_sheet(cryptoWorkbook, transactionsSheet, 'Transactions');

const cryptoBuffer = XLSX.write(cryptoWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '₿ Crypto Portfolio Tracker Complete!',
		totalValue: '$' + portfolioAnalytics.totalValue.toLocaleString(),
		totalGainLoss:
			(portfolioAnalytics.totalGainLoss >= 0 ? '+$' : '-$') +
			Math.abs(portfolioAnalytics.totalGainLoss).toLocaleString(),
		gainLossPercent: Math.round(portfolioAnalytics.totalGainLossPercent) + '%',
		topPerformer: portfolioAnalytics.topPerformers[0]?.symbol || 'N/A',
	},
	portfolio: portfolioWithQR,
	transactions: processedTransactions.slice(0, 50),
	analytics: portfolioAnalytics,
	insights: {
		diversification:
			Object.keys(portfolioAnalytics.cryptoBreakdown).length + ' different cryptocurrencies',
		riskLevel:
			portfolioAnalytics.avgGainLossPercent > 50
				? 'High Risk/High Reward'
				: portfolioAnalytics.avgGainLossPercent > 0
					? 'Moderate Risk'
					: 'Conservative',
		holdingStrategy:
			portfolioAnalytics.avgHoldingPeriod > 365 ? 'Long-term HODL' : 'Active Trading',
	},
	reports: {
		excel: cryptoBuffer.toString('base64'),
		size: Math.round(cryptoBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['dayjs', 'CryptoJS', 'uuid', 'lodash', 'QRCode', 'XLSX'],
	trackedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
