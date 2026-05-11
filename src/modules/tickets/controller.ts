import { Request, Response, NextFunction } from 'express';

import {
  listTickets,
  sendTicketToMovidesk
} from './service';

export async function getTicketsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query.limit
      ? Number(req.query.limit)
      : undefined;

    const query = req.query.query
      ? String(req.query.query)
      : undefined;

    const tickets = await listTickets({
      limit,
      query
    });

    return res.status(200).json({
      count: tickets.length,
      result: tickets
    });
  } catch (error) {
    next(error);
  }
}

export async function sendTicketToMovideskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log('BODY:', req.body);
    console.log('HEADERS:', req.headers);

    const sysId =
      req.body?.sysId ??
      req.body?.sys_id ??
      undefined;

    const number =
      req.body?.number ??
      req.body?.ticketNumber ??
      undefined;

    const result = await sendTicketToMovidesk({
      sysId,
      number
    });

    return res.status(201).json({
      message: 'Ticket enviado para o Movidesk com sucesso',
      result
    });
  } catch (error) {
    next(error);
  }
}