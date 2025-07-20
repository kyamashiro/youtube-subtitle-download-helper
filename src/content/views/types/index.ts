import type { CaptionTrack } from "@/types/captionTrack";

// Re-export commonly used types
export interface SubtitleData {
  captionTrackList: CaptionTrack[];
  videoId: string;
  videoTitle: string;
  error: Error | null;
}

export interface DownloadState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalProps {
  subtitleData: SubtitleData;
  onClose: () => void;
}