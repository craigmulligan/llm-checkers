export default function ErrorMessage({ message }: { message?: string }) {
  if (message) {
    return <div>{message}</div>
  }
}
