# N8N Custom Nodes Educational Template

A comprehensive educational template for creating custom n8n nodes with advanced features.

## Features

### SuperCodeNode
- **34+ JavaScript Libraries**: Execute code with comprehensive library support
- **30+ Python Libraries**: Full Python execution environment
- **VM-Safe Execution**: Secure sandboxed code execution
- **Dual Language Support**: JavaScript and Python in separate editors
- **Syntax Highlighting**: Proper syntax highlighting for both languages
- **Library Documentation**: Built-in library reference and examples

### SuperCodeTool (AI Agent Tool)
- **Same functionality as SuperCodeNode** but designed for AI agents
- **AI Agent Integration**: Available to Claude, ChatGPT, and other AI agents
- **Tool-specific Configuration**: Optimized for AI agent workflows
- **Custom Purple Lightning Icon**: Visual distinction from regular nodes

## Quick Start

### Installation

1. **Build the nodes:**
   ```bash
   npm install
   npm run build
   ```

2. **Start n8n with custom nodes:**
   ```bash
   N8N_CUSTOM_EXTENSIONS=/path/to/dist N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true n8n start
   ```

### Available Libraries

#### JavaScript (34+ Libraries)
- **Data Processing**: lodash, mathjs, dayjs, moment-timezone
- **Validation**: joi, validator, libphonenumber-js
- **Security**: bcrypt, crypto-js, jsonwebtoken, node-forge
- **Web**: axios, cheerio
- **Files**: archiver, pdf-lib, xlsx, sharp, jimp
- **Blockchain**: ethers, web3
- **Database**: knex
- **Search**: fuse.js, natural
- **Banking**: iban, currency.js
- **Parsing**: csv-parse, xml2js, yaml, fast-xml-parser
- **Templates**: handlebars
- **Automation**: puppeteer-core
- **Utilities**: uuid, qrcode

#### Python (30+ Libraries)  
- **Data Science**: pandas, numpy, scipy, matplotlib, seaborn
- **Machine Learning**: scikit-learn, tensorflow, torch
- **Web**: requests, beautifulsoup4, flask, fastapi
- **Database**: sqlite3, psycopg2, sqlalchemy
- **Files**: openpyxl, PyPDF2, pillow
- **Utilities**: python-dateutil, pytz, regex
- **And many more...

## Documentation

Comprehensive guides available in `/docs/`:

- **[Setup Guide](./docs/01-setup-guide.md)** - Environment setup and installation
- **[Node Creation Guide](./docs/02-node-creation-guide.md)** - Creating custom nodes
- **[Testing Guide](./docs/03-testing-guide.md)** - Testing your nodes
- **[Troubleshooting](./docs/04-troubleshooting.md)** - Common issues and solutions
- **[Claude Assistant Guide](./docs/05-claude-assistant-guide.md)** - Working with Claude AI
- **[AI Agent Tools](./docs/06-ai-agent-tools.md)** - Creating tools for AI agents

## Usage Examples

### SuperCodeNode (JavaScript)
```javascript
// Process data with lodash
const _ = require('lodash');
const result = _.groupBy(items, 'category');
return result;
```

### SuperCodeNode (Python)
```python
# Analyze data with pandas
import pandas as pd
df = pd.DataFrame(items)
result = df.groupby('category').sum()
return result.to_dict()
```

### SuperCodeTool (AI Agent)
AI agents can automatically discover and use SuperCodeTool for:
- Data processing and transformation
- Complex calculations and analysis
- File operations and parsing
- Web scraping and API calls
- Machine learning tasks

## Environment Requirements

- **Node.js**: >= 20.18
- **N8N**: Latest version
- **Environment Variables**: 
  - `N8N_CUSTOM_EXTENSIONS=/path/to/dist`
  - `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` (for AI agent tools)

## Development

### Scripts
- `npm run build` - Build all nodes
- `npm run dev` - Watch mode for development
- `npm run lint` - Lint TypeScript files
- `npm run test` - Run tests

### Project Structure
```
├── nodes/                    # Node implementations
│   ├── SuperCodeNode/       # Main SuperCode node
│   ├── SuperCodeTool/       # AI agent tool version
│   ├── DataTransformer/     # Data transformation node
│   ├── QrCodeGenerator/     # QR code generation
│   └── UuidGenerator/       # UUID generation
├── docs/                    # Comprehensive documentation
├── dist/                    # Built output
└── package.json            # Dependencies and scripts
```

## License

MIT - Feel free to use this template for your own n8n node development projects.

## Contributing

This is an educational template. Feel free to extend it with your own custom nodes and improvements.