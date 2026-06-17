'use client'
import React, { useEffect, useState, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchInputProps {
  callAction?: (query: string) => void;
  isLoading?: boolean;
}

const SearchInput = ({ callAction, isLoading }: SearchInputProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    callAction?.(debouncedQuery);
  }, [debouncedQuery, callAction]);

  // Auto focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Search Header */}
        <h1 className="text-3xl md:text-4xl font-heading text-white text-center mb-6">
          SEARCH ANIME
        </h1>
        
        {/* Search Input Container */}
        <div className={`relative flex items-center bg-gray-800/50 rounded-full border-2 transition-all duration-300 ${
          isFocused ? 'border-red-600 bg-gray-800/80 shadow-lg shadow-red-900/20' : 'border-gray-700 hover:border-gray-600'
        }`}>
          {/* Search Icon */}
          <div className="pl-5">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            ) : (
              <Search className={`w-6 h-6 transition-colors ${isFocused ? 'text-red-600' : 'text-gray-500'}`} />
            )}
          </div>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search for anime titles..."
            className="flex-1 bg-transparent text-white text-lg md:text-xl py-4 px-4 outline-none placeholder-gray-500"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          
          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClear}
              className="pr-5 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {/* Search Hint */}
        <p className="text-gray-500 text-sm text-center mt-3">
          {query ? (
            isLoading ? 'Searching...' : `Showing results for "${query}"`
          ) : (
            'Start typing to search for your favorite anime'
          )}
        </p>
      </div>
    </div>
  );
};

export default SearchInput;
