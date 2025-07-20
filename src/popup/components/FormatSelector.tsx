import { FileFormat } from "../../converter/converterFactory";

interface FormatSelectorProps {
  value: FileFormat;
  onChange: (format: FileFormat) => void;
}

export function FormatSelector(props: FormatSelectorProps) {
  return (
    <div class="form-group">
      <label class="form-label">Format:</label>
      <select
        class="form-select"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as FileFormat)}
      >
        {Object.values(FileFormat).map((format) => (
          <option value={format}>.{format}</option>
        ))}
      </select>
    </div>
  );
}
