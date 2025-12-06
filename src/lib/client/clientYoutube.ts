import { err, ok, type Result } from "@/shared/types/result";
import type { InnerTubeConfig, PlayerData } from "@/shared/types/youtube";

/**
 * Get HTML content of YouTube video page
 * @param videoId
 */
export const getVideoPageHtml = async (
  videoId: string,
): Promise<Result<string>> => {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    if (!response.ok) {
      return err(new Error(response.statusText));
    }
    const text = await response.text();
    return ok(text);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Unknown error"));
  }
};

export const getSubtitle = async (baseUrl: string): Promise<Result<string>> => {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      return err(new Error(response.statusText));
    }
    const text = await response.text();
    return ok(text);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Unknown error"));
  }
};

export const getPlayerData = async (
  videoId: string,
  innerTubeConfig: InnerTubeConfig,
): Promise<Result<PlayerData>> => {
  const requestBody = {
    context: {
      client: {
        clientName: innerTubeConfig.clientName,
        clientVersion: innerTubeConfig.clientVersion,
      },
    },
    videoId: videoId,
  };

  try {
    const response = await fetch("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return err(
        new Error(`INNERTUBE API request failed: ${response.statusText}`),
      );
    }

    const data = await response.json();
    return ok(data);
  } catch (e) {
    return err(e instanceof Error ? e : new Error("Unknown error"));
  }
};
