import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addToWishlist,
  getWishlistSlugs,
  removeFromWishlist,
} from '../api';
import { useAuth } from './AuthContext';

type WishlistContextValue = {
  slugs: string[];
  loading: boolean;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSlugs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getWishlistSlugs()
      .then(setSlugs)
      .catch(() => setSlugs([]))
      .finally(() => setLoading(false));
  }, [user]);

  const isSaved = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    async (slug: string) => {
      const next = slugs.includes(slug)
        ? await removeFromWishlist(slug)
        : await addToWishlist(slug);
      setSlugs(next);
    },
    [slugs],
  );

  const value = useMemo(
    () => ({ slugs, loading, isSaved, toggle }),
    [slugs, loading, isSaved, toggle],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside WishlistProvider');
  }
  return context;
}
