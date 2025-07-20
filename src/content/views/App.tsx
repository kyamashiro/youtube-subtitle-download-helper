import { 
  createSignal, 
  createEffect, 
  createMemo, 
  onMount, 
  onCleanup, 
  Show, 
  For,
  Component,
  JSX,
  Accessor,
  Setter
} from "solid-js";
import { render } from "solid-js/web";
import type { CaptionTrack } from "@/types/captionTrack";
import { ClientYoutube } from "@/client/clientYoutube";
import { ConverterFactory, type FileFormat } from "@/converter/converterFactory";
import "./App.css";

// Types
interface SubtitleData {
  captionTrackList: CaptionTrack[];
  videoId: string;
  videoTitle: string;
  error: Error | null;
}

interface ModalProps {
  subtitleData: SubtitleData;
  onClose: () => void;
}

interface DownloadState {
  isLoading: boolean;
  error: string | null;
}

// Constants
const FORMAT_OPTIONS: Array<{ value: FileFormat; label: string }> = [
  { value: "srt", label: "SRT" },
  { value: "vtt", label: "VTT" },
  { value: "txt", label: "TXT" },
  { value: "csv", label: "CSV" },
  { value: "lrc", label: "LRC" }
];

const YOUTUBE_BUTTON_CLASSES = [
  "yt-spec-button-shape-next",
  "yt-spec-button-shape-next--tonal", 
  "yt-spec-button-shape-next--mono",
  "yt-spec-button-shape-next--size-m",
  "yt-spec-button-shape-next--icon-leading",
  "yt-spec-button-shape-next--enable-backdrop-filter-experiment",
  "subtitle-download-button"
].join(" ");

// Hooks
function useSubtitleData(): [Accessor<SubtitleData | null>, Setter<SubtitleData | null>] {
  const [subtitleData, setSubtitleData] = createSignal<SubtitleData | null>(null);

  onMount(() => {
    const handleDataUpdate = (event: CustomEvent<SubtitleData>) => {
      setSubtitleData(event.detail);
    };

    window.addEventListener('subtitle-data-updated', handleDataUpdate as EventListener);
    
    onCleanup(() => {
      window.removeEventListener('subtitle-data-updated', handleDataUpdate as EventListener);
    });
  });

  return [subtitleData, setSubtitleData];
}

function useDownloadState(): [Accessor<DownloadState>, {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}] {
  const [state, setState] = createSignal<DownloadState>({
    isLoading: false,
    error: null
  });

  return [
    state,
    {
      setLoading: (loading: boolean) => setState(prev => ({ ...prev, isLoading: loading })),
      setError: (error: string | null) => setState(prev => ({ ...prev, error }))
    }
  ];
}

function useDOMInjection(elementRef: Accessor<HTMLElement | undefined>) {
  const inject = () => {
    const element = elementRef();
    const actionsContainer = document.querySelector('#actions-inner .top-level-buttons');
    
    if (actionsContainer && element && !element.parentNode) {
      element.className = "subtitle-download-container";
      actionsContainer.appendChild(element);
      return true;
    } else if (actionsContainer && element && element.parentNode !== actionsContainer) {
      element.className = "subtitle-download-container";
      actionsContainer.appendChild(element);
      return true;
    }
    return false;
  };

  createEffect(() => {
    const element = elementRef();
    if (!element) return;

    const observer = new MutationObserver(inject);
    observer.observe(document.body, { childList: true, subtree: true });

    // Try injection multiple times
    inject();
    setTimeout(inject, 100);
    setTimeout(inject, 500);
    setTimeout(inject, 1000);

    onCleanup(() => observer.disconnect());
  });

  return inject;
}

// Components
const DownloadIcon: Component = () => (
  <div aria-hidden="true" class="yt-spec-button-shape-next__icon">
    <span class="ytIconWrapperHost">
      <span class="yt-icon-shape yt-spec-icon-shape">
        <div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            height="24" 
            viewBox="0 0 24 24" 
            width="24" 
            focusable="false" 
            aria-hidden="true"
          >
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </div>
      </span>
    </span>
  </div>
);

const TouchFeedback: Component = () => (
  <yt-touch-feedback-shape>
    <div aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response">
      <div class="yt-spec-touch-feedback-shape__stroke"></div>
      <div class="yt-spec-touch-feedback-shape__fill"></div>
    </div>
  </yt-touch-feedback-shape>
);

const FormatSelector: Component<{
  value: FileFormat;
  onChange: (format: FileFormat) => void;
}> = (props) => (
  <div class="subtitle-form-group">
    <label class="subtitle-form-label">フォーマットを選択:</label>
    <select 
      value={props.value}
      onChange={(e) => props.onChange(e.target.value as FileFormat)}
      class="subtitle-form-select"
    >
      <For each={FORMAT_OPTIONS}>
        {(option) => <option value={option.value}>{option.label}</option>}
      </For>
    </select>
  </div>
);

const LanguageSelector: Component<{
  tracks: CaptionTrack[];
  value: string;
  onChange: (trackUrl: string) => void;
}> = (props) => (
  <div class="subtitle-form-group">
    <label class="subtitle-form-label">言語を選択:</label>
    <select 
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      class="subtitle-form-select"
    >
      <For each={props.tracks}>
        {(track) => <option value={track.baseUrl}>{track.name.simpleText}</option>}
      </For>
    </select>
  </div>
);

const SubtitleDownloadModal: Component<ModalProps> = (props) => {
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

      converter.convert(xmlResponse, filename);
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

const SubtitleDownloadButton: Component = () => {
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

const App: Component = () => {
  let buttonContainer: HTMLDivElement | undefined;
  
  useDOMInjection(() => buttonContainer);

  return (
    <div ref={buttonContainer} class="subtitle-download-container">
      <SubtitleDownloadButton />
    </div>
  );
};

// Initialization
let isInitialized = false;

function initializeApp(): void {
  if (isInitialized) return;
  
  const init = () => {
    if (document.getElementById('subtitle-download-app')) return;
    
    const container = document.createElement("div");
    container.id = "subtitle-download-app";
    container.style.cssText = "position: absolute; pointer-events: none;";
    document.body.appendChild(container);
    
    render(() => <App />, container);
    isInitialized = true;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}

export default initializeApp;
