import { Router } from 'express';

import {
  getTicketsController,
  sendTicketToMovideskController
} from './controller';

const router = Router();

router.get('/tickets', getTicketsController);

router.post('/tickets/send-to-movidesk', sendTicketToMovideskController);

export default router;