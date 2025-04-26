import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import logger from './src/lib/logger';
import { proxyRouter } from './routes/proxy';
import client from './src/lib/client';
dotenv.config()
const app = express();
const swaggerDocument = YAML.load('./swagger.yaml');

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
  
  