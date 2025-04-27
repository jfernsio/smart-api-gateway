import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import logger from './src/lib/logger';
import rateLimit from 'express-rate-limit';
import { proxyRouter } from './routes/proxy';
import client from './src/lib/client';
dotenv.config()
const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Create a rate limit rule for all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

app.use('/api', limiter); //apllies to all routes

app.use('/api',proxyRouter);

app.listen(port,()=> {
    logger.info(`Server started at port : ${port}`)
})

//close rwdis concection
process.on('SIGINT', async () => {
    logger.info('Shutting down gracefully...');
    await client.quit();
    process.exit(0);
  });
  
process.on('SIGTERM', async () => {
    logger.info('Shutting down gracefully...');
    await client.quit();
    process.exit(0);
});
  
  