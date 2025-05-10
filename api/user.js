
import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { getAuth } from '@clerk/express';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/saved', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const saved = await prisma.userJob.findMany({
    where: { userId, type: 'saved' },
    include: { job: true }
  });
  res.json(saved.map((sj) => ({ jobId: sj.jobId, ...sj.job })));
});

// GET /api/user/applied
router.get('/applied', async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  
    const applied = await prisma.userJob.findMany({
      where: { userId, type: 'applied' },
      include: { job: true }
    });
  
    res.json(applied.map((a) => ({ jobId: a.jobId, ...a.job })));
  });
  

export default router;
