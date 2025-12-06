import { type Component, createMemo, createSignal, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { useSubtitleData } from '../hooks/useSubtitleData'
import { Icon } from './Icon.tsx'
import { SubtitleDownloadPopup } from './SubtitleDownloadPopup'

// Constants
const YOUTUBE_BUTTON_CLASSES = [
  'yt-spec-button-shape-next',
  'yt-spec-button-shape-next--tonal',
  'yt-spec-button-shape-next--mono',
  'yt-spec-button-shape-next--size-m',
  'yt-spec-button-shape-next--icon-leading',
  'yt-spec-button-shape-next--enable-backdrop-filter-experiment',
  'subtitle-download-button',
].join(' ')

export const SubtitleDownloadButton: Component = () => {
  const [subtitleData] = useSubtitleData()
  const [showPopup, setShowPopup] = createSignal(false)
  const [position, setPosition] = createSignal({ top: 0, left: 0 })
  let buttonRef: HTMLButtonElement | undefined

  const hasValidData = createMemo(() => {
    const data = subtitleData()
    return data && data.captionTrackList.length > 0
  })

  const handleDownloadClick = () => {
    if (!hasValidData()) {
      alert('Subtitle data not found. Please reload the page.')
      return
    }
    
    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX
      setPosition({
        top: rect.bottom + scrollY + 8, // 8px margin
        left: rect.left + scrollX,
      })
    }

    setShowPopup(!showPopup())
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        class={YOUTUBE_BUTTON_CLASSES}
        title="Subtitle Download"
        onClick={handleDownloadClick}
        disabled={!hasValidData()}
      >
        <Icon />
        <div class="yt-spec-button-shape-next__button-text-content">
          Subtitle
        </div>
      </button>

      <Show when={showPopup() && subtitleData()}>
        <Portal>
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              'z-index': 9998 
            }}
            onClick={() => setShowPopup(false)}
          />
          <SubtitleDownloadPopup
            subtitleData={subtitleData()!}
            onClose={() => setShowPopup(false)}
            style={{
              top: `${position().top}px`,
              left: `${position().left}px`,
              position: 'absolute',
              'z-index': 9999
            }}
          />
        </Portal>
      </Show>
    </>
  )
}
