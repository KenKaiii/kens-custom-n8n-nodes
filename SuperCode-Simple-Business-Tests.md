# SuperCode Simple Business Tests

Reliable business scenarios with proven library combinations.

## Test 1: Customer Data Processing (5 libraries)

**Set Node JSON:**

```json
{
	"customers": [
		{
			"name": "John Doe",
			"email": "john@company.com",
			"phone": "+1-555-0123",
			"joinDate": "2023-01-15",
			"spending": 1250.5
		},
		{
			"name": "Jane Smith",
			"email": "jane@company.com",
			"phone": "+44-20-7946-0958",
			"joinDate": "2023-06-22",
			"spending": 750.25
		}
	]
}
```

**SuperCode JavaScript:**

```javascript
const data = $input.first().json;
const customers = data.customers;

// Validate with joi
const customerSchema = joi.object({
	name: joi.string().min(2).required(),
	email: joi.string().email().required(),
	phone: joi.string().required(),
	joinDate: joi.string().isoDate().required(),
	spending: joi.number().positive().required(),
});

// Process customers
const processedCustomers = customers.map((customer) => {
	const validation = customerSchema.validate(customer);
	const emailValid = validator.isEmail(customer.email);
	const joinDate = dayjs(customer.joinDate);
	const customerHash = CryptoJS.SHA256(customer.email).toString().substring(0, 8);
	const customerId = uuid.v4();

	return {
		...customer,
		customerId,
		customerHash,
		emailValid,
		isValid: !validation.error,
		daysSinceJoin: dayjs().diff(joinDate, 'day'),
		spendingFormatted: currency(customer.spending).format(),
		joinDateFormatted: joinDate.format('MMM DD, YYYY'),
	};
});

// Analytics with lodash
const analytics = {
	total: processedCustomers.length,
	validEmails: processedCustomers.filter((c) => c.emailValid).length,
	totalSpending: _.sumBy(processedCustomers, 'spending'),
	avgSpending: _.meanBy(processedCustomers, 'spending'),
	recentCustomers: processedCustomers.filter((c) => c.daysSinceJoin <= 30).length,
};

return {
	summary: {
		message: '👥 Customer Processing Complete!',
		customers: analytics.total,
		validEmails: analytics.validEmails + '/' + analytics.total,
		totalRevenue: currency(analytics.totalSpending).format(),
	},
	customers: processedCustomers,
	analytics,
	librariesUsed: ['joi', 'validator', 'dayjs', 'CryptoJS', 'currency', 'lodash', 'uuid'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
```

---

## Test 2: Order Processing (4 libraries)

**Set Node JSON:**

```json
{
	"orders": [
		{
			"orderId": "ORD-001",
			"customerEmail": "test@example.com",
			"items": [{ "name": "Laptop", "price": 999, "qty": 1 }],
			"orderDate": "2024-01-15T10:30:00Z"
		},
		{
			"orderId": "ORD-002",
			"customerEmail": "user@example.com",
			"items": [{ "name": "Mouse", "price": 49, "qty": 2 }],
			"orderDate": "2024-01-16T14:20:00Z"
		}
	]
}
```

**SuperCode JavaScript:**

```javascript
const data = $input.first().json;
const orders = data.orders;

// Process orders
const processedOrders = orders.map((order) => {
	const emailValid = validator.isEmail(order.customerEmail);
	const orderDate = dayjs(order.orderDate);
	const total = _.sumBy(order.items, (item) => item.price * item.qty);
	const trackingId = uuid.v4();

	return {
		...order,
		trackingId,
		emailValid,
		total,
		totalFormatted: currency(total).format(),
		orderDate: orderDate.format('YYYY-MM-DD HH:mm'),
		itemCount: order.items.length,
	};
});

// Generate QR codes
const ordersWithQR = await Promise.all(
	processedOrders.map(async (order) => {
		const qrData = 'ORDER:' + order.orderId + '|TOTAL:' + order.total;
		const qrCode = await QRCode.toDataURL(qrData);
		return { ...order, qrCode };
	}),
);

return {
	summary: {
		message: '📦 Order Processing Complete!',
		totalOrders: ordersWithQR.length,
		totalValue: currency(_.sumBy(ordersWithQR, 'total')).format(),
		validEmails: ordersWithQR.filter((o) => o.emailValid).length,
	},
	orders: ordersWithQR,
	librariesUsed: ['validator', 'dayjs', 'lodash', 'currency', 'uuid', 'QRCode'],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
```

---

## Test 3: Data Validation Suite (4 libraries)

**Set Node JSON:**

