const { PrismaClient } = require('./generated/prisma');
const fs = require('fs');

const prisma = new PrismaClient();
const jobs = JSON.parse(fs.readFileSync('./j.json', 'utf-8'));

// Example Clerk user IDs for testing
const testUserIds = ['user_abc123', 'user_def456'];

async function main() {
  console.log('🌱 Seeding started...');

  // 1. Create test users (if not already there)
  for (const id of testUserIds) {
    await prisma.user.upsert({
      where: { id },
      update: {},
      create: { id },
    });
  }

  // 2. Seed Jobs in chunks
  const CHUNK_SIZE = 100;
  for (let i = 0; i < jobs.length; i += CHUNK_SIZE) {
    const chunk = jobs.slice(i, i + CHUNK_SIZE);
    try {
      await prisma.job.createMany({
        data: chunk.map((job) => ({
          company: job.company,
          job_title: job.job_title,
          experience: job.experience || null,
          job_location: job.job_location,
          job_type: job.job_type,
          work_setting: job['work setting'],
          salary: job.salary || null,
          date_posted: new Date(job.date_posted),
          h1Type: job.h1Type || null,
          job_link: job.job_link,
          experience_level: job.experience_level || null,
          full_description: job.full_description,
          job_category: job.job_category,
        })),
        skipDuplicates: true,
      });
      console.log(`✅ Inserted chunk ${i / CHUNK_SIZE + 1}`);
    } catch (err) {
      console.error('❌ Error inserting jobs:', err.message);
    }
  }

  // 3. Optionally, randomly bookmark/apply some jobs for demo users
  const allJobs = await prisma.job.findMany({ take: 20 }); // just the first 20
  for (const userId of testUserIds) {
    for (const job of allJobs.slice(0, 10)) {
      await prisma.userJob.create({
        data: {
          userId,
          jobId: job.id,
          type: 'saved',
        },
      });
    }
    for (const job of allJobs.slice(10, 15)) {
      await prisma.userJob.create({
        data: {
          userId,
          jobId: job.id,
          type: 'applied',
        },
      });
    }
  }

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
