import { Router } from 'express';

import {
  createPersonController,
  createTestTicketController,
  getPersonController
} from './controller';

const router = Router();

router.get('/movidesk/person', getPersonController);
router.post('/movidesk/person', createPersonController);
router.post('/movidesk/test-ticket', createTestTicketController);

export default router;