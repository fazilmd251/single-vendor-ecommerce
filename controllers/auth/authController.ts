import { NextFunction, Request, Response } from "express";
import catchAsync from "../../utils/errors/catchAsync";
import { authService } from "../../services/auth/auth.service";

export const userRegistration = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await authService.registerUser(req.body)
    return res.status(200).json({
        success: true,
        message: "Otp has sent to your email id " + req.body.email
    })
})

export const verifyUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.verifyUser(req.body);
    return res.status(200).json({
        success: true, user
    })
});


