interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner(props: LoadingSpinnerProps) {
  return <div class="loading-text">{props.message || "Loading..."}</div>;
}
