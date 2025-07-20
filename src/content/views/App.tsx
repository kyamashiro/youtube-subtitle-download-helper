import type { CaptionTrack } from "@/types/captionTrack";
import { ClientYoutube } from "@/client/clientYoutube";
import { ConverterFactory, type FileFormat } from "@/converter/converterFactory";
import "./App.css";

class SubtitleDownloadButton {
  private container: HTMLElement;
  private isInjected = false;
  private cachedSubtitleData: any = null;

  constructor() {
    this.container = this.createContainer();
    this.injectButton();
    this.setupDataListener();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'subtitle-download-container';
    container.style.cssText = `
      display: inline-block;
      margin-left: 8px;
    `;
    return container;
  }

  private createDownloadButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading yt-spec-button-shape-next--enable-backdrop-filter-experiment';
    button.title = '字幕をダウンロード';
    button.setAttribute('aria-label', '字幕をダウンロード');
    button.style.cssText = `
      cursor: pointer;
    `;

    button.innerHTML = `
      <div aria-hidden="true" class="yt-spec-button-shape-next__icon">
        <span class="ytIconWrapperHost" style="width: 24px; height: 24px;">
          <span class="yt-icon-shape yt-spec-icon-shape">
            <div style="width: 100%; height: 100%; display: block; fill: currentcolor;">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            </div>
          </span>
        </span>
      </div>
      <div class="yt-spec-button-shape-next__button-text-content">字幕</div>
      <yt-touch-feedback-shape style="border-radius: inherit;">
        <div aria-hidden="true" class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response">
          <div class="yt-spec-touch-feedback-shape__stroke"></div>
          <div class="yt-spec-touch-feedback-shape__fill"></div>
        </div>
      </yt-touch-feedback-shape>
    `;

    button.addEventListener('click', () => this.showDownloadMenu());
    return button;
  }

  private injectButton(): void {
    const checkAndInject = () => {
      const actionsContainer = document.querySelector('#actions-inner .top-level-buttons');
      
      if (actionsContainer && !this.isInjected) {
        this.container.appendChild(this.createDownloadButton());
        actionsContainer.appendChild(this.container);
        this.isInjected = true;
        console.log('Subtitle download button injected');
      }
    };

    // Try immediately
    checkAndInject();

    // Also watch for DOM changes
    const observer = new MutationObserver(() => {
      if (!this.isInjected) {
        checkAndInject();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private setupDataListener(): void {
    // Listen for cached data updates from main.ts
    window.addEventListener('subtitle-data-updated', (event: any) => {
      this.cachedSubtitleData = event.detail;
    });
  }

  private showDownloadMenu(): void {
    if (!this.cachedSubtitleData || !this.cachedSubtitleData.captionTrackList.length) {
      alert('字幕データが見つかりません。ページを再読み込みしてください。');
      return;
    }

    this.createDownloadModal();
  }

  private createDownloadModal(): void {
    // Remove existing modal if any
    const existingModal = document.getElementById('subtitle-download-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'subtitle-download-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

    modalContent.innerHTML = `
      <h2 style="margin: 0 0 16px 0; color: #000;">字幕をダウンロード</h2>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; color: #000;">言語を選択:</label>
        <select id="language-select" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          ${this.cachedSubtitleData.captionTrackList.map((track: CaptionTrack) => 
            `<option value="${track.baseUrl}">${track.name.simpleText}</option>`
          ).join('')}
        </select>
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; color: #000;">フォーマットを選択:</label>
        <select id="format-select" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
          <option value="srt">SRT</option>
          <option value="vtt">VTT</option>
          <option value="txt">TXT</option>
          <option value="csv">CSV</option>
          <option value="lrc">LRC</option>
        </select>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="cancel-btn" style="padding: 8px 16px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">キャンセル</button>
        <button id="download-btn" style="padding: 8px 16px; border: none; background: #1976d2; color: white; border-radius: 4px; cursor: pointer;">ダウンロード</button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add event listeners
    const cancelBtn = modal.querySelector('#cancel-btn') as HTMLButtonElement;
    const downloadBtn = modal.querySelector('#download-btn') as HTMLButtonElement;
    const languageSelect = modal.querySelector('#language-select') as HTMLSelectElement;
    const formatSelect = modal.querySelector('#format-select') as HTMLSelectElement;

    cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    downloadBtn.addEventListener('click', async () => {
      const selectedTrack = languageSelect.value;
      const selectedFormat = formatSelect.value as FileFormat;
      
      await this.downloadSubtitle(selectedTrack, selectedFormat);
      modal.remove();
    });
  }

  private async downloadSubtitle(selectedTrack: string, selectedFormat: FileFormat): Promise<void> {
    try {
      const selectedTrackData = this.cachedSubtitleData.captionTrackList.find(
        (track: CaptionTrack) => track.baseUrl === selectedTrack
      );

      if (!selectedTrackData) {
        throw new Error('選択された字幕トラックが見つかりません');
      }

      // Get subtitle XML
      const xmlResponse = await ClientYoutube.getSubtitle(selectedTrack);

      // Convert to selected format
      const converterFactory = new ConverterFactory();
      const converter = converterFactory.create(selectedFormat);
      const content = selectedTrackData.name.simpleText;
      const filename = `${this.cachedSubtitleData.videoTitle} - ${content}`;

      converter.convert(xmlResponse, filename);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download error:', error);
      alert(`ダウンロードに失敗しました: ${error.message || error}`);
    }
  }
}

// Initialize the download button when DOM is ready
function initializeApp() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SubtitleDownloadButton());
  } else {
    new SubtitleDownloadButton();
  }
}

export default initializeApp;
