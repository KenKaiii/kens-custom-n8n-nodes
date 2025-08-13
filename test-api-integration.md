```javascript
// Real-world API integration test - weather data + data processing
const apiKey = 'demo'; // Using demo key for testing
const city = 'London';

try {
  console.log('Testing multiple APIs and data processing...');
  
  // 1. Get random quote
  const quoteResponse = await axios.get('https://api.quotable.io/random');
  const quote = quoteResponse.data;
  
  // 2. Get currency exchange rates
  const currencyResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
  const rates = currencyResponse.data.rates;
  
  // 3. Get public API list sample
  const publicApiResponse = await axios.get('https://api.publicapis.org/random?auth=null');
  const randomApi = publicApiResponse.data;
  
  // Process and combine data using various libraries
  const processedData = {
    // Quote processing
    quote: {
      text: quote.content,
      author: quote.author,
      word_count: quote.content.split(' ').length,
      hash: CryptoJS.MD5(quote.content).toString(),
      tags: quote.tags
    },
    
    // Currency data with lodash processing
    currencies: {
      usd_to_eur: rates.EUR,
      usd_to_gbp: rates.GBP,
      top_5_rates: _.take(_.orderBy(_.toPairs(rates), 1, 'desc'), 5),
      total_currencies: _.size(rates)
    },
    
    // Random API info
    api_info: {
      name: randomApi.entries[0].API,
      description: randomApi.entries[0].Description,
      category: randomApi.entries[0].Category,
      url_valid: validator.isURL(randomApi.entries[0].Link),
      https_enabled: randomApi.entries[0].HTTPS
    },
    
    // Generate test data
    test_data: {
      uuid: uuid.v4(),
      timestamp: dayjs().format(),
      jwt_token: jwt.sign({test: true, exp: Math.floor(Date.now() / 1000) + 3600}, 'secret'),
      math_calculation: math.evaluate('sqrt(16) + pow(2, 3)'),
      phone_validation: phoneNumber.isValidPhoneNumber('+1234567890'),
      iban_validation: iban.isValid('DE89370400440532013000')
    }
  };
  
  return [{
    json: {
      success: true,
      apis_tested: 3,
      libraries_used: ['axios', 'lodash', 'crypto-js', 'dayjs', 'validator', 'uuid', 'jsonwebtoken', 'mathjs', 'libphonenumber-js', 'iban'],
      data: processedData,
      generated_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  }];
  
} catch (error) {
  return [{
    json: {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }];
}
```