import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import dotenv from 'dotenv';

import companyRouter from './routes/company.js';
import userGlobalRouter from './routes/user.global.js';
import userByCompanyRouter from './routes/user.byCompany.js';
import authRouter from './routes/auth.js';
import machineRouter from './routes/machine.js';

import './config/passport.js';
import './cronJobs/dailyAiAnalysis.js';

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

app.use((req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) req.user = user;
    next();
  })(req, res, next);
});

app.get('/', (req, res) => res.redirect('/companies'));

app.use('/companies', companyRouter);
app.use('/user', userGlobalRouter);
app.use('/auth', authRouter);
app.use('/machines', machineRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

export default app;
