const results = { working: [], failed: [] };
const libs = ['_', 'axios', 'dayjs', 'joi', 'Joi', 'validator', 'uuid', 'csvParse', 'Handlebars', 'cheerio', 'CryptoJS', 'XLSX', 'pdfLib', 'math', 'xml2js', 'YAML', 'sharp', 'Jimp', 'QRCode', 'natural', 'archiver', 'puppeteer', 'knex', 'forge', 'moment', 'XMLParser', 'jwt', 'bcrypt', 'ethers', 'web3', 'phoneNumber', 'currency', 'iban', 'fuzzy'];

for (const lib of libs) {
    try {
        eval(`typeof ${lib}`);
        results.working.push(lib);
    } catch (error) {
        results.failed.push(`${lib}: ${error.message.substring(0, 30)}`);
    }
}

return {
    total: 34,
    working: results.working.length,
    failed: results.failed.length,
    success_rate: `${Math.round((results.working.length / 34) * 100)}%`,
    working_libs: results.working,
    failed_libs: results.failed,
    status: results.working.length === 34 ? "🎉 SUCCESS!" : "⚠️ Still issues"
};