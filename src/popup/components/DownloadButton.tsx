interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function DownloadButton(props: Props) {
  return (
    <button
      type="button"
      class="download-button"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      Download
    </button>
  );
}
