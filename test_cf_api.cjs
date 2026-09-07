const https = require("https");
const data = JSON.stringify({
  order_amount: 1,
  order_currency: "INR",
  customer_details: {
    customer_id: "test12345",
    customer_phone: "9999999999"
  },
  order_meta: {
    return_url: "https://example.com/return?order_id={order_id}"
  }
});
const options = {
  hostname: 'sandbox.cashfree.com',
  path: '/pg/orders',
  method: 'POST',
  headers: {
    'x-client-id': 'TEST10214872c67ba52dbd470503f16927841201', 
    'x-client-secret': 'TEST41893c8340d24e1ee74e44f514b87332c0d',
    'x-api-version': '2023-08-01',
    'content-type': 'application/json',
    'content-length': data.length
  }
};
const req = https.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});
req.write(data);
req.end();
