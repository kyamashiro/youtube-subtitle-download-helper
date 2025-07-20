interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function DownloadButton(props: DownloadButtonProps) {
  return (
    <button
      class="download-button"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      Download
    </button>
  );
}
