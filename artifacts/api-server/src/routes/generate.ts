import { Router, type Request, type Response } from "express";
import { isYouTubeUrl, fetchTranscript } from "../services/transcriptService.js";
import { generateScripts } from "../services/scriptGenerator.js";
import { db, scriptsTable } from "@workspace/db";

const router = Router();

router.post("/generate", async (req: Request, res: Response) => {
  const { input, language = "English", tone = "Viral & Energetic" } = req.body as {
    input?: string;
    language?: string;
    tone?: string;
  };

  if (!input || typeof input !== "string" || !input.trim()) {
    res.status(400).json({ success: false, error: "Please provide a YouTube URL or text idea." });
    return;
  }

  const trimmed = input.trim();
  let contentText = trimmed;
  let inputType: "youtube" | "text" = "text";

  if (isYouTubeUrl(trimmed)) {
    inputType = "youtube";
    try {
      contentText = await fetchTranscript(trimmed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not fetch transcript. Please paste the content manually.";
      res.status(400).json({ success: false, error: message });
      return;
    }
  }

  try {
    const { scripts, modelUsed } = await generateScripts(
      contentText,
      inputType === "youtube" ? "YouTube video transcript" : "user-provided text or idea",
      language,
      tone
    );

    res.json({ success: true, scripts, modelUsed, inputType });

    // Silently save to DB — never block or fail the response
    const sessionId = req.headers["x-session-id"] as string | undefined;
    const userId = req.isAuthenticated() ? req.user.id : undefined;
    db.insert(scriptsTable).values({
      sessionId: sessionId ?? null,
      userId: userId ?? null,
      inputText: trimmed.slice(0, 2000),
      inputType,
      scripts: scripts as unknown as Record<string, unknown>[],
      modelUsed,
      language,
      tone,
    }).execute().catch((saveErr: unknown) => {
      req.log.warn({ error: String(saveErr) }, "Failed to save scripts to DB (non-fatal)");
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Script generation failed. Please try again.";
    req.log.error({ error: message }, "Script generation error");

    if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("quota") || message.includes("429")) {
      res.status(503).json({
        success: false,
        error: "Rate limit reached on the free tier. Please wait a minute and try again.",
      });
      return;
    }

    res.status(500).json({ success: false, error: "Failed to generate scripts. Please try again." });
  }
});

export default router;
