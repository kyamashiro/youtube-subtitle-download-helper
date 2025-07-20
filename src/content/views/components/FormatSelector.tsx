import { type Component, For } from 'solid-js'
import type { FileFormat } from '@/converter/converterFactory'

// Constants
const FORMAT_OPTIONS: Array<{ value: FileFormat; label: string }> = [
  { value: 'srt', label: 'SRT' },
  { value: 'vtt', label: 'VTT' },
  { value: 'txt', label: 'TXT' },
  { value: 'csv', label: 'CSV' },
  { value: 'lrc', label: 'LRC' },
]

interface FormatSelectorProps {
  value: FileFormat
  onChange: (format: FileFormat) => void
}

export const FormatSelector: Component<FormatSelectorProps> = (props) => (
  <div class="subtitle-form-group">
    <label for={'format'} class="subtitle-form-label">
      フォーマットを選択:
    </label>
    <select
      id={'format'}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value as FileFormat)}
      class="subtitle-form-select"
    >
      <For each={FORMAT_OPTIONS}>
        {(option) => <option value={option.value}>{option.label}</option>}
      </For>
    </select>
  </div>
)
