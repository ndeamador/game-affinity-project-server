import resetTestDatabase from '../database/resetDatabase';
import express from 'express';

const router = express.Router();

router.post('/reset', (_request, response) => {
  // await resetTestDatabase(); // add async
  // return response.status(204).end();
  resetTestDatabase().then(() => response.status(204).end()).catch(err => { throw new Error(err); });
});

export default router;
