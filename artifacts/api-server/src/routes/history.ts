import { Router, type Request, type Response } from "express";
import { db, scriptsTable } from "@workspace/db";
import { desc, eq, or, and } from "drizzle-orm";

const router = Router();

router.get("/history", async (req: Request, res: Response) => {
  const sessionId = req.headers["x-session-id"] as string | undefined;
  const userId = req.isAuthenticated() ? req.user.id : undefined;

  if (!sessionId && !userId) {
    res.json([]);
    return;
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const conditions = [];
    if (sessionId) conditions.push(eq(scriptsTable.sessionId, sessionId));
    if (userId) conditions.push(eq(scriptsTable.userId, userId));

    const whereClause = conditions.length === 1
      ? conditions[0]
      : or(...conditions as [ReturnType<typeof eq>, ReturnType<typeof eq>]);

    const records = await db
      .select()
      .from(scriptsTable)
      .where(whereClause)
      .orderBy(desc(scriptsTable.createdAt))
      .limit(50);

    const filtered = records.filter((r) => r.createdAt >= thirtyDaysAgo);

    res.json(filtered);
  } catch (err: unknown) {
    req.log.error({ error: String(err) }, "Failed to fetch history");
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.delete("/history/:id", async (req: Request, res: Response) => {
  const id = req.params["id"] as string;
  const sessionId = req.headers["x-session-id"] as string | undefined;
  const userId = req.isAuthenticated() ? req.user.id : undefined;

  if (!sessionId && !userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const ownerConditions = [];
    if (sessionId) ownerConditions.push(eq(scriptsTable.sessionId, sessionId));
    if (userId) ownerConditions.push(eq(scriptsTable.userId, userId));

    const ownerClause = ownerConditions.length === 1
      ? ownerConditions[0]
      : or(...ownerConditions as [ReturnType<typeof eq>, ReturnType<typeof eq>]);

    await db
      .delete(scriptsTable)
      .where(and(eq(scriptsTable.id, id), ownerClause));

    res.json({ success: true });
  } catch (err: unknown) {
    req.log.error({ error: String(err) }, "Failed to delete history record");
    res.status(500).json({ error: "Failed to delete record" });
  }
});

export default router;
