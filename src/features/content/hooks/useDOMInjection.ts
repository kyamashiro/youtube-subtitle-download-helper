import {
  type Accessor,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

export function useDOMInjection(elementRef: Accessor<HTMLElement | undefined>) {
  const [isInjected, setIsInjected] = createSignal(false);

  const inject = () => {
    if (isInjected()) return true;

    const element = elementRef();
    const actionsContainer = document.querySelector(
      "#actions-inner .top-level-buttons",
    );

    if (actionsContainer && element && !element.parentNode) {
      element.className = "subtitle-download-container";
      actionsContainer.appendChild(element);
      setIsInjected(true);
      return true;
    } else if (
      actionsContainer &&
      element &&
      element.parentNode !== actionsContainer
    ) {
      element.className = "subtitle-download-container";
      actionsContainer.appendChild(element);
      setIsInjected(true);
      return true;
    }
    return false;
  };

  createEffect(() => {
    const element = elementRef();
    if (!element) return;

    // Watch for YouTube navigation changes
    const observer = new MutationObserver(() => {
      if (!isInjected()) {
        inject();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial injection attempt
    inject();

    onCleanup(() => {
      observer.disconnect();
      setIsInjected(false);
    });
  });

  // Reset injection status when URL changes (YouTube SPA navigation)
  onMount(() => {
    const checkUrlChange = () => {
      setIsInjected(false);
    };

    window.addEventListener("popstate", checkUrlChange);

    // Also watch for pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      checkUrlChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      checkUrlChange();
    };

    onCleanup(() => {
      window.removeEventListener("popstate", checkUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    });
  });

  return inject;
}
