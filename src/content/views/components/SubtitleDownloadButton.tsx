import { Component, createSignal, createMemo, Show } from "solid-js";
import { useSubtitleData } from "../hooks/useSubtitleData";
import { SubtitleDownloadModal } from "./SubtitleDownloadModal";
import { DownloadIcon } from "./DownloadIcon";
import { TouchFeedback } from "./TouchFeedback";

// Constants
const YOUTUBE_BUTTON_CLASSES = [
  "yt-spec-button-shape-next",
  "yt-spec-button-shape-next--tonal", 
  "yt-spec-button-shape-next--mono",
  "yt-spec-button-shape-next--size-m",
  "yt-spec-button-shape-next--icon-leading",
  "yt-spec-button-shape-next--enable-backdrop-filter-experiment",
  "subtitle-download-button"
].join(" ");

export const SubtitleDownloadButton: Component = () => {
  const [subtitleData] = useSubtitleData();
  const [showModal, setShowModal] = createSignal(false);

  const hasValidData = createMemo(() => {
    const data = subtitleData();
    return data && data.captionTrackList.length > 0;
  });

  const handleDownloadClick = () => {
    if (!hasValidData()) {
      alert('字幕データが見つかりません。ページを再読み込みしてください。');
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button 
        class={YOUTUBE_BUTTON_CLASSES}
        title="字幕をダウンロード"
        aria-label="字幕をダウンロード"
        onClick={handleDownloadClick}
        disabled={!hasValidData()}
      >
        <DownloadIcon />
        <div class="yt-spec-button-shape-next__button-text-content">字幕</div>
        <TouchFeedback />
      </button>
      
      <Show when={showModal() && subtitleData()}>
        <SubtitleDownloadModal 
          subtitleData={subtitleData()!}
          onClose={() => setShowModal(false)}
        />
      </Show>
    </>
  );
};