require("dotenv").config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const user = require('./routes/usersAuth');
const router = require('./routes/ResumeDownload');
const ResumeDataGeneratorRout = require('./routes/ResumeDataGeneratorRout');
const ATSScoreGenerator = require("./routes/ATSScore");
const resumeRoutes = require('./routes/resumeRoute');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DB_PATH = process.env.MONGODB_URI;

if (!DB_PATH) {
  throw new Error('MONGODB_URI is not configured');
}

// Allow the deployed frontend and local development clients.
const allowedOrigins = (process.env.FRONTEND_URLS || [
  'https://reimagineresume.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.107.151:5173'
].join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(router);
app.use(resumeRoutes);
app.use(ATSScoreGenerator);
app.use(ResumeDataGeneratorRout);
app.use(user.userAuth);

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'AI Resume Builder API' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message === 'CORS origin not allowed') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

async function startServer() {
  try {
    await mongoose.connect(DB_PATH);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
