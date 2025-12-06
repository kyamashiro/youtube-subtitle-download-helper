// Download helper for content scripts and popup
export const DownloadHelper = {
  /**
   * Download file from content script or popup
   */
  async downloadFile(
    content: string,
    filename: string,
    mimeType: string,
  ): Promise<void> {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    try {
      // Check if we're in popup context (chrome.downloads available)
      if (typeof chrome !== "undefined" && chrome.downloads) {
        await chrome.downloads.download({
          url: url,
          filename: filename,
        });
      } else {
        // Content script: try to use chrome.downloads via background script
        await new Promise<void>((resolve, reject) => {
          chrome.runtime.sendMessage(
            {
              action: "download",
              url: url,
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
      }
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
      DownloadHelper.fallbackDownload(url, filename);
    } finally {
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
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
