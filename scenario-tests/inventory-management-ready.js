// Inventory Management & Supply Chain
// READY TO COPY INTO SUPERCODE NODE IN N8N
// Use Set node with inventory and salesData JSON structure

const data = $input.first().json;
const inventory = data.inventory;
const sales = data.salesData;

// 1. Process inventory with business logic
const processedInventory = inventory.map((item) => {
	// Calculate stock levels and alerts
	const stockLevel = item.currentStock;
	const stockPercent = (stockLevel / item.maxStock) * 100;
	const needsRestock = stockLevel <= item.minStock;
	const isOverstocked = stockLevel >= item.maxStock * 0.9;

	// Calculate profitability
	const profitMargin = ((item.salePrice - item.unitCost) / item.salePrice) * 100;
	const inventoryValue = stockLevel * item.unitCost;
	const potentialRevenue = stockLevel * item.salePrice;

	// Process dates with dayjs
	const lastRestocked = dayjs(item.lastRestocked);
	const daysSinceRestock = dayjs().diff(lastRestocked, 'day');
	const isStaleInventory = daysSinceRestock > 90;

	// Generate product hash and tracking ID
	const productHash = CryptoJS.SHA256(item.sku + item.name)
		.toString()
		.substring(0, 10);
	const trackingId = 'TRK-' + uuid.v4();

	// Calculate reorder point using basic formula
	const averageDailySales = 2; // Simplified - would come from historical data
	const leadTimeDays = 14;
	const reorderPoint = averageDailySales * leadTimeDays + item.minStock;
	const suggestedOrderQty = Math.max(0, item.maxStock - stockLevel);

	return {
		...item,
		trackingId,
		productHash,
		stockAnalysis: {
			level: stockLevel,
			percent: Math.round(stockPercent),
			needsRestock,
			isOverstocked,
			isStale: isStaleInventory,
			status: needsRestock ? 'LOW' : isOverstocked ? 'HIGH' : 'NORMAL',
		},
		financial: {
			profitMargin: Math.round(profitMargin),
			profitPerUnit: Math.round((item.salePrice - item.unitCost) * 100) / 100,
			inventoryValue: Math.round(inventoryValue),
			potentialRevenue: Math.round(potentialRevenue),
			inventoryValueFormatted: '$' + inventoryValue.toLocaleString(),
			potentialRevenueFormatted: '$' + potentialRevenue.toLocaleString(),
		},
		restocking: {
			lastRestocked: lastRestocked.format('YYYY-MM-DD'),
			daysSinceRestock,
			reorderPoint,
			suggestedOrderQty,
			shouldReorder: stockLevel <= reorderPoint,
		},
	};
});

// 2. Process sales data and match with inventory
const salesAnalysis = sales.map((sale) => {
	const inventoryItem = processedInventory.find((item) => item.sku === sale.sku);
	const saleDate = dayjs(sale.saleDate);
	const revenue = inventoryItem ? sale.quantitySold * inventoryItem.salePrice : 0;
	const profit = inventoryItem
		? sale.quantitySold * (inventoryItem.salePrice - inventoryItem.unitCost)
		: 0;

	return {
		...sale,
		saleId: 'SALE-' + uuid.v4(),
		saleDate: saleDate.format('YYYY-MM-DD'),
		productName: inventoryItem ? inventoryItem.name : 'Unknown Product',
		revenue: Math.round(revenue),
		profit: Math.round(profit),
		revenueFormatted: '$' + revenue.toLocaleString(),
		profitFormatted: '$' + profit.toLocaleString(),
		daysAgo: dayjs().diff(saleDate, 'day'),
	};
});

// 3. Advanced inventory analytics with lodash
const inventoryAnalytics = {
	overview: {
		totalItems: processedInventory.length,
		totalValue: _.sumBy(processedInventory, 'financial.inventoryValue'),
		totalPotentialRevenue: _.sumBy(processedInventory, 'financial.potentialRevenue'),
		averageProfitMargin: _.meanBy(processedInventory, 'financial.profitMargin'),
	},
	stockStatus: {
		lowStock: processedInventory.filter((i) => i.stockAnalysis.needsRestock).length,
		overStock: processedInventory.filter((i) => i.stockAnalysis.isOverstocked).length,
		normalStock: processedInventory.filter((i) => i.stockAnalysis.status === 'NORMAL').length,
		staleInventory: processedInventory.filter((i) => i.stockAnalysis.isStale).length,
	},
	categories: _.groupBy(processedInventory, 'category'),
	reorderNeeded: processedInventory.filter((i) => i.restocking.shouldReorder),
	sales: {
		totalSales: _.sumBy(salesAnalysis, 'quantitySold'),
		totalRevenue: _.sumBy(salesAnalysis, 'revenue'),
		totalProfit: _.sumBy(salesAnalysis, 'profit'),
		averageSaleValue: _.meanBy(salesAnalysis, 'revenue'),
	},
};

return {
	summary: {
		message: '📦 Inventory Management Complete!',
		totalItems: inventoryAnalytics.overview.totalItems,
		lowStockItems: inventoryAnalytics.stockStatus.lowStock,
		totalValue: '$' + inventoryAnalytics.overview.totalValue.toLocaleString(),
		reorderNeeded: inventoryAnalytics.reorderNeeded.length,
	},
	inventory: processedInventory,
	sales: salesAnalysis,
	analytics: inventoryAnalytics,
	alerts: {
		lowStock: processedInventory.filter((i) => i.stockAnalysis.needsRestock).map((i) => i.sku),
		reorderNeeded: inventoryAnalytics.reorderNeeded.map((i) => ({
			sku: i.sku,
			qty: i.restocking.suggestedOrderQty,
		})),
		staleItems: processedInventory.filter((i) => i.stockAnalysis.isStale).map((i) => i.sku),
	},
	librariesUsed: ['dayjs', 'CryptoJS', 'uuid', 'lodash'],
	managedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
