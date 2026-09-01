const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routes & Middleware
const user = require('./routes/usersAuth');
const isUserAuthorized = require('./Middleware/userAuthorization');
const router = require('./routes/ResumeDownload');
const ResumeDataGeneratorRout = require('./routes/ResumeDataGeneratorRout');
const ATSScoreGenerator = require("./routes/ATSScore");
const { default: mongoose } = require('mongoose');
const resumeRoutes = require('./routes/resumeRoute');

const app = express();

// ✅ Allow frontend from localhost & LAN IP
app.use(cors({
  origin: ["https://reimagineresume.netlify.app","http://192.168.107.151:5173"], 
  credentials: true,
}));
app.use((req, res, next) => {
  next();
});




// ✅ Parsing middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text());
app.use(cookieParser());

// ✅ Routes
app.use(router);   
app.use(resumeRoutes)                  // /download-resume route
app.use(ATSScoreGenerator);            // /ats-score
app.use(ResumeDataGeneratorRout);      // /generate-resume-data
app.use(user.userAuth);                // /signup /login /logout etc.

// ✅ Default root
app.get("/", (req, res) => {
  res.send("👋 Hello from Backend");

});


const DB_PATH = "mongodb+srv://kumarajparmar:MvoSBuvpJ2zaTfLN@cluster0.6oomtku.mongodb.net/AIresumebuilder"

mongoose.connect(DB_PATH).then(() => {
  app.listen(3000,'0.0.0.0', () => {
  });
}).catch((err) => {err});







module.exports = app;
