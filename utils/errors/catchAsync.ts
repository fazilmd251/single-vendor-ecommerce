import {NextFunction, Request, Response} from "express";

const catchAsync=(func:Function)=>(req:Request,res:Response,next:NextFunction)=>{
    Promise.resolve(func(req,res,next)).catch(next);
}

export default catchAsync;
            