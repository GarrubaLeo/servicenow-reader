import { Router } from 'express';
import { getTicketsController } from './controller';

const router = Router();

router.get('/tickets', getTicketsController);

export default router;