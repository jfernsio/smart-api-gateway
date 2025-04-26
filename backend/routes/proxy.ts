import express, { response } from "express";
import client from "../src/lib/client.ts";
import { timeStamp } from "console";
const proxyRouter = express.Router();

proxyRouter.post("/proxy", async (req, res) => {
  const { url, method, headers, body } = req.body;

  const cacheKey = `${method}:${url}`;

  const cachedResponse = await client.get(cacheKey);
  //if da res is already cached rerturn it
  if (cachedResponse) {
    console.log("Cache hit");
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
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    // Cache the response
    await client.set(cacheKey, JSON.stringify(data), {
      EX: 60, //exp in 60s
    });
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Error in proxy request:", err);

    if (err instanceof Error) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(500).json({ error: "Proxy request failed" });
  }
  res.status(200).json({
    msg: "Proxy hit!",
  });

  //analyastci
  const analystic = {
    url,
    method,
    timeStamp: new Date().toISOString(),
    status: response.status,
  };

  await client.lPush("analytics", JSON.stringify(analystic));
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
    console.error("Error parsing analytics logs:", err);
    return res.status(500).json({ error: "Failed to fetch analytics logs" });
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
  const val = await client.get(key);
  if (!val) {
    return res.status(404).json({ message: `Key "${key}" not found` });
  }
  res.status(200).json({ message: `Key "${key}" found`, value: val });
});

proxyRouter.delete("/cache/:key", async (req, res) => {
  const { key } = req.params;
  const val = await client.del(key);
  if (!val) {
    return res.status(404).json({ message: `Key "${key}" not found` });
  }
  res.status(200).json({ message: `Key "${key}" deleted successfully!` });
});

export { proxyRouter };
