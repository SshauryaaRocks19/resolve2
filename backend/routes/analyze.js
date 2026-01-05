import express from "express";
import { analyzeGaps } from "../services/mlservice.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const result = await analyzeGaps(req.body);
    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "ML service error" });
  }
});

export default router;
