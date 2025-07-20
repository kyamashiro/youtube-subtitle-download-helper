import { createSignal, createEffect, onMount, onCleanup, Show, For } from "solid-js";
import { render } from "solid-js/web";
import type { CaptionTrack } from "@/types/captionTrack";
import { ClientYoutube } from "@/client/clientYoutube";
import { ConverterFactory, type FileFormat } from "@/converter/converterFactory";
import "./App.css";

interface SubtitleData {
  captionTrackList: CaptionTrack[];
  videoId: string;
  videoTitle: string;
  error: Error | null;
}

function SubtitleDownloadModal(props: {
  subtitleData: SubtitleData;
  onClose: () => void;
}) {
  const [selectedTrack, setSelectedTrack] = createSignal("");
  const [selectedFormat, setSelectedFormat] = createSignal<FileFormat>("srt");
  const [isDownloading, setIsDownloading] = createSignal(false);

  onMount(() => {
    if (props.subtitleData.captionTrackList.length > 0) {
      setSelectedTrack(props.subtitleData.captionTrackList[0].baseUrl);
    }
  });

  const handleDownload = async () => {
    if (isDownloading()) return;

    try {
      setIsDownloading(true);
      
      const selectedTrackData = props.subtitleData.captionTrackList.find(
        (track) => track.baseUrl === selectedTrack()
      );

      if (!selectedTrackData) {
        throw new Error('選択された字幕トラックが見つかりません');
      }

      // Get subtitle XML
      const xmlResponse = await ClientYoutube.getSubtitle(selectedTrack());

      // Convert to selected format
      const converterFactory = new ConverterFactory();
      const converter = converterFactory.create(selectedFormat());
      const content = selectedTrackData.name.simpleText;
      const filename = `${props.subtitleData.videoTitle} - ${content}`;

      converter.convert(xmlResponse, filename);
      
      console.log('Download completed successfully');
      props.onClose();
    } catch (error: any) {
      console.error('Download error:', error);
      alert(`ダウンロードに失敗しました: ${error.message || error}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <div class="subtitle-modal-overlay" onClick={handleBackdropClick}>
      <div class="subtitle-modal-content">
        <h2 class="subtitle-modal-header">字幕をダウンロード</h2>
        
        <div class="subtitle-form-group">
          <label class="subtitle-form-label">言語を選択:</label>
          <select 
            value={selectedTrack()}
            onChange={(e) => setSelectedTrack(e.target.value)}
            class="subtitle-form-select"
          >
            <For each={props.subtitleData.captionTrackList}>
              {(track) => (
                <option value={track.baseUrl}>{track.name.simpleText}</option>
              )}
            </For>
          </select>
        </div>
        
        <div class="subtitle-form-group">
          <label class="subtitle-form-label">フォーマットを選択:</label>
          <select 
            value={selectedFormat()}
            onChange={(e) => setSelectedFormat(e.target.value as FileFormat)}
            class="subtitle-form-select"
          >
            <option value="srt">SRT</option>
            <option value="vtt">VTT</option>
            <option value="txt">TXT</option>
            <option value="csv">CSV</option>
            <option value="lrc">LRC</option>
          </select>
        </div>
        
        <div class="subtitle-button-container">
          <button 
            onClick={props.onClose}
            class="subtitle-button subtitle-button-cancel"
          >
            キャンセル
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading()}
            class={`subtitle-button subtitle-button-download ${isDownloading() ? 'subtitle-button-download--loading' : ''}`}
          >
            {isDownloading() ? "ダウンロード中..." : "ダウンロード"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubtitleDownloadButton() {
  const [subtitleData, setSubtitleData] = createSignal<SubtitleData | null>(null);
  const [showModal, setShowModal] = createSignal(false);

  onMount(() => {
    // Listen for cached data updates from main.ts
    const handleDataUpdate = (event: CustomEvent) => {
      setSubtitleData(event.detail);
    };

    window.addEventListener('subtitle-data-updated', handleDataUpdate as EventListener);
    
    onCleanup(() => {
      window.removeEventListener('subtitle-data-updated', handleDataUpdate as EventListener);
    });
  });

  const handleDownloadClick = () => {
    const data = subtitleData();
    if (!data || !data.captionTrackList.length) {
      alert('字幕データが見つかりません。ページを再読み込みしてください。');
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button 
        class="yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--enable-backdrop-filter-experiment subtitle-download-button"
        title="字幕をダウンロード"
        aria-label="字幕をダウンロード"
        onClick={handleDownloadClick}
      >
        <div aria-hidden="true" class="yt-spec-button-shape-next__icon">
          <span class="ytIconWrapperHost">
            <span class="yt-icon-shape yt-spec-icon-shape">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </div>
            </span>
          </span>
        </div>
        <div class="yt-spec-button-shape-next__button-text-content">字幕</div>
        <yt-touch-feedback-shape>
          <div aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response">
            <div class="yt-spec-touch-feedback-shape__stroke"></div>
            <div class="yt-spec-touch-feedback-shape__fill"></div>
          </div>
        </yt-touch-feedback-shape>
      </button>
      
      <Show when={showModal() && subtitleData()}>
        <SubtitleDownloadModal 
          subtitleData={subtitleData()!}
          onClose={() => setShowModal(false)}
        />
      </Show>
    </>
  );
}

function App() {
  let buttonContainer: HTMLDivElement | undefined;

  createEffect(() => {
    console.log('App createEffect triggered, container:', buttonContainer);
    
    if (buttonContainer) {
      const injectButton = () => {
        const actionsContainer = document.querySelector('#actions-inner .top-level-buttons');
        console.log('Actions container found:', actionsContainer);
        console.log('Button container:', buttonContainer);
        console.log('Container parent:', buttonContainer?.parentNode);
        
        if (actionsContainer && buttonContainer && !buttonContainer.parentNode) {
          buttonContainer.className = "subtitle-download-container";
          actionsContainer.appendChild(buttonContainer);
          console.log('Subtitle download button injected successfully');
        } else if (actionsContainer && buttonContainer && buttonContainer.parentNode !== actionsContainer) {
          // If container is in wrong place, move it
          buttonContainer.className = "subtitle-download-container";
          actionsContainer.appendChild(buttonContainer);
          console.log('Subtitle download button moved to correct location');
        }
      };

      // Try immediately
      injectButton();

      // Wait a bit for the DOM to be ready
      setTimeout(injectButton, 100);
      setTimeout(injectButton, 500);
      setTimeout(injectButton, 1000);

      // Also watch for DOM changes
      const observer = new MutationObserver(() => {
        injectButton();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      onCleanup(() => {
        observer.disconnect();
      });
    }
  });

  return (
    <div ref={buttonContainer} class="subtitle-download-container">
      <SubtitleDownloadButton />
    </div>
  );
}

// Initialize the app
function initializeApp() {
  console.log('Initializing subtitle download app');
  
  const init = () => {
    // Check if already initialized
    if (document.getElementById('subtitle-download-app')) {
      console.log('App already initialized');
      return;
    }
    
    const container = document.createElement("div");
    container.id = "subtitle-download-app";
    container.style.cssText = "position: absolute; pointer-events: none;";
    document.body.appendChild(container);
    
    console.log('App container created and added to body');
    
    render(() => <App />, container);
    console.log('SolidJS app rendered');
  };

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Try immediately and with delays
    init();
    setTimeout(init, 100);
    setTimeout(init, 500);
  }
}

export default initializeApp;
