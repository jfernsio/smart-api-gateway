import { Request, Response, NextFunction } from "express";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Internal error:", err);
  res.status(500).json({ error: "Internal Server Error" }); // Or a custom message
};

export { errorHandler };
