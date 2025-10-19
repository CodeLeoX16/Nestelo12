const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utility/expressError.js');
const listingRoutes = require('./Routes/listing.js');
const review = require('./Routes/review.js');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For session storage in MongoDB
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRoutes = require('./Routes/user.js');
require('dotenv').config(); 

const dbUrl=process.env.ATLASDB_URL; 
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Global error logging for debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
}); 
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
 
  
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  try {
    await mongoose.connect(dbUrl);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // time in seconds after which session will be updated

});
store.on('error', function(e) {
  console.log('Session Store Error', e);
});

const sessionOptions={
  store: store,
  secret: process.env.SECRET, // Use environment variable for secret
  resave:false,
  saveUninitialized:true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 1000, // 7 day
    maxAge: 7 * 24 * 60 * 1000, // 7 day
    history: true, // Enable history tracking
  }

};

// app.get('/', (req, res) => {
//   res.send("i am root");
// });



app.use(session(sessionOptions));
app.use(flash());//atfirst always flash then use it in routes

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user; // Make currentUser available in all templates
  next();
});
 
app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', review);
app.use('/', userRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Error-handling middleware (must have 4 arguments)
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{message})
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
}); 
