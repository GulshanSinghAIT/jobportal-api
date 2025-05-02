import { getAuth } from '@clerk/express';
import { PrismaClient } from '../generated/prisma/index.js'; 

const prisma = new PrismaClient();

export const clerkAuthMiddleware = async (req, res, next) => {
  const { userId } = getAuth(req);
  req.userId = userId;

  if (userId) {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });
  }

  next();
};
