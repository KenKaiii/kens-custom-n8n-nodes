# Release Notes - v1.1.7

## 🚀 New Features

### Added 8 New Libraries (Total: 57+)

#### Language & Text Processing

- **franc-min** - Language detection for filtering content by language (e.g., YouTube titles)
- **compromise** - Natural language processing for text analysis

#### API Reliability

- **p-retry** - Automatic retry logic with exponential backoff for failed API calls
- **p-limit** - Rate limiting to prevent API violations

#### Content Processing

- **html-to-text** - Convert HTML to plain text for web scraping workflows
- **marked** - Markdown to HTML conversion for documentation

#### Data Operations

- **json-diff-ts** - Deep object comparison to track changes
- **cron-parser** - Parse and validate cron expressions

## 🔒 Security Improvements

- **XLSX Security Wrapper**: Now actively implemented in production code
  - Protects against CVE-2021-32014 (Prototype Pollution)
  - Prevents ReDoS attacks
  - Includes comprehensive input validation and sanitization
  - All 12 security tests passing

## 🐛 Bug Fixes

- Fixed ESLint configuration for v9 compatibility
- Resolved Jest haste map collision with dist directory
- Corrected library import patterns for franc and cron-parser

## 📦 Technical Updates

- Updated to Node.js 20+ compatibility
- Bundle size optimized (~9.27MB)
- Added TypeScript support for all new libraries
- Improved webpack configuration

## 📝 Example Usage

```javascript
// Language detection
const language = franc('This is English text'); // Returns 'eng'

// API retry with exponential backoff
await pRetry(
	async () => {
		return await fetchData();
	},
	{ retries: 3 },
);

// Rate limiting
const limit = pLimit(5);
await Promise.all(urls.map((url) => limit(() => fetch(url))));

// HTML to text conversion
const text = htmlToText('<h1>Title</h1><p>Content</p>');
```

## 🙏 Acknowledgments

This release includes security improvements and quality fixes implemented with the help of automated code analysis tools.
