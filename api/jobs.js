// server/src/routes/jobs.js
import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { getAuth } from '@clerk/express';
const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/jobs
 * Query params:
 *   q         — text search on company or job_title
 *   page      — 1-based page number (default: 1)
 *   pageSize  — number of items per page (default: 20)
 */
router.get('/', async (req, res) => {
  const {
    q = '',
    page = 1,
    pageSize = 20,
    job_location,
    job_type,
    experience_level,
    work_setting,
    h1Type,
    job_category,
    salary_min,
    salary_max
  } = req.query;

  const searchTerm = q.trim();
  const skip = (page - 1) * pageSize;

  const where = {
    ...(searchTerm && {
      OR: [
        { job_title: { contains: searchTerm, mode: 'insensitive' } },
        { company: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }),
    ...(job_location && { job_location: { equals: job_location, mode: 'insensitive' } }),
    ...(job_type && { job_type: { equals: job_type, mode: 'insensitive' } }),
    ...(experience_level && { experience_level: { equals: experience_level, mode: 'insensitive' } }),
    ...(work_setting && { work_setting: { equals: work_setting, mode: 'insensitive' } }),
    ...(h1Type && { h1Type: { equals: h1Type, mode: 'insensitive' } }),
    ...(job_category && { job_category: { equals: job_category, mode: 'insensitive' } }),
    ...(salary_min || salary_max
      ? {
          AND: [
            salary_min && { salary: { gte: salary_min } },
            salary_max && { salary: { lte: salary_max } }
          ].filter(Boolean)
        }
      : {})
  };

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      skip: Number(skip),
      take: Number(pageSize),
      orderBy: { date_posted: 'desc' }
    })
  ]);

  res.json({
    data: jobs,
    pagination: {
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize)
    }
  });
});

router.post('/:id/save', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const jobId = Number(req.params.id);
  if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

  try {
    // upsert so you don’t duplicate saves
    await prisma.userJob.upsert({
      where: {
        userId_jobId_type: { userId, jobId, type: 'saved' }
      },
      update: {},
      create: {
        userId,
        jobId,
        type: 'saved'
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Save job error:', err);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// POST /api/jobs/:id/apply
router.post('/:id/apply', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const jobId = Number(req.params.id);
  if (isNaN(jobId)) return res.status(400).json({ error: 'Invalid job ID' });

  try {
    await prisma.userJob.upsert({
      where: {
        userId_jobId_type: { userId, jobId, type: 'applied' }
      },
      update: {},
      create: {
        userId,
        jobId,
        type: 'applied'
      }
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Apply job error:', err);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
});

export default router;
