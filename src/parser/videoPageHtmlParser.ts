import type { CaptionTrack } from "@/types/captionTrack.ts";
import type { InnerTubeConfig, PlayerData } from "@/types/youtube";

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