```json
{
	"testData": {
		"emails": ["valid@example.com", "invalid-email", "test@domain.co.uk"],
		"urls": ["https://google.com", "not-a-url", "http://example.com"],
		"passwords": ["password123", "complexPass!@#"],
		"amounts": [100.5, 25.99, 1500.0]
	}
}
```

**SuperCode JavaScript:**

```javascript
const data = $input.first().json.testData;

// Test emails with validator and joi
const emailResults = data.emails.map((email) => {
	const validatorResult = validator.isEmail(email);
	const joiResult = joi.string().email().validate(email);
	const hash = CryptoJS.SHA256(email).toString().substring(0, 8);

	return {
		email,
		validatorValid: validatorResult,
		joiValid: !joiResult.error,
		hash,
		testId: uuid.v4(),
	};
});

// Test URLs
const urlResults = data.urls.map((url) => {
	const isValid = validator.isURL(url);
	const domain = isValid ? url.split('/')[2] : null;

	return {
		url,
		isValid,
		domain,
		testId: uuid.v4(),
	};
});

// Test password strength
const passwordResults = data.passwords.map((password) => {
	const length = password.length;
	const hasNumbers = /\d/.test(password);
	const hasSpecialChars = /[!@#$%^&*]/.test(password);
	const hash = CryptoJS.SHA256(password).toString();

	return {
		length,
		hasNumbers,
		hasSpecialChars,
		strength: length >= 8 && hasNumbers && hasSpecialChars ? 'Strong' : 'Weak',
		hash: hash.substring(0, 16) + '...',
		testId: uuid.v4(),
	};
});

// Process amounts with currency
const amountResults = data.amounts.map((amount) => ({
	original: amount,
	formatted: currency(amount).format(),
	rounded: Math.round(amount),
	testId: uuid.v4(),
}));

// Summary with lodash
const summary = {
	emails: {
		total: emailResults.length,
		valid: emailResults.filter((e) => e.validatorValid).length,
	},
	urls: {
		total: urlResults.length,
		valid: urlResults.filter((u) => u.isValid).length,
	},
	passwords: {
		total: passwordResults.length,
		strong: passwordResults.filter((p) => p.strength === 'Strong').length,
	},
	amounts: {
		total: amountResults.length,
		sum: currency(_.sumBy(data.amounts)).format(),
	},
};

return {
	summary: {
		message: '✅ Data Validation Complete!',
		totalTests:
			emailResults.length + urlResults.length + passwordResults.length + amountResults.length,
		validEmails: summary.emails.valid + '/' + summary.emails.total,
		validUrls: summary.urls.valid + '/' + summary.urls.total,
		strongPasswords: summary.passwords.strong + '/' + summary.passwords.total,
	},
	results: {
		emails: emailResults,
		urls: urlResults,
		passwords: passwordResults,
		amounts: amountResults,
	},
	summary,
	librariesUsed: ['validator', 'joi', 'CryptoJS', 'uuid', 'currency', 'lodash'],
	testedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
```

---

## Test 4: Document Processing (5 libraries)

**Set Node JSON:**

```json
{
	"documents": {
		"csv": "name,department,salary\nJohn,Engineering,75000\nJane,Marketing,65000",
		"xml": "<employees><employee><name>Bob</name><role>Manager</role></employee></employees>",
		"yaml": "config:\n  database:\n    host: localhost\n    port: 5432\n  features:\n    - analytics\n    - reporting",
		"html": "<div><h1>Report</h1><p>Sales data for <strong>Q1 2024</strong></p><a href='https://company.com'>Details</a></div>"
	}
}
```

**SuperCode JavaScript:**

