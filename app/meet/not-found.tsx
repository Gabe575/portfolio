export default function NotFound() {
  return (
    <div className="scheduler-card space-y-3">
      <h1 className="text-2xl">This availability link is unavailable</h1>
      <p className="scheduler-muted">
        It may have been deleted, or the link may be incomplete. Please ask the organizer for a new
        link.
      </p>
    </div>
  );
}
