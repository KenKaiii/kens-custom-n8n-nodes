```
 ____  _   _ ____  _____ ____     ____ ___  ____  _____
/ ___|| | | |  _ \| ____|  _ \   / ___/ _ \|  _ \| ____|
\___ \| | | | |_) |  _| | |_) | | |  | | | | | | |  _|
 ___) | |_| |  __/| |___|  _ <  | |__| |_| | |_| | |___
|____/ \___/|_|   |_____|_| \_\  \____\___/|____/|_____|

by Ken Kai
```

# SuperCode for n8n

Look, I got tired of writing the same data transformation logic over and over again in different n8n workflows. So I built this thing.

**What it does:** Gives you JavaScript and Python execution directly in your n8n workflows, with 30+ libraries already loaded. No more "npm install this, pip install that" - it's all there.

**What it's actually useful for:** See below. Real examples from real workflows I've built.

## Install

```bash
npm install @kenkaiii/n8n-nodes-supercode
```

Or just go to Settings > Community Nodes in your n8n and install `@kenkaiii/n8n-nodes-supercode`

### ⚠️ Troubleshooting: "joi is not defined" or Library Loading Errors

If libraries aren't loading after installation, rebuild native dependencies:

```bash
# Navigate to the installed package
cd ~/.n8n/nodes/node_modules/@kenkaiii/n8n-nodes-supercode

# Rebuild native dependencies for your system
npm rebuild

# This fixes bcrypt, sharp, and other native bindings
```

This is required because some libraries (bcrypt, sharp) have native bindings that must be compiled for your specific system architecture (Linux, Mac, Docker, etc.)

## Real World Use Cases (Why You'd Want This)

### 1. E-commerce Order Processing

**The Problem:** You get orders from Shopify/WooCommerce and need to:

- Calculate complex shipping costs based on weight/dimensions
- Apply business rules for discounts
- Format data for your fulfillment system

**Before SuperCode:** Chain together 15+ nodes with Set nodes, IF nodes, math operations, etc.

**With SuperCode:**

```javascript
// One node handles it all
const orders = $input.all();
const processed = orders.map((order) => {
	const items = order.json.line_items;
	const totalWeight = _.sumBy(items, 'weight');
	const shippingCost = calculateShipping(totalWeight, order.json.shipping_address);

	return {
		order_id: order.json.id,
		total_weight: totalWeight,
		shipping_cost: shippingCost,
		fulfillment_priority: totalWeight > 50 ? 'freight' : 'standard',
		formatted_address: formatAddress(order.json.shipping_address),
	};
});

return processed;
```

### 2. Customer Data Enrichment

**The Problem:** You have customer emails and need to:

- Validate email formats
- Extract company domains
- Enrich with additional data
- Score leads based on multiple factors

**With SuperCode:**

```javascript
const customers = $input.all();
const enriched = customers.map((customer) => {
	const email = customer.json.email;
	const domain = email.split('@')[1];
	const isBusinessEmail = !['gmail.com', 'yahoo.com', 'hotmail.com'].includes(domain);

	// Lead scoring logic
	let score = 0;
	if (isBusinessEmail) score += 50;
	if (customer.json.company) score += 30;
	if (customer.json.phone) score += 20;

	return {
		...customer.json,
		domain: domain,
		is_business_email: isBusinessEmail,
		lead_score: score,
		segment: score > 70 ? 'hot' : score > 40 ? 'warm' : 'cold',
	};
});

return enriched;
```

### 3. Financial Report Generation

**The Problem:** You need to pull data from multiple sources (Stripe, QuickBooks, etc.) and create monthly reports with calculations that don't fit into simple n8n math operations.

**With SuperCode:**

```javascript
const transactions = $input.all();
const monthlyReport = {
	total_revenue: _.sumBy(transactions, (t) => t.json.amount),
	transaction_count: transactions.length,
	average_transaction: _.meanBy(transactions, (t) => t.json.amount),
	top_customers: _(transactions)
		.groupBy('json.customer_id')
		.map((txns, customerId) => ({
			customer_id: customerId,
			total_spent: _.sumBy(txns, 'json.amount'),
		}))
		.orderBy(['total_spent'], ['desc'])
		.take(10)
		.value(),
	growth_rate: calculateGrowthRate(transactions),
};

return [{ json: monthlyReport }];
```

### 4. Inventory Management

**The Problem:** You need to sync inventory across multiple platforms and apply business rules for reordering.

**With SuperCode:**

