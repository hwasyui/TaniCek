import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';

import companyRouter from './routes/company.js';
import userGlobalRouter from './routes/user.global.js';
import userByCompanyRouter from './routes/user.byCompany.js';

import './config/passport.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// Optional: attach authenticated user to req.user
app.use((req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (user) req.user = user;
    next();
  })(req, res, next);
});

// Routes
app.get('/', (req, res) => res.send('Hello World!'));

app.use('/companies', companyRouter);
app.use('/user', userGlobalRouter); // For developers

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
