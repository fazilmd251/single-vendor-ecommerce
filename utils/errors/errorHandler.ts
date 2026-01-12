import { Request, Response, NextFunction } from "express";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    const env = process.env.NODE_ENV || "development";

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server Error";

    if (!err.isOperational) {
        statusCode = 500;
        message="Something went wrong da"
    }

    if (env == 'development') {
        return res.status(err.statusCode).json({
            success: false,
            message,
            errorName: err.name,
            errStack: err.stack
        })
    }

    return res.status(statusCode).json({
        success:false,
        message
    })
}

export default globalErrorHandler;