import { useNotification } from '../auth/NotificationContext';

export function Toast() {
  const { message, clear } = useNotification();
  if (!message) {
    return null;
  }

  return (
    <div className="mx-auto mb-4 max-w-6xl px-4">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
        <p>{message}</p>
        <button
          type="button"
          onClick={clear}
          className="font-medium text-teal-800"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
