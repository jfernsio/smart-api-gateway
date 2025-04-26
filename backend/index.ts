import express from 'express';
import dotenv from 'dotenv';
import { proxyRouter } from './routes/proxy';
import client from './src/lib/client';
dotenv.config()
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api',proxyRouter);

app.listen(port,()=> {
    console.log(`Server started at port : ${port}`)
})

//close rwdis concection
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await client.quit();
    process.exit(0);
  });
  
process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await client.quit();
    process.exit(0);
});
  
  