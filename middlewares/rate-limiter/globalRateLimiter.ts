import rateLimit from "express-rate-limit";

const globalRateLimiter=rateLimit({
    windowMs:15*60*1000, //15 min,
    max:90,
    message:{
        success:false,
        message:"Too many requests from this IP. please try again later "
    },
    standardHeaders:true,
    legacyHeaders:false
})

export default globalRateLimiter;