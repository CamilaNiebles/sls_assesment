import express, { type Express } from 'express';
import { healthRouter } from './controllers/health.router.js';

const app: Express = express();

app.use((req, _res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

app.use(express.json());

app.use('/health-check', healthRouter);

export default app;