```javascript
const data = $input.first().json.documents;

// Parse CSV with papaparse
const csvParsed = Papa.parse(data.csv, { header: true });
const csvData = csvParsed.data.map((row) => ({
	...row,
	salary: parseFloat(row.salary),
	salaryFormatted: currency(parseFloat(row.salary)).format(),
	employeeId: uuid.v4(),
}));

// Parse XML with xml2js
const xmlParser = new xml2js.Parser();
const xmlParsed = await xmlParser.parseStringPromise(data.xml);
const xmlData = xmlParsed.employees.employee.map((emp) => ({
	name: emp.name[0],
	role: emp.role[0],
	employeeId: uuid.v4(),
}));

// Parse YAML
const yamlData = YAML.parse(data.yaml);
const configSummary = {
	database: yamlData.config.database,
	features: yamlData.config.features,
	featureCount: yamlData.config.features.length,
};

// Parse HTML with cheerio
const $ = cheerio.load(data.html);
const htmlData = {
	title: $('h1').text(),
	content: $('p').text(),
	strongText: $('strong').text(),
	links: $('a')
		.map((i, el) => ({
			text: $(el).text(),
			href: $(el).attr('href'),
			isValid: validator.isURL($(el).attr('href') || ''),
		}))
		.get(),
};

// Combine all data with lodash
const allEmployees = [...csvData, ...xmlData];
const analytics = {
	totalEmployees: allEmployees.length,
	csvEmployees: csvData.length,
	xmlEmployees: xmlData.length,
	averageSalary: csvData.length > 0 ? _.meanBy(csvData, 'salary') : 0,
	departments: _.countBy(csvData, 'department'),
	configFeatures: configSummary.featureCount,
	validLinks: htmlData.links.filter((l) => l.isValid).length,
};

return {
	summary: {
		message: '📄 Document Processing Complete!',
		totalEmployees: analytics.totalEmployees,
		dataSources: 'CSV + XML + YAML + HTML',
		avgSalary: currency(analytics.averageSalary).format(),
	},
	data: {
		csv: csvData,
		xml: xmlData,
		yaml: configSummary,
		html: htmlData,
	},
	analytics,
	librariesUsed: [
		'papaparse',
		'xml2js',
		'YAML',
		'cheerio',
		'validator',
		'currency',
		'lodash',
		'uuid',
	],
	processedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
```

---

## Test 5: Security & Encryption (4 libraries)

**Set Node JSON:**

```json
{
	"securityData": {
		"users": [
			{
				"username": "admin",
				"password": "admin123",
				"email": "admin@company.com",
				"role": "administrator"
			},
			{
				"username": "user1",
				"password": "userpass456",
				"email": "user1@company.com",
				"role": "user"
			}
		],
		"sensitiveData": {
			"apiKey": "sk_live_abc123def456",
			"dbConnection": "postgresql://user:pass@localhost:5432/db",
			"secretMessage": "This is confidential information"
		}
	}
}
```

**SuperCode JavaScript:**

```javascript
const data = $input.first().json.securityData;
const users = data.users;
const sensitive = data.sensitiveData;

// Process users with security
const secureUsers = users.map((user) => {
	// Validate email
	const emailValid = validator.isEmail(user.email);

	// Hash password with bcrypt
	const passwordHash = bcrypt.hashSync(user.password, 10);

	// Generate session token with CryptoJS
	const sessionData = {
		username: user.username,
		role: user.role,
		loginTime: dayjs().format(),
	};
	const sessionToken = CryptoJS.SHA256(JSON.stringify(sessionData) + uuid.v4()).toString();

	// Create JWT token
	const jwtToken = jwt.sign(
		{
			username: user.username,
			role: user.role,
			email: user.email,
		},
		'jwt-secret-key',
		{ expiresIn: '24h' },
	);

	return {
		userId: uuid.v4(),
		username: user.username,
		email: user.email,
		emailValid,
		role: user.role,
		passwordHash,
		sessionToken: sessionToken.substring(0, 16) + '...',
		jwtToken: jwtToken.substring(0, 20) + '...',
		createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
	};
});

// Encrypt sensitive data
const encryptedData = {
	apiKey: CryptoJS.AES.encrypt(sensitive.apiKey, 'encryption-key').toString(),
	dbConnection: CryptoJS.AES.encrypt(sensitive.dbConnection, 'encryption-key').toString(),
	secretMessage: CryptoJS.AES.encrypt(sensitive.secretMessage, 'encryption-key').toString(),
};

// Create master security report
const securityReport = {
	reportId: uuid.v4(),
	timestamp: dayjs().format(),
	userCount: secureUsers.length,
	encryptedItemsCount: Object.keys(encryptedData).length,
	securityLevel: 'HIGH',
};

const reportSignature = CryptoJS.HmacSHA256(
	JSON.stringify(securityReport),
	'master-key',
).toString();

return {
	summary: {
		message: '🔒 Security Processing Complete!',
		usersProcessed: secureUsers.length,
		encryptedItems: Object.keys(encryptedData).length,
		securityLevel: 'HIGH',
	},
	users: secureUsers,
	encryptedData,
	securityReport: {
		...securityReport,
		signature: reportSignature.substring(0, 16) + '...',
	},
	librariesUsed: ['validator', 'bcrypt', 'CryptoJS', 'jwt', 'dayjs', 'uuid'],
	securedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};
```

## Running These Tests

These simplified tests avoid problematic library combinations and focus on:

1. **Proven library combinations** that work reliably
2. **Simple data structures** that won't cause access errors
3. **Clear validation** with proper error handling
4. **Practical business scenarios** your users will encounter

Start with **Test 1** - it's the most comprehensive and reliable test of multiple libraries working together!
