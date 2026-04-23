import express, { NextFunction, Request, Response } from 'express';
import ticketsRoutes from './modules/tickets/routes';
import { AppError } from './shared/errors/appError';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(ticketsRoutes);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null
    });
  }

  return res.status(500).json({
    message: 'Erro interno da aplicação'
  });
});