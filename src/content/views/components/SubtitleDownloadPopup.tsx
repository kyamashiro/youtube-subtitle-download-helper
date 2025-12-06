import { type Component, createMemo } from 'solid-js'
import { getSubtitle } from '@/client/clientYoutube'
import { FormatSelector } from '@/components/FormatSelector'
import { LanguageSelector } from '@/components/LanguageSelector'
import { createConverter } from '@/converter/converterFactory'
import { useSubtitleSelection } from '@/hooks/useSubtitleSelection'
import type { JSX } from 'solid-js'
import type { ModalProps } from '../types'

interface PopupProps extends ModalProps {
  style?: JSX.CSSProperties
}

export const SubtitleDownloadPopup: Component<PopupProps> = (props) => {
  const { selectedTrack, setSelectedTrack, selectedFormat, setSelectedFormat } =
    useSubtitleSelection({
      captionTracks: () => props.subtitleData.captionTrackList,
    })

  // Memoized selected track data
  const selectedTrackData = createMemo(() =>
    props.subtitleData.captionTrackList.find(
      (track) => track.baseUrl === selectedTrack(),
    ),
  )

  const handleDownload = async () => {
    const trackData = selectedTrackData()
    if (!trackData) return

    try {
      const result = await getSubtitle(selectedTrack())
      if (!result.success) {
        throw result.error
      }

      const xmlResponse = result.value
      const converter = createConverter(selectedFormat())
      const filename = `${props.subtitleData.videoTitle} - ${trackData.name.simpleText}`

      await converter.convert(xmlResponse, filename)
      props.onClose()
    } catch (error: any) {
      console.error('Download error:', error)
    }
  }

  return (
    <div class="subtitle-popup" style={props.style}>
      <div class="subtitle-popup-content">
        <LanguageSelector
          tracks={props.subtitleData.captionTrackList}
          value={selectedTrack()}
          onChange={setSelectedTrack}
        />

        <FormatSelector value={selectedFormat()} onChange={setSelectedFormat} />
      </div>

      <div class="subtitle-button-container">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!selectedTrackData()}
          class="subtitle-button subtitle-button-download"
        >
          Download
        </button>
      </div>
    </div>
  )
}
