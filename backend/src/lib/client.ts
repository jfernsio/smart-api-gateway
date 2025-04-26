import { createClient } from "redis";
import dotenv from "dotenv";
import logger from "./logger";
dotenv.config();

const client = createClient({
  username: "default",
  password: "Qc5FVtI09ArbEz1XqgEJJauS46hBlJOP",
  socket: {
    host: "redis-10079.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 10079,
  },
});

client.on("error", (err: Error) => {
  logger.info("Redis Client Error", err);
});

await client.connect();
logger.info("Connected to Redis");

export default client;

process.on('SIGINT', async () => {
  await client.disconnect();
  logger.info('Disconnected from Redis');
  process.exit(0);
});