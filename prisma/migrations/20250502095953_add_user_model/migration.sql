-- CreateEnum
CREATE TYPE "JobActionType" AS ENUM ('saved', 'applied');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "experience" TEXT,
    "job_location" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "work_setting" TEXT NOT NULL,
    "salary" TEXT,
    "date_posted" TIMESTAMP(3) NOT NULL,
    "h1Type" TEXT,
    "job_link" TEXT NOT NULL,
    "experience_level" TEXT,
    "full_description" TEXT NOT NULL,
    "job_category" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJob" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "type" "JobActionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_job_link_key" ON "Job"("job_link");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserJob_userId_jobId_type_key" ON "UserJob"("userId", "jobId", "type");

-- AddForeignKey
ALTER TABLE "UserJob" ADD CONSTRAINT "UserJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJob" ADD CONSTRAINT "UserJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
