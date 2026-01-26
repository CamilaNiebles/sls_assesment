import express, { type Router, type Request, type Response } from 'express';

export const healthRouter: Router = express.Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});
