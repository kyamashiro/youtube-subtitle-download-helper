interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage(props: ErrorMessageProps) {
  return (
    <div class="error-message">
      {props.message}
    </div>
  );
}