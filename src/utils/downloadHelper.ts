// Download helper for content scripts and popup
export const DownloadHelper = {
  /**
   * Convert string content to base64 data URL
   */
  toDataUrl(content: string, mimeType: string): string {
    // Encode content to base64, handling UTF-8 properly
    const encoder = new TextEncoder();
    const utf8Bytes = encoder.encode(content);
    let binary = "";
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:${mimeType};base64,${base64}`;
  },

  /**
   * Download file from content script or popup
   * Always uses background script to avoid popup context instability
   */
  async downloadFile(
    content: string,
    filename: string,
    mimeType: string,
  ): Promise<void> {
    // Use data URL instead of blob URL to avoid cross-context issues
    const dataUrl = this.toDataUrl(content, mimeType);

    try {
      // Always use background script for downloads
      // This avoids issues with popup context closing mid-download
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "download",
            url: dataUrl,
            filename: filename,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response?.error) {
              reject(new Error(response.error));
            } else {
              resolve();
            }
          },
        );
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Ignore user cancellation
      if (
        errorMessage.includes("User cancelled") ||
        errorMessage.includes("canceled")
      ) {
        console.log("Download cancelled by user");
        return;
      }

      // Handle extension context invalidation (requires reload)
      if (errorMessage.includes("Extension context invalidated")) {
        console.error("Extension context invalidated. Please reload the page.");
        alert(
          "Extension updated or context invalidated. Please reload the page to continue.",
        );
        return;
      }

      // Fallback for other errors
      console.warn("Chrome downloads failed, using fallback method:", error);
      DownloadHelper.fallbackDownload(dataUrl, filename);
    }
    // No need to clean up data URLs - they don't allocate resources like blob URLs
  },

  /**
   * Fallback download method using anchor element
   */
  fallbackDownload(url: string, filename: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
