import dotenv from 'dotenv';
import connectDb from './config/db/connectDb';
import app from './app/app';

dotenv.config();
connectDb();


const port=process.env.PORT||4599;
const server=app.listen(port,()=>{
    console.log(`serever started on port:${port} in ${process.env.NODE_ENV}mode`)
});

server.on('error',console.error)