```javascript
const inventory = $input.all();
const updates = inventory.map((item) => {
	const currentStock = item.json.quantity;
	const salesVelocity = item.json.avg_daily_sales;
	const leadTime = item.json.supplier_lead_time;

	// Calculate reorder point using safety stock formula
	const safetyStock = Math.ceil(salesVelocity * leadTime * 1.5);
	const reorderPoint = safetyStock + salesVelocity * leadTime;

	return {
		sku: item.json.sku,
		current_stock: currentStock,
		reorder_point: reorderPoint,
		needs_reorder: currentStock <= reorderPoint,
		suggested_order_qty: currentStock <= reorderPoint ? Math.ceil(salesVelocity * 30) : 0, // 30 days worth
		stock_status: getStockStatus(currentStock, reorderPoint),
	};
});

return updates;
```

### 5. Content Processing & SEO

**The Problem:** You're managing content across multiple platforms and need to optimize titles, extract keywords, and format for different channels.

**With SuperCode:**

```javascript
const articles = $input.all();
const processed = articles.map((article) => {
	const content = article.json.content;
	const title = article.json.title;

	// Extract keywords (simple version)
	const words = content.toLowerCase().split(/\s+/);
	const wordFreq = _.countBy(words.filter((w) => w.length > 4));
	const keywords = _.take(_.orderBy(_.toPairs(wordFreq), 1, 'desc').map(0), 10);

	return {
		id: article.json.id,
		title: title,
		seo_title: title.length > 60 ? title.substring(0, 57) + '...' : title,
		meta_description: content.substring(0, 157) + '...',
		keywords: keywords.join(', '),
		word_count: words.length,
		reading_time: Math.ceil(words.length / 200), // minutes
		twitter_text: truncateForTwitter(title, content),
	};
});

return processed;
```

## What Makes This Different

**Pre-loaded Libraries:** No installation headaches. I've included the stuff you actually use:

- lodash for data manipulation
- dayjs for dates that don't suck
- axios for HTTP requests
- crypto for hashing/encryption
- xlsx for Excel files
- cheerio for HTML parsing
- joi for validation
- And 20+ more

**Two Node Types:**

- **SuperCode Node:** For your regular workflows
- **SuperCode Tool:** Optimized for AI agents (Claude, ChatGPT, etc.)

**Python Support:** Because sometimes JavaScript isn't the right tool:

```python
import pandas as pd
import numpy as np

# Convert n8n data to DataFrame
df = pd.DataFrame([item for item in input_data])

# Do pandas magic
result = df.groupby('category').agg({
    'price': ['mean', 'sum', 'count'],
    'quantity': 'sum'
}).round(2)

return result.to_dict()
```

## Performance & Safety

- **VM Sandboxed:** Your code runs safely isolated
- **Lazy Loading:** Libraries only load when you use them
- **Memory Efficient:** Built-in monitoring and cleanup
- **Error Handling:** Doesn't crash your workflows when code fails

## Common Patterns

**Data Validation:**

```javascript
const validItems = $input.all().filter((item) => {
	const data = item.json;
	return (
		joi
			.object({
				email: joi.string().email().required(),
				age: joi.number().min(18).max(120),
				phone: joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
			})
			.validate(data).error === undefined
	);
});
```

**Batch Processing:**

```javascript
const items = $input.all();
const chunks = _.chunk(items, 100); // Process in batches of 100

return chunks.map((chunk) => ({
	json: {
		batch_size: chunk.length,
		processed_at: dayjs().toISOString(),
		results: chunk.map(processItem),
	},
}));
```

**File Processing:**

```javascript
// Parse CSV data
const csvData = $input.first().json.file_content;
const parsed = papa.parse(csvData, { header: true });

return parsed.data.map((row) => ({ json: row }));
```

## When NOT to Use This

- Simple transformations (use regular n8n nodes)
- If you don't know JavaScript/Python
- When you need real-time performance (this adds some overhead)
- For workflows that barely process any data

## AI Agent Integration

If you're using Claude, ChatGPT, or other AI agents with n8n, the SuperCode Tool node lets them write and execute code directly in your workflows. Pretty neat for dynamic data processing.

## Support

Built this for myself, sharing it because others might find it useful. If you find bugs, let me know. If you want features, fork it and build them.

MIT License - do whatever you want with it.

Ken Kai  
ken@kenkais.com

---

_P.S. - Yeah, I could have built separate nodes for each use case, but where's the fun in that? Sometimes you just want to write some damn code and get on with your day._
