import { Request, Response, NextFunction } from 'express';
import { listTickets } from './service';

export async function getTicketsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const query = req.query.query ? String(req.query.query) : undefined;

    const tickets = await listTickets({ limit, query });

    res.status(200).json({
      count: tickets.length,
      result: tickets
    });
  } catch (error) {
    next(error);
  }
}