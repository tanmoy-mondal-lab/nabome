/**
 * SearchBar Component
 * Source: SEARCH_ENGINE_ARCHITECTURE.md, COMPONENT_LIBRARY_ARCHITECTURE.md
 *
 * Mobile-first search bar with autocomplete, trending suggestions, and history.
 * Uses the official SearchInput component from the component library.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

import { SearchInput } from '@nabome/ui';

import { useSearchStore } from '../../../stores/search-store';
import { useSearch } from '../hooks/use-search';

export function SearchBar() {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useSearchStore();
  const { suggestions, trending, isAutocompleteLoading, isTrendingLoading } =
    useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut (Ctrl/Cmd + K) to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowHistory(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
    setShowHistory(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    addRecentSearch(suggestion);
    setIsOpen(false);
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const handleSearch = () => {
    if (query.length >= 2) {
      addRecentSearch(query);
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (query.length === 0) {
      setShowHistory(true);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <SearchInput
        ref={inputRef}
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        showClear
        onClear={handleClear}
        hasValue={query.length > 0}
        placeholder="Search products... (Ctrl+K)"
        className="w-full"
        aria-label="Search products"
        aria-expanded={isOpen || showHistory}
        aria-controls="search-dropdown"
        aria-autocomplete="list"
      />

      {/* Dropdown */}
      {(isOpen || showHistory) && (
        <div
          id="search-dropdown"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          {showHistory && recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Recent Searches
                </h3>
                <button
                  onClick={() => clearRecentSearches()}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-1">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700"
                      role="option"
                    >
                      {search}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isOpen && suggestions.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Suggestions
              </h3>
              <ul className="space-y-1">
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion.name)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
                      role="option"
                    >
                      <span>{suggestion.name}</span>
                      {suggestion.categoryName && (
                        <span className="text-xs text-gray-500">
                          in {suggestion.categoryName}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isOpen && suggestions.length === 0 && !isAutocompleteLoading && (
            <div className="p-4">
              <p className="text-sm text-gray-500">No suggestions found</p>
            </div>
          )}

          {isAutocompleteLoading && (
            <div className="p-4">
              <p className="text-sm text-gray-500">Loading suggestions...</p>
            </div>
          )}

          {!showHistory && isOpen && trending.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Trending
              </h3>
              <ul className="space-y-1">
                {trending.slice(0, 5).map((trendingItem, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(trendingItem.query)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
                      role="option"
                    >
                      <span>{trendingItem.query}</span>
                      <span className="text-xs text-gray-500">
                        ({trendingItem.count})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isTrendingLoading && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Loading trending searches...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
