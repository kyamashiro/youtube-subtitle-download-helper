import type { CaptionTrack } from "@/shared/types/captionTrack.ts";
import type { InnerTubeConfig, PlayerData } from "@/shared/types/youtube";

export const parseInnerTubeConfig = (
  htmlStringData: string,
): InnerTubeConfig => {
  const clientNameMatch = /"INNERTUBE_CLIENT_NAME":\s*"([^"]+)"/g.exec(
    htmlStringData,
  );
  const clientVersionMatch = /"INNERTUBE_CLIENT_VERSION":\s*"([^"]+)"/g.exec(
    htmlStringData,
  );

  if (!clientNameMatch || !clientVersionMatch) {
    throw new Error("Not found INNERTUBE client configuration");
  }

  return {
    clientName: clientNameMatch[1],
    clientVersion: clientVersionMatch[1],
  };
};

/**
 * Read the player response that YouTube embeds in the scripts on a watch page.
 * This avoids making a second player request when the current page already has
 * the response and its caption track URLs.
 */
export const parsePlayerDataFromScripts = (
  scriptTexts: Iterable<string>,
): PlayerData => {
  for (const scriptText of scriptTexts) {
    const marker = "ytInitialPlayerResponse";
    const markerIndex = scriptText.indexOf(marker);
    if (markerIndex < 0) continue;

    const objectStart = scriptText.indexOf("{", markerIndex + marker.length);
    if (objectStart < 0) continue;

    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = objectStart; index < scriptText.length; index += 1) {
      const char = scriptText[index];

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
      } else if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return JSON.parse(scriptText.slice(objectStart, index + 1)) as PlayerData;
        }
      }
    }
  }

  throw new Error("Not found ytInitialPlayerResponse in page scripts");
};

export const parseCaptionsFromPlayerData = (
  playerData: PlayerData,
): CaptionTrack[] => {
  const captionTracks =
    playerData.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!captionTracks || captionTracks.length === 0) {
    throw new Error("Not found caption tracks in player data");
  }

  return captionTracks;
};
