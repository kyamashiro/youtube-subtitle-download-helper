interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
  return <div class="loading-text">{props.message || "Loading..."}</div>;
}
