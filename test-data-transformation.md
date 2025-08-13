```javascript
// Real-world data transformation test - complex data processing pipeline
try {
  console.log('Testing data transformation libraries...');
  
  // Simulate incoming messy e-commerce data
  const rawOrderData = [
    {
      "order_id": "ORD-001",
      "customer_name": "  john DOE  ",
      "email": "JOHN.doe@GMAIL.COM",
      "phone": "+1-555-123-4567",
      "items": "Laptop|Mouse|Keyboard",
      "quantities": "1|2|1",
      "prices": "999.99|29.99|79.99",
      "order_date": "2024-08-01T10:30:00Z",
      "shipping_country": "US",
      "currency": "USD",
      "notes": "Rush delivery needed\nFragile items",
      "tags": "#electronics,#computers,#accessories"
    },
    {
      "order_id": "ORD-002", 
      "customer_name": "jane smith",
      "email": "jane.smith@yahoo.com",
      "phone": "44-20-7946-0958",
      "items": "Book|Pen|Notebook",
      "quantities": "3|5|2", 
      "prices": "15.99|2.99|12.99",
      "order_date": "2024-08-02T14:15:30Z",
      "shipping_country": "GB",
      "currency": "GBP",
      "notes": "Gift wrap requested",
      "tags": "#books,#stationery"
    },
    {
      "order_id": "ORD-003",
      "customer_name": "Bob Johnson Jr.",
      "email": "bob.johnson@company.co.uk", 
      "phone": "+49-30-12345678",
      "items": "Camera|SD Card|Tripod|Lens",
      "quantities": "1|2|1|1",
      "prices": "1299.00|49.99|199.99|599.00",
      "order_date": "2024-08-03T09:45:15Z",
      "shipping_country": "DE", 
      "currency": "EUR",
      "notes": "Professional photographer\nBusiness purchase",
      "tags": "#photography,#professional,#business"
    }
  ];
  
  // Transform and enrich the data
  const transformedOrders = rawOrderData.map(order => {
    // Parse items, quantities, and prices
    const items = order.items.split('|');
    const quantities = order.quantities.split('|').map(q => parseInt(q));
    const prices = order.prices.split('|').map(p => parseFloat(p));
    
    // Create detailed line items
    const lineItems = items.map((item, index) => ({
      name: _.startCase(item.toLowerCase()),
      quantity: quantities[index],
      unit_price: prices[index],
      line_total: quantities[index] * prices[index]
    }));
    
    // Calculate totals
    const subtotal = _.sumBy(lineItems, 'line_total');
    const taxRate = order.shipping_country === 'US' ? 0.08 : 0.20; // Different tax rates
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Clean and format data
    return {
      order_id: order.order_id,
      customer: {
        name: _.startCase(order.customer_name.trim().toLowerCase()),
        email: order.email.toLowerCase().trim(),
        email_valid: validator.isEmail(order.email),
        phone: order.phone,
        phone_valid: phoneNumber.isValidPhoneNumber(order.phone),
        phone_formatted: phoneNumber.isValidPhoneNumber(order.phone) 
          ? phoneNumber.formatInternational(order.phone) 
          : order.phone
      },
      order_details: {
        line_items: lineItems,
        item_count: _.sum(quantities),
        subtotal: Math.round(subtotal * 100) / 100,
        tax_rate: taxRate,
        tax_amount: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
        currency: order.currency,
        average_item_price: Math.round((subtotal / _.sum(quantities)) * 100) / 100
      },
      timestamps: {
        order_date: dayjs(order.order_date).format('YYYY-MM-DD HH:mm:ss'),
        days_ago: dayjs().diff(dayjs(order.order_date), 'days'),
        order_month: dayjs(order.order_date).format('YYYY-MM'),
        order_weekday: dayjs(order.order_date).format('dddd')
      },
      shipping: {
        country: order.shipping_country,
        region: order.shipping_country === 'US' ? 'North America' : 
                order.shipping_country === 'GB' ? 'Europe' : 
                order.shipping_country === 'DE' ? 'Europe' : 'Other'
      },
      metadata: {
        notes: order.notes.replace(/\n/g, ' | '),
        tags: order.tags.replace('#', '').split(',').map(tag => tag.trim()),
        order_hash: CryptoJS.MD5(order.order_id + order.email).toString(),
        processing_timestamp: dayjs().toISOString(),
        data_quality_score: _.sum([
          validator.isEmail(order.email) ? 25 : 0,
          phoneNumber.isValidPhoneNumber(order.phone) ? 25 : 0,
          order.customer_name.trim().length > 0 ? 25 : 0,
          lineItems.length > 0 ? 25 : 0
        ])
      }
    };
  });
  
  // Generate summary analytics
  const analytics = {
    total_orders: transformedOrders.length,
    total_revenue: _.sumBy(transformedOrders, 'order_details.total'),
    average_order_value: _.meanBy(transformedOrders, 'order_details.total'),
    items_sold: _.sumBy(transformedOrders, 'order_details.item_count'),
    
    by_country: _.groupBy(transformedOrders, 'shipping.country'),
    by_region: _.groupBy(transformedOrders, 'shipping.region'),
    by_currency: _.groupBy(transformedOrders, 'order_details.currency'),
    
    data_quality: {
      valid_emails: _.filter(transformedOrders, order => order.customer.email_valid).length,
      valid_phones: _.filter(transformedOrders, order => order.customer.phone_valid).length,
      average_quality_score: _.meanBy(transformedOrders, 'metadata.data_quality_score')
    },
    
    date_range: {
      earliest_order: _.minBy(transformedOrders, 'timestamps.order_date').timestamps.order_date,
      latest_order: _.maxBy(transformedOrders, 'timestamps.order_date').timestamps.order_date
    }
  };
  
  // Create customer lookup table
  const customerLookup = _.keyBy(transformedOrders.map(order => ({
    email: order.customer.email,
    name: order.customer.name,
    phone: order.customer.phone_formatted,
    total_orders: 1, // This would be calculated across all orders in real scenario
    customer_since: order.timestamps.order_date
  })), 'email');
  
  // Generate export formats
  const exportData = {
    json: transformedOrders,
    
    // CSV headers and data
    csv_headers: ['Order ID', 'Customer', 'Email', 'Phone', 'Items', 'Total', 'Currency', 'Country', 'Order Date'],
    csv_data: transformedOrders.map(order => [
      order.order_id,
      order.customer.name,
      order.customer.email,
      order.customer.phone_formatted,
      order.order_details.item_count,
      order.order_details.total,
      order.order_details.currency,
      order.shipping.country,
      order.timestamps.order_date
    ]),
    
    // XML structure
    xml: {
      orders: {
        $: { count: transformedOrders.length, generated: dayjs().toISOString() },
        order: transformedOrders.map(order => ({
          $: { id: order.order_id },
          customer: order.customer,
          totals: {
            subtotal: order.order_details.subtotal,
            tax: order.order_details.tax_amount,
            total: order.order_details.total
          }
        }))
      }
    }
  };
  
  return [{
    json: {
      success: true,
      processing_summary: {
        raw_records: rawOrderData.length,
        transformed_records: transformedOrders.length,
        libraries_used: ['lodash', 'validator', 'libphonenumber-js', 'dayjs', 'crypto-js'],
        processing_time: dayjs().format('YYYY-MM-DD HH:mm:ss')
      },
      data: {
        transformed_orders: transformedOrders,
        analytics: analytics,
        customer_lookup: customerLookup,
        export_formats: exportData
      }
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