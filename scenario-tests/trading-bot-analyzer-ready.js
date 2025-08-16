// Advanced Trading Bot & Financial Analytics Engine
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with tradingData JSON structure

const data = $input.first().json;
const trades = data.trades;
const marketData = data.marketData;

// 1. Advanced trading analysis with risk management
const analyzedTrades = trades.map((trade) => {
	const tradeId = 'TRADE-' + uuid.v4();
	const tradeDate = dayjs(trade.timestamp);
	const hoursAgo = dayjs().diff(tradeDate, 'hour');

	// Calculate sophisticated trading metrics
	const capitalRisk = (trade.amount / trade.portfolioValue) * 100;
	const priceChange = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
	const profitLoss = trade.amount * (priceChange / 100);
	const roi = (profitLoss / trade.amount) * 100;

	// Risk analysis using advanced formulas
	const volatility =
		Math.abs(priceChange) > 5 ? 'High' : Math.abs(priceChange) > 2 ? 'Medium' : 'Low';
	const sharpeRatio = roi / Math.max(1, Math.abs(priceChange)); // Simplified Sharpe ratio
	const maxDrawdown = trade.maxDrawdown || Math.abs(Math.min(0, priceChange));

	// Technical analysis simulation
	const rsi = 50 + Math.random() * 40 - 20; // Simulated RSI (30-70 range)
	const macd = Math.random() * 2 - 1; // Simulated MACD (-1 to 1)
	const bollingerPosition = Math.random(); // Position within Bollinger Bands (0-1)

	// Generate trading signals
	let signal = 'HOLD';
	if (rsi > 70 && macd < 0) signal = 'SELL';
	else if (rsi < 30 && macd > 0) signal = 'BUY';
	else if (bollingerPosition > 0.8) signal = 'OVERBOUGHT';
	else if (bollingerPosition < 0.2) signal = 'OVERSOLD';

	// Create secure trade hash
	const tradeHash = CryptoJS.SHA256(
		trade.symbol + trade.timestamp + trade.amount + trade.entryPrice,
	)
		.toString()
		.substring(0, 16);

	// Calculate position sizing recommendation
	const kellyPercentage = Math.max(0, Math.min(25, roi * 0.6 - Math.abs(priceChange) * 0.4));

	return {
		...trade,
		tradeId,
		tradeHash,
		timing: {
			timestamp: tradeDate.format('YYYY-MM-DD HH:mm:ss'),
			hoursAgo,
			marketSession: tradeDate.hour() >= 9 && tradeDate.hour() <= 16 ? 'Regular' : 'Extended',
		},
		performance: {
			priceChange: Math.round(priceChange * 100) / 100,
			profitLoss: Math.round(profitLoss * 100) / 100,
			roi: Math.round(roi * 100) / 100,
			roiFormatted: (roi >= 0 ? '+' : '') + roi.toFixed(2) + '%',
			profitLossFormatted: (profitLoss >= 0 ? '+$' : '-$') + Math.abs(profitLoss).toLocaleString(),
		},
		riskMetrics: {
			capitalRisk: Math.round(capitalRisk * 100) / 100,
			volatility,
			sharpeRatio: Math.round(sharpeRatio * 100) / 100,
			maxDrawdown: Math.round(maxDrawdown * 100) / 100,
			riskGrade: capitalRisk > 10 ? 'High Risk' : capitalRisk > 5 ? 'Medium Risk' : 'Low Risk',
		},
		technicalAnalysis: {
			rsi: Math.round(rsi),
			macd: Math.round(macd * 1000) / 1000,
			bollingerPosition: Math.round(bollingerPosition * 100),
			signal,
			confidence: Math.round(Math.random() * 40) + 60, // 60-100% confidence
		},
		recommendations: {
			signal,
			kellyPercentage: Math.round(kellyPercentage * 100) / 100,
			suggestedAction:
				signal === 'BUY'
					? 'Increase position'
					: signal === 'SELL'
						? 'Reduce position'
						: 'Monitor closely',
			riskAdjustment: kellyPercentage > 10 ? 'Reduce position size' : 'Current size optimal',
		},
	};
});

// 2. Portfolio-wide risk analysis
const portfolioAnalysis = {
	totalTrades: analyzedTrades.length,
	totalCapital: _.sumBy(analyzedTrades, 'amount'),
	totalProfitLoss: _.sumBy(analyzedTrades, 'performance.profitLoss'),
	totalROI: _.meanBy(analyzedTrades, 'performance.roi'),
	winRate:
		(analyzedTrades.filter((t) => t.performance.profitLoss > 0).length / analyzedTrades.length) *
		100,
	avgSharpeRatio: _.meanBy(analyzedTrades, 'riskMetrics.sharpeRatio'),
	maxDrawdown: _.maxBy(analyzedTrades, 'riskMetrics.maxDrawdown')?.riskMetrics.maxDrawdown || 0,
	symbolBreakdown: _.countBy(analyzedTrades, 'symbol'),
	signalBreakdown: _.countBy(analyzedTrades, 'technicalAnalysis.signal'),
	riskBreakdown: _.countBy(analyzedTrades, 'riskMetrics.riskGrade'),
	avgCapitalRisk: _.meanBy(analyzedTrades, 'riskMetrics.capitalRisk'),
};

