interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage(props: ErrorMessageProps) {
  return <div class="error-message">{props.message}</div>;
}
