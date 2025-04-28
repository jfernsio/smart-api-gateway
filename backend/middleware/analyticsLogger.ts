import { NextFunction, Request, Response } from "express";
import client from "../src/lib/client";
import logger from "../src/lib/logger";

const analyticsLogger = async (req:Request,res:Response,next:NextFunction) => {
    
    try {

        const analytics = {
            url:req.originalUrl,
            method: req.method,
            timeStamp: new Date().toISOString(),
            status: res.statusCode,
        }
        await client.lPush("analytics", JSON.stringify(analytics));
        await client.lRange("analytics", 0, 9);
     

        logger.info("Analytics log added:", analytics);
        next()        
    }catch (err) {
        logger.error("Error in analytics logger:", err);
        next(err)
    }
}


export {analyticsLogger}