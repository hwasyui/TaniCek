import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import dotenv from 'dotenv';

import './config/passport.js'; // Ensure passport is configured
import companyRouter from './routes/company.js'

dotenv.config()

const app = express();
app.use(cookieParser());

app.use(cors({
  origin: [ "http://localhost:5173"], // ✅ frontend port
  credentials: true               // ✅ allow cookies
}));
app.use(express.json());
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use(passport.initialize());

app.use((req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return next(); // continue without setting req.user
    }
    req.user = user;
    next();
  })(req, res, next);
});



// import { isUserValidator } from './validators/users.validator.js'
app.use('/companies', companyRouter)

// app.use('/auth', userRouter)

app.use((err, req, res, next)=> {
    res.status(500).json({message: err.message})
})

export default app;