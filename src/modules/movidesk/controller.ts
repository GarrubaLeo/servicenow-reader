import { Request, Response, NextFunction } from 'express';
import {
  createMovideskPerson,
  createMovideskTestTicket,
  getMovideskPersonByEmail
} from './service';

export async function getPersonController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const email = String(req.query.email ?? '');

    if (!email) {
      return res.status(400).json({
        message: 'Parâmetro email é obrigatório'
      });
    }

    const person = await getMovideskPersonByEmail(email);

    return res.status(200).json({
      found: !!person,
      result: person
    });
  } catch (error) {
    next(error);
  }
}

export async function createPersonController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const person = await createMovideskPerson(req.body);

    return res.status(201).json({
      message: 'Pessoa criada no Movidesk com sucesso',
      result: person
    });
  } catch (error) {
    next(error);
  }
}

export async function createTestTicketController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ticket = await createMovideskTestTicket({
      email: req.body.email,
      businessName: req.body.businessName,
      subject: req.body.subject
    });

    return res.status(201).json({
      message: 'Ticket de teste criado no Movidesk com sucesso',
      result: ticket
    });
  } catch (error) {
    next(error);
  }
}