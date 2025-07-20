import type { CaptionTrack } from "@/types/captionTrack.ts";

export interface InnerTubeConfig {
  clientName: string;
  clientVersion: string;
}

export interface PlayerData {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };
}

export const VideoPageHtmlParser = {
  parseInnerTubeConfig: (htmlStringData: string): InnerTubeConfig => {
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
  },

  parseCaptionsFromPlayerData: (playerData: PlayerData): CaptionTrack[] => {
    const captionTracks =
      playerData.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {
      throw new Error("Not found caption tracks in player data");
    }

    return captionTracks;
  },
};
