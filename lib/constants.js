const ALLOWED_URL = '*';

const HEADERS = [
  ['X-XSS-Protection', '1; mode=block'],
  ['X-Content-Type-Options', 'nosniff'],
  ['Strict-Transport-Security', 'max-age=31536000; includeSubdomains; preload'],
  ['Access-Control-Allow-Origin', ALLOWED_URL],
  ['Access-Control-Allow-Methods', 'POST, GET, OPTIONS'],
  ['Access-Control-Allow-Headers', 'Content-Type, Authorization'],
  ['Access-Control-Allow-Credentials', 'true'],
];

module.exports = { HEADERS };
