import type { CaptionTrack } from './captionTrack'

export interface InnerTubeConfig {
  clientName: string
  clientVersion: string
}

export interface PlayerData {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[]
    }
  }
}
