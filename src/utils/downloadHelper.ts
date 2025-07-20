// Download helper for content scripts and popup
export class DownloadHelper {
  /**
   * Download file from content script or popup
   */
  static async downloadFile(content: string, filename: string, mimeType: string): Promise<void> {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    try {
      // Check if we're in popup context (chrome.downloads available)
      if (typeof chrome !== 'undefined' && chrome.downloads) {
        chrome.downloads.download({
          url: url,
          filename: filename
        });
      } else {
        // Content script: try to use chrome.downloads via background script
        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: 'download',
            url: url,
            filename: filename
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response?.error) {
              reject(new Error(response.error));
            } else {
              resolve();
            }
          });
        });
      }
    } catch (error) {
      // Fallback: create download link and click it
      console.warn('Chrome downloads failed, using fallback method:', error);
      DownloadHelper.fallbackDownload(url, filename);
    } finally {
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }

  /**
   * Fallback download method using anchor element
   */
  private static fallbackDownload(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}