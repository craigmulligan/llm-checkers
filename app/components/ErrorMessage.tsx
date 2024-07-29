export default function ErrorMessage({ message }: { message?: string }) {
  if (message) {
    return <div className="text-red-500">{message}</div>;
  }
}
