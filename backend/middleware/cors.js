// middleware/cors.js
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',             // Local dev
  'http://127.0.0.1:3000',
  'https://your-frontend.vercel.app',  // Vercel
  'https://yourdomain.com'             // Replace with your prod domain
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allow requests with no origin (like mobile apps or curl) or whitelisted ones
      callback(null, true);
    } else {
      callback(new Error('🚫 Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browsers (IE11 cough)
};

module.exports = cors(corsOptions);
