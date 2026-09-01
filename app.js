const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routes & Middleware
const user = require('./routes/usersAuth');
const router = require('./routes/ResumeDownload');
const ResumeDataGeneratorRout = require('./routes/ResumeDataGeneratorRout');
const ATSScoreGenerator = require("./routes/ATSScore");
const resumeRoutes = require('./routes/resumeRoute');
const { default: mongoose } = require('mongoose');

const app = express();

// Allow the deployed frontend and local development clients.
app.use(cors({
  origin: [
    "https://reimagineresume.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.107.151:5173"
  ],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text());
app.use(cookieParser());

// Routes
app.use(router);
app.use(resumeRoutes);
app.use(ATSScoreGenerator);
app.use(ResumeDataGeneratorRout);
app.use(user.userAuth);

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "AI Resume Builder API" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

const DB_PATH = "mongodb+srv://kumarajparmar:MvoSBuvpJ2zaTfLN@cluster0.6oomtku.mongodb.net/AIresumebuilder";

mongoose.connect(DB_PATH).then(() => {
  app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
    console.log(`API listening on port ${process.env.PORT || 3000}`);
  });
}).catch((err) => {
  console.error('MongoDB connection failed:', err.message);
});

module.exports = app;
