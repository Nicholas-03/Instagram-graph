import express from 'express';
import { createJob } from '../controllers/jobControllers.mjs';

const router = express.Router();

router.post('/job', createJob);

export default router;
