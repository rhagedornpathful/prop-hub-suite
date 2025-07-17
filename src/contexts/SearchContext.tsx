import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedFilters([]);
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