import { FileFormat } from "@/converter/converterFactory";

interface Props {
  value: FileFormat;
  onChange: (format: FileFormat) => void;
}

export function FormatSelector(props: Props) {
  return (
    <div class="form-group">
      <label class="form-label" for="format">
        Format:
      </label>
      <select
        id="format"
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
