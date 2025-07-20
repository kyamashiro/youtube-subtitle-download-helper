interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function DownloadButton(props: DownloadButtonProps) {
  return (
    <button
      class="download-button"
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
    >
      "Download"
    </button>
  );
}
