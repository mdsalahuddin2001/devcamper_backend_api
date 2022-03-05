const path = require('path');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const fileupload = require('express-fileupload');
var cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
var xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

// load env vars
dotenv.config();

// connect to the database
connectDB();
// Route files
const bootcampsRoute = require('./routes/bootcamps');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/user');
const coursesRoute = require('./routes/courses');
const reviewsRoute = require('./routes/reviews');
const app = express();
// body parser
app.use(express.json());
// Cookie Parser
app.use(cookieParser());
// sanitize data
app.use(mongoSanitize());
// set security headers
app.use(helmet());
// prevent XSS attacks
app.use(xss());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);
// Prevent HTTP Param Pollution
app.use(hpp());
// Enable Cross-Origin Resource Share (cors)
app.use(cors());
// dev logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// file uploading middleware
app.use(fileupload());
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// Mount routes
app.use('/api/v1/bootcamps', bootcampsRoute);
app.use('/api/v1/courses', coursesRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/reviews', reviewsRoute);
// error handler
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running in ${process.env.NODE_ENV} mode on PORT:${PORT}`);
});
