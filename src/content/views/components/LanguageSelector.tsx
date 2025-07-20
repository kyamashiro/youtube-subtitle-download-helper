import { type Component, For } from 'solid-js'
import type { CaptionTrack } from '@/types/captionTrack'

interface LanguageSelectorProps {
  tracks: CaptionTrack[]
  value: string
  onChange: (trackUrl: string) => void
}

export const LanguageSelector: Component<LanguageSelectorProps> = (props) => (
  <div class="subtitle-form-group">
    <label for={'language'} class="subtitle-form-label">
      言語を選択:
    </label>
    <select
      id={'language'}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      class="subtitle-form-select"
    >
      <For each={props.tracks}>
        {(track) => (
          <option value={track.baseUrl}>{track.name.simpleText}</option>
        )}
      </For>
    </select>
  </div>
)
