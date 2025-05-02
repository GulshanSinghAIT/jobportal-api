import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { clerkAuthMiddleware } from "./middleware/authMiddleware.js";
import jobs from "./api/jobs.js";
import user from "./api/user.js";
import cron from "node-cron";
import fetch from "node-fetch";
const app = express();

// 1️⃣ Clerk’s middleware with optional config
app.use(clerkMiddleware({
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY
}));

// 2️⃣ Standard middleware
app.use(cors());
app.use(express.json());

// 3️⃣ Your custom auth middleware
app.use(clerkAuthMiddleware);

// 4️⃣ Routes
app.get("/", (req, res) => res.send("API Running"));
app.use("/api/jobs", jobs);
app.use('/api/user', user);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

cron.schedule("*/5 * * * *", async () => {
  try {
    const response = await fetch("https://jobportal-api-2nhd.onrender.com/api/jobs");
    const status = response.status;
    console.log(`[CRON] Pinged jobs endpoint. Status: ${status}`);
  } catch (error) {
    console.error("[CRON] Failed to ping jobs endpoint:", error.message);
  }
});
