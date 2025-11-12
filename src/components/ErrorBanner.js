export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="card error">
      <strong>Error:</strong> {message}
    </div>
  );
}
