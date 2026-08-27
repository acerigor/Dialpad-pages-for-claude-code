require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('./server/middleware/auth');

const PORT = process.env.PORT || 8123;
const isProd = process.env.NODE_ENV === 'production';
const ROOT = __dirname;

const app = express();

// --- Security & compression (production) ---
if (isProd) {
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
}

app.use(cors());
app.use(express.json());

// --- Rate limiting on auth endpoints ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many login attempts, try again later' },
});

// --- Auth routes (public) ---
app.use('/api/auth', authLimiter, require('./server/routes/auth'));

// --- Protected API routes ---
app.use('/api/leads', authMiddleware, require('./server/routes/leads'));
app.use('/api/messages', authMiddleware, require('./server/routes/messages'));
app.use('/api/notes', authMiddleware, require('./server/routes/notes'));
app.use('/api/users', authMiddleware, require('./server/routes/users'));
app.use('/api/calls', authMiddleware, require('./server/routes/calls'));
app.use('/api/activities', authMiddleware, require('./server/routes/activities'));
app.use('/api/sms-records', authMiddleware, require('./server/routes/sms'));
app.use('/api/email-records', authMiddleware, require('./server/routes/emails'));

// --- Static files (existing frontend pages) ---
app.use(express.static(ROOT, {
  extensions: ['html'],
  setHeaders(res) {
    if (isProd) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.get('/', (req, res) => {
  res.redirect('/coreconnect_dashboard_v41/coreconnect_dashboard_v41.html');
});

app.listen(PORT, () => {
  console.log(`CoreConnect [${isProd ? 'production' : 'development'}]`);
  console.log('Serving: ' + ROOT);
  console.log('Open: http://localhost:' + PORT + '/');
});
