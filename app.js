const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utility/expressError.js');
const listingRoutes = require('./Routes/listing.js');
const reviewRoutes = require('./Routes/review.js');
const userRoutes = require('./Routes/user.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
require('dotenv').config();

// -------------------- DATABASE CONNECTION --------------------
const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error("❌ Missing MongoDB connection string! Please set ATLASDB_URL in environment variables.");
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}
main();

// -------------------- VIEW ENGINE SETUP --------------------
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------- MIDDLEWARE --------------------
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- SESSION CONFIG --------------------
const secret = process.env.SECRET || 'fallbacksecret';

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret,
  },
  touchAfter: 24 * 3600, // update every 24h
});

store.on('error', (e) => {
  console.log('Session Store Error', e);
});

const sessionOptions = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// -------------------- PASSPORT CONFIG --------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// -------------------- GLOBAL VARIABLES --------------------
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null; // ✅ Always define currentUser
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// -------------------- ROUTES --------------------
app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// -------------------- HOME ROUTE --------------------
app.get('/', (req, res) => {
  res.render('home'); // make sure 'views/home.ejs' exists
});

// -------------------- 404 HANDLER --------------------
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong!';
  res.status(statusCode).render('error.ejs', { message: err.message });
});

// -------------------- SERVER START --------------------
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// -------------------- GLOBAL ERROR LOGGING --------------------
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
