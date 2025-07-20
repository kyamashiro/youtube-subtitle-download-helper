import type { CaptionTrack } from "../../type/captionTrack";

interface LanguageSelectorProps {
  tracks: CaptionTrack[];
  value: string;
  onChange: (trackUrl: string) => void;
}

export function LanguageSelector(props: LanguageSelectorProps) {
  return (
    <div class="form-group">
      <label class="form-label">Language:</label>
      <select
        class="form-select"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.tracks.map((track) => (
          <option value={track.baseUrl}>{track.name.simpleText}</option>
        ))}
      </select>
    </div>
  );
}
