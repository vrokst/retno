import { Router } from "express";

const router = Router();

router.post("/transcript", async (req, res) => {
  res.status(501).json({ error: "Not implemented yet — YouTube transcript integration coming in Phase 2" });
});

export default router;
