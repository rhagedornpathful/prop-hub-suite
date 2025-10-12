import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SearchContextType {
  searchQuery: string;
  selectedFilters: string[];
  setSearchQuery: (query: string) => void;
  setSelectedFilters: (filters: string[]) => void;
  clearSearch: () => void;
  isSearchActive: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

const SEARCH_STORAGE_KEY = 'app-search-state';

export function SearchProvider({ children }: SearchProviderProps) {
  const location = useLocation();
  
  // Initialize from sessionStorage to persist across navigation
  const [searchQuery, setSearchQueryState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SEARCH_STORAGE_KEY);
      return stored ? JSON.parse(stored).query || "" : "";
    } catch {
      return "";
    }
  });
  
  const [selectedFilters, setSelectedFiltersState] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem(SEARCH_STORAGE_KEY);
      return stored ? JSON.parse(stored).filters || [] : [];
    } catch {
      return [];
    }
  });

  // Persist to sessionStorage whenever search state changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify({
        query: searchQuery,
        filters: selectedFilters,
        path: location.pathname
      }));
    } catch (error) {
      console.error('Failed to persist search state:', error);
    }
  }, [searchQuery, selectedFilters, location.pathname]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setSelectedFilters = useCallback((filters: string[]) => {
    setSelectedFiltersState(filters);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState("");
    setSelectedFiltersState([]);
    try {
      sessionStorage.removeItem(SEARCH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search state:', error);
    }
  }, []);

  const isSearchActive = searchQuery.length > 0 || selectedFilters.length > 0;

  const value: SearchContextType = {
    searchQuery,
    selectedFilters,
    setSearchQuery,
    setSelectedFilters,
    clearSearch,
    isSearchActive,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}