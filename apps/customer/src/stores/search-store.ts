import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchHistoryItem {
  id: string;
  query: string;
  results: number;
  createdAt: string;
}

export interface SearchFilterState {
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  tags?: string[];
  gender?: ('men' | 'women' | 'unisex')[];
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface SearchSortState {
  field:
    | 'relevance'
    | 'newest'
    | 'price_asc'
    | 'price_desc'
    | 'rating'
    | 'popularity';
  order: 'asc' | 'desc';
}

interface SearchState {
  // Query state
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;

  // Filter state
  filters: SearchFilterState;
  setFilters: (filters: SearchFilterState) => void;
  updateFilter: (key: keyof SearchFilterState, value: unknown) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;

  // Sort state
  sort: SearchSortState;
  setSort: (sort: SearchSortState) => void;
  updateSort: (
    field: SearchSortState['field'],
    order: SearchSortState['order'],
  ) => void;

  // History state
  history: SearchHistoryItem[];
  addToHistory: (item: Omit<SearchHistoryItem, 'id' | 'createdAt'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // Recent searches (local only, not persisted)
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Query state
      query: '',
      setQuery: (query) => set({ query }),
      clearQuery: () => set({ query: '' }),

      // Filter state
      filters: {},
      setFilters: (filters) => set({ filters }),
      updateFilter: (key, value) => {
        set({
          filters: {
            ...get().filters,
            [key]: value,
          },
        });
      },
      resetFilters: () => set({ filters: {} }),
      hasActiveFilters: () => {
        const filters = get().filters;
        return Object.keys(filters).some((key) => {
          const value = filters[key as keyof SearchFilterState];
          if (Array.isArray(value)) return value.length > 0;
          return value !== undefined && value !== null;
        });
      },

      // Sort state
      sort: { field: 'relevance', order: 'desc' },
      setSort: (sort) => set({ sort }),
      updateSort: (field, order) => set({ sort: { field, order } }),

      // History state
      history: [],
      addToHistory: (item) => {
        const newItem: SearchHistoryItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        // Remove duplicate queries
        const filteredHistory = get().history.filter(
          (h) => h.query !== item.query,
        );

        // Add new item to front, keep only last 20
        set({
          history: [newItem, ...filteredHistory].slice(0, 20),
        });
      },
      removeFromHistory: (id) => {
        set({
          history: get().history.filter((h) => h.id !== id),
        });
      },
      clearHistory: () => set({ history: [] }),

      // Recent searches (local only)
      recentSearches: [],
      addRecentSearch: (query) => {
        if (!query || query.length < 2) return;

        // Remove duplicate
        const filtered = get().recentSearches.filter((s) => s !== query);

        // Add to front, keep only last 10
        set({
          recentSearches: [query, ...filtered].slice(0, 10),
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'nabome-search',
      partialize: (state) => ({
        history: state.history,
        recentSearches: state.recentSearches,
      }),
    },
  ),
);