// 3. Generate trading performance Excel report
const tradingWorkbook = XLSX.utils.book_new();

// Trades sheet
const tradesSheet = XLSX.utils.json_to_sheet(
	analyzedTrades.map((t) => ({
		'Trade ID': t.tradeId,
		Symbol: t.symbol,
		Type: t.type,
		'Entry Price': '$' + t.entryPrice,
		'Exit Price': '$' + (t.exitPrice || 'Pending'),
		Amount: '$' + t.amount.toLocaleString(),
		'P&L': t.performance.profitLossFormatted,
		ROI: t.performance.roiFormatted,
		'Risk Grade': t.riskMetrics.riskGrade,
		RSI: t.technicalAnalysis.rsi,
		Signal: t.technicalAnalysis.signal,
		Confidence: t.technicalAnalysis.confidence + '%',
		Timestamp: t.timing.timestamp,
	})),
);
XLSX.utils.book_append_sheet(tradingWorkbook, tradesSheet, 'Trades');

// Portfolio analysis sheet
const portfolioData = [
	{ Metric: 'Total Trades', Value: portfolioAnalysis.totalTrades },
	{ Metric: 'Total Capital', Value: '$' + portfolioAnalysis.totalCapital.toLocaleString() },
	{
		Metric: 'Total P&L',
		Value:
			(portfolioAnalysis.totalProfitLoss >= 0 ? '+$' : '-$') +
			Math.abs(portfolioAnalysis.totalProfitLoss).toLocaleString(),
	},
	{ Metric: 'Total ROI', Value: Math.round(portfolioAnalysis.totalROI) + '%' },
	{ Metric: 'Win Rate', Value: Math.round(portfolioAnalysis.winRate) + '%' },
	{ Metric: 'Avg Sharpe Ratio', Value: Math.round(portfolioAnalysis.avgSharpeRatio * 100) / 100 },
	{ Metric: 'Max Drawdown', Value: Math.round(portfolioAnalysis.maxDrawdown) + '%' },
	{ Metric: 'Avg Capital Risk', Value: Math.round(portfolioAnalysis.avgCapitalRisk) + '%' },
];
const portfolioSheet = XLSX.utils.json_to_sheet(portfolioData);
XLSX.utils.book_append_sheet(tradingWorkbook, portfolioSheet, 'Portfolio Analysis');

const tradingBuffer = XLSX.write(tradingWorkbook, { type: 'buffer', bookType: 'xlsx' });

return {
	summary: {
		message: '📈 Trading Bot Analyzer Complete!',
		totalTrades: portfolioAnalysis.totalTrades,
		totalROI: Math.round(portfolioAnalysis.totalROI) + '%',
		winRate: Math.round(portfolioAnalysis.winRate) + '%',
		sharpeRatio: Math.round(portfolioAnalysis.avgSharpeRatio * 100) / 100,
	},
	trades: analyzedTrades,
	portfolio: portfolioAnalysis,
	signals: {
		buySignals: analyzedTrades.filter((t) => t.technicalAnalysis.signal === 'BUY').length,
		sellSignals: analyzedTrades.filter((t) => t.technicalAnalysis.signal === 'SELL').length,
		holdSignals: analyzedTrades.filter((t) => t.technicalAnalysis.signal === 'HOLD').length,
		highConfidence: analyzedTrades.filter((t) => t.technicalAnalysis.confidence >= 80).length,
	},
	riskManagement: {
		highRiskTrades: analyzedTrades.filter((t) => t.riskMetrics.riskGrade === 'High Risk').length,
		avgCapitalRisk: Math.round(portfolioAnalysis.avgCapitalRisk) + '%',
		maxDrawdown: Math.round(portfolioAnalysis.maxDrawdown) + '%',
		riskAdjustedReturn:
			Math.round((portfolioAnalysis.totalROI / Math.max(1, portfolioAnalysis.maxDrawdown)) * 100) /
			100,
	},
	reports: {
		excel: tradingBuffer.toString('base64'),
		size: Math.round(tradingBuffer.length / 1024) + ' KB',
	},
	librariesUsed: ['dayjs', 'CryptoJS', 'uuid', 'lodash', 'XLSX'],
	analyzedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
