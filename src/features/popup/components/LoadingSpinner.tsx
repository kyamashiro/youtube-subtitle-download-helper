interface Props {
  message?: string;
}

export function LoadingSpinner(props: Props) {
  return <div class="loading-text">{props.message || "Loading..."}</div>;
}
