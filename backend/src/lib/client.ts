import { createClient } from "redis";
import dotenv from "dotenv";
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
  console.log("Redis Client Error", err);
});

await client.connect();
console.log("Connected to Redis");

export default client;

process.on('SIGINT', async () => {
  await client.disconnect();
  console.log('Disconnected from Redis');
  process.exit(0);
});