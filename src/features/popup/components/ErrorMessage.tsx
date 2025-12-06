interface Props {
  message: string;
}

export function ErrorMessage(props: Props) {
  return <div class="error-message">{props.message}</div>;
}
