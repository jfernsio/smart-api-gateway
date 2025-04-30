import express, { response } from "express";
import client from "../src/lib/client.ts";
import logger from "../src/lib/logger.ts";
import { analyticsLogger } from "../middleware/analyticsLogger.ts";
import { rateLimiterMiddleware } from "../middleware/rateLimiter.ts";
const proxyRouter = express.Router();

proxyRouter.post("/proxy",rateLimiterMiddleware, analyticsLogger, async (req, res) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 5000); // 5 seconds timeout

  const { url, method, headers, body } = req.body;
  logger.info(`Request to proxy URL: ${url}`);

  const cacheKey = `${method}:${url}`;
  logger.info(`Cache key: ${cacheKey}`);

  const cachedResponse = await client.get(cacheKey);
  logger.info(`Cached response: ${cachedResponse}`);

  //if da res is already cached rerturn it
  if (cachedResponse) {
    logger.info("Cache hit");
    return res.status(200).json(JSON.parse(cachedResponse));
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: method === "GET" ? undefined : JSON.stringify(body), //get does not have body
      signal: controller.signal, // Pass the abort signal to fetch
    });

    clearTimeout(timeout); // Clear the timeout if the request completes
    if (!response.ok) {
      logger.error("Error in proxy request:", response.statusText);
      return res.status(response.status).json({ error: response.statusText });
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    // Cache the response
    // const encodeUrl = decodeURIComponent(cacheKey)
    // logger.debug(`decoded url ${encodeUrl}`)
    const resp = await client.set(cacheKey, JSON.stringify(data), {
      EX: 60, //exp in 60s
    });
    logger.debug(`testing exp ${resp}`);
    const tty = await client.ttl(cacheKey);
    logger.info(`ttl ${tty}`)
    //analyastci
    const analystic = {
      url,
      method,
      timeStamp: new Date().toISOString(),
      status: response.status,
    };

    await client.lPush("analytics", JSON.stringify(analystic));

    return res.status(response.status).json(data);
  } catch (err) {
    logger.error("Error in proxy request:", err);
    if (err instanceof Error && err.name === "AbortError") {
      return res.status(504).json({ error: "Upstream server timeout" });
    }
    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: "Proxy request failed" });
  }
});

proxyRouter.get("/analytics", async (req, res) => {
  try {
    const analyticsLogs = await client.lRange("analytics", 0, 9);

    if (!analyticsLogs[0]) {
      return res
        .status(404)
        .json({ msg: "No analytics logs found to display" });
    }

    const parsedLogs = analyticsLogs.map((log) => JSON.parse(log));

    res.status(200).json({ analytics: parsedLogs });
  } catch (err) {
    logger.error("Error parsing analytics logs:", err);
    return res.status(500).json({ error: "Failed to fetch analytics logs" });
  }
});

proxyRouter.get("/health", async (req, res) => {
  try {
    const pong = await client.ping();
    if (pong === "PONG") {
      return res.status(200).json({ message: "Redis is healthy" });
    } else {
      return res.status(500).json({ message: "Redis is not healthy" });
    }
  } catch (err) {
    logger.error("Error checking Redis health:", err);
    return res
      .status(500)
      .json({ status: "error", msg: "Health check failed" });
  }
});

//rn set to get for faster res later refactotr to post
proxyRouter.post("/cache", async (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ message: "Key and Value are required" });
  }
  if (typeof key === "string" && typeof value === "string") {
    return res.status(400).json({ message: "Key and Value must be strings" });
  }
  await client.set(key as string, value as string); //type assetion setting key,val as string

  res.status(200).json({ message: `Key "${key}" set successfully!` });
});

proxyRouter.get("/cache/:key", async (req, res) => {

  const { key } = req.params;
  
  logger.debug(`Fetching value for key: ${key}`);
  
  const val = await client.get(key);
 
  if (!val) {
    return res.status(404).json({ message: `Key "${key}" not found` });
  }
  const ttlInSeconds = await client.ttl(key);
  
  logger.debug(`TTL for key "${key}": ${ttlInSeconds} seconds`);
  
  res.status(200).json({
    message: `Key "${key}" found`,
    value: val,
    ttl: `Time left to expier ${ttlInSeconds}`,
  });
});

proxyRouter.delete("/cache/:key", async (req, res) => {
  const { key } = req.params;
  const val = await client.del(key);
  if (!val) {
    logger.info(`Key "${key}" not found`);
    return res.status(404).json({ message: `Key "${key}" not found` });
  }
  logger.info(`Key "${key}" deleted successfully`);
  res.status(200).json({ message: `Key "${key}" deleted successfully!` });
});

export { proxyRouter };
