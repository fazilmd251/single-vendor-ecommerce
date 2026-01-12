import express from 'express'
import globalRateLimiter from '../middlewares/rate-limiter/globalRateLimiter';
import { NotFoundError } from '../utils/errors/errors';
import authRoutes from '../routes/auth.routes';
import globalErrorHandler from '../utils/errors/errorHandler';

const app=express();

app.set("trust proxy", 1);

app.use(express.json({limit:"50mb"}));
app.use(globalRateLimiter);

//health checker
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


//routes
app.use('/api/auth/',authRoutes);


app.all(/(.*)/,(req,res,next)=>{
    next(new NotFoundError(`Cannot found ${req.originalUrl}`))
})

app.use(globalErrorHandler);


export default app;