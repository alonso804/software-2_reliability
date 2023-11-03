import { Router } from 'express';

import AnimeController from '../controllers/anime';

const router = Router();

router.get('/get-anime/:id', AnimeController.findById);

export default router;
