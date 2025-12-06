import { type Component, createMemo, createSignal, Show } from 'solid-js'
import { useSubtitleData } from '../hooks/useSubtitleData'
import { Icon } from './Icon.tsx'
import { SubtitleDownloadModal } from './SubtitleDownloadModal'

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
  const [showModal, setShowModal] = createSignal(false)

  const hasValidData = createMemo(() => {
    const data = subtitleData()
    return data && data.captionTrackList.length > 0
  })

  const handleDownloadClick = () => {
    if (!hasValidData()) {
      alert('Subtitle data not found. Please reload the page.')
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <button
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

      <Show when={showModal() && subtitleData()}>
        <SubtitleDownloadModal
          subtitleData={subtitleData()!}
          onClose={() => setShowModal(false)}
        />
      </Show>
    </>
  )
}
