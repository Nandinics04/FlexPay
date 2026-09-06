import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type NotificationContextValue = {
  message: string | null;
  notify: (message: string) => void;
  clear: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const notify = useCallback((next: string) => {
    setMessage(next);
    window.setTimeout(() => setMessage(null), 6000);
  }, []);

  const clear = useCallback(() => setMessage(null), []);

  const value = useMemo(
    () => ({ message, notify, clear }),
    [message, notify, clear],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used inside NotificationProvider');
  }
  return context;
}
