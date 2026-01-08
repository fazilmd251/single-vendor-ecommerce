import express from 'express';
import dotenv from 'dotenv';
import globalRateLimiter from './middlewares/rate-limiter/globalRateLimiter';
import connectDb from './config/db/connectDb';
import globalErrorHandler from './utils/errors/errorHandler';
import { NotFoundError } from './utils/errors/errors';

dotenv.config();
const app=express();;
connectDb();

app.use(express.json({limit:"50mb"}));
app.use(globalRateLimiter);


app.all("*",(req,res,next)=>{
    next(new NotFoundError(`Cannot found ${req.originalUrl}`))
})

app.use(globalErrorHandler);

const port=process.env.PORT||4599;
const server=app.listen(port,()=>{
    console.log(`serever started on port:${port} in ${process.env.NODE_ENV}mode`)
});

server.on('error',console.error)