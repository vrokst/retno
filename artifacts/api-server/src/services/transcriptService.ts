import { YoutubeTranscript } from "youtube-transcript";

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
];

export function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function isYouTubeUrl(input: string): boolean {
  return extractVideoId(input) !== null;
}

export async function fetchTranscript(url: string): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Supported formats: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID");
  }

  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcriptItems
      .map((item) => item.text.trim())
      .filter(Boolean)
      .join(" ");

    if (!text) {
      throw new Error("Transcript is empty");
    }

    return text;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Could not get") || message.includes("disabled") || message.includes("empty")) {
      throw new Error("Could not fetch transcript. Please paste the content manually.");
    }
    throw new Error("Could not fetch transcript. Please paste the content manually.");
  }
}
