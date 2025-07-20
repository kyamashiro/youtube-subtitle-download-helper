interface DownloadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function DownloadButton(props: DownloadButtonProps) {
  return (
    <button
      class="download-button"
      onClick={props.onClick}
      disabled={props.disabled || props.loading}
    >
      {props.loading ? "Downloading..." : "Download"}
    </button>
  );
}