import { Component, createSignal, createEffect, createMemo, JSX } from "solid-js";
import { ClientYoutube } from "@/client/clientYoutube";
import { ConverterFactory, type FileFormat } from "@/converter/converterFactory";
import { useDownloadState } from "../hooks/useDownloadState";
import { FormatSelector } from "./FormatSelector";
import { LanguageSelector } from "./LanguageSelector";
import type { SubtitleData, ModalProps } from "../types";

export const SubtitleDownloadModal: Component<ModalProps> = (props) => {
  const [selectedTrack, setSelectedTrack] = createSignal("");
  const [selectedFormat, setSelectedFormat] = createSignal<FileFormat>("srt");
  const [downloadState, { setLoading, setError }] = useDownloadState();

  // Initialize selected track
  createEffect(() => {
    const tracks = props.subtitleData.captionTrackList;
    if (tracks.length > 0 && !selectedTrack()) {
      setSelectedTrack(tracks[0].baseUrl);
    }
  });

  // Memoized selected track data
  const selectedTrackData = createMemo(() => 
    props.subtitleData.captionTrackList.find(
      track => track.baseUrl === selectedTrack()
    )
  );

  const handleDownload = async () => {
    const trackData = selectedTrackData();
    if (!trackData || downloadState().isLoading) return;

    try {
      setLoading(true);
      setError(null);

      const xmlResponse = await ClientYoutube.getSubtitle(selectedTrack());
      const converterFactory = new ConverterFactory();
      const converter = converterFactory.create(selectedFormat());
      const filename = `${props.subtitleData.videoTitle} - ${trackData.name.simpleText}`;

      await converter.convert(xmlResponse, filename);
      props.onClose();
    } catch (error: any) {
      console.error('Download error:', error);
      setError(error.message || 'ダウンロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  // Show error if exists
  createEffect(() => {
    const error = downloadState().error;
    if (error) {
      alert(`ダウンロードエラー: ${error}`);
      setError(null);
    }
  });

  return (
    <div class="subtitle-modal-overlay" onClick={handleBackdropClick}>
      <div class="subtitle-modal-content">
        <h2 class="subtitle-modal-header">字幕をダウンロード</h2>
        
        <LanguageSelector
          tracks={props.subtitleData.captionTrackList}
          value={selectedTrack()}
          onChange={setSelectedTrack}
        />
        
        <FormatSelector
          value={selectedFormat()}
          onChange={setSelectedFormat}
        />
        
        <div class="subtitle-button-container">
          <button 
            onClick={props.onClose}
            class="subtitle-button subtitle-button-cancel"
            disabled={downloadState().isLoading}
          >
            キャンセル
          </button>
          <button 
            onClick={handleDownload}
            disabled={downloadState().isLoading || !selectedTrackData()}
            class={`subtitle-button subtitle-button-download ${
              downloadState().isLoading ? 'subtitle-button-download--loading' : ''
            }`}
          >
            {downloadState().isLoading ? "ダウンロード中..." : "ダウンロード"}
          </button>
        </div>
      </div>
    </div>
  );
};