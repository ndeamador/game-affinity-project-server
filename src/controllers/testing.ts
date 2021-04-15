import resetTestDatabase from '../database/resetDatabase';
import express from 'express';

const router = express.Router();

router.post('/reset', async (_request, response) => {
  await resetTestDatabase();
  response.status(204).end();
});

export default router;
