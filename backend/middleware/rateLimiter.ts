import { Request, Response, NextFunction } from "express";
import client from "../src/lib/client";
import logger from "../src/lib/logger";

const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const counter = 1 ;
  const ip =
    (req.headers["x-real-ip"] as string) ||
    (req.socket.remoteAddress as unknown);
  const key = `rate-limit:${ip}`;
  logger.debug(`User ip ${ip} ${counter+1}`)
  const current = await client.get(key);

  try {
    if (current) {
      const currentCount = parseInt(current);
      if (currentCount >= 100) {
       return res
          .status(429)
          .json({ msg: "Too many requests!Please try again later" });
      }
      await client.set(key, currentCount + 1, {
        EX: 3600,
      });
      logger.debug(`current request no ${currentCount}`)
      next();
    } else {
      await client.set(key, 1, {
        EX: 3600,
      });
      next();
    }
  } catch (error) {
    logger.info(`Error in rate limiter ${error}`);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export {rateLimiterMiddleware }; ;