/* eslint-disable @next/next/no-img-element */
'use client'
import React, { useState, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import SearchInput from '@/components/SearchInput'
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Star, Play, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { API_URL } from '@/utils/config';

interface Anime {
  detail_url: string;
  img: string;
  alt: string;
  title: string;
  type: string;
  score: number;
  genres?: Genre[];
  slug: string;
}

interface Genre {
  tag: string;
}

const fetchAnime = async (query: string) => {
  const res = await axios.get(`${API_URL}/search-anime?search=${encodeURIComponent(query)}`);
  return res.data;
};

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['search-anime', searchTerm],
    queryFn: () => fetchAnime(searchTerm),
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 5,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  const resultCount = data?.data?.length || 0;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-16">
        {/* Search Input Section */}
        <SearchInput callAction={handleSearch} isLoading={isLoading} />
        
        {/* Results Section */}
        <div className="px-4 md:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            
            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[2/3] rounded-md bg-gray-800" />
                    <div className="mt-3 h-4 bg-gray-800 rounded w-3/4" />
                    <div className="mt-2 h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-500 text-lg">Terjadi kesalahan saat mencari.</p>
                <p className="text-gray-500 text-sm mt-2">Silakan coba lagi nanti.</p>
              </div>
            )}
            
            {/* Results */}
            {!isLoading && !error && data && data.data.length > 0 && (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mt-8 mb-6">
                  <h2 className="text-xl md:text-2xl font-heading text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    SEARCH RESULTS
                  </h2>
                  <span className="text-gray-500 text-sm">{resultCount} anime found</span>
                </div>
                
                {/* Results Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {data.data.map((anime: Anime, index: number) => (
                    <Link key={index} href={`/anime${anime.slug}`}>
                      <div className="group relative">
                        {/* Image Container */}
                        <div className="aspect-[2/3] rounded-md overflow-hidden relative bg-gray-900 border-2 border-transparent group-hover:border-white/30 transition-all duration-300">
                          <img
                            src={anime.img}
                            alt={anime.alt}
                            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Rating Badge */}
                          {anime.score && Number(anime.score) > 0 && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs z-10">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-white font-medium">{Number(anime.score).toFixed(1)}</span>
                            </div>
                          )}
                          
                          {/* Type Badge */}
                          {anime.type && (
                            <div className="absolute top-2 right-2 bg-red-600 px-2 py-0.5 rounded text-xs font-bold text-white z-10">
                              {anime.type}
                            </div>
                          )}
                          
                          {/* Play Button - Center */}
                          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                              <Play className="w-6 h-6 text-black fill-black ml-1" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Info */}
                        <div className="mt-3 px-0.5">
                          <h3 className="text-white text-sm font-medium truncate group-hover:text-red-500 transition-colors">
                            {anime.title}
                          </h3>
                          
                          {/* Genres */}
                          {anime.genres && anime.genres.length > 0 && (
                            <div className="flex gap-1 mt-1.5 overflow-hidden">
                              {anime.genres.slice(0, 2).map((genre, idx) => (
                                <span
                                  key={idx}
                                  className="text-gray-500 text-xs truncate"
                                >
                                  {genre.tag}{idx < Math.min((anime.genres?.length || 0), 2) - 1 && ' •'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
            
            {/* Empty State - No Results */}
            {!isLoading && !error && data && data.data.length === 0 && searchTerm && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                  <Search className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl text-white font-semibold mb-2">No results found</h3>
                <p className="text-gray-500 text-center max-w-md">
                  We couldn&apos;t find any anime matching &quot;{searchTerm}&quot;. Try checking your spelling or use different keywords.
                </p>
              </div>
            )}
            
            {/* Initial State - No Search */}
            {!searchTerm && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 to-red-900/20 flex items-center justify-center mb-6">
                  <Search className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-xl text-white font-semibold mb-2">Discover Your Next Anime</h3>
                <p className="text-gray-500 text-center max-w-md">
                  Start typing in the search box above to find your favorite anime series and movies.
                </p>
                
                {/* Popular Searches */}
                <div className="mt-8">
                  <p className="text-gray-600 text-sm text-center mb-3">Popular searches:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Naruto', 'One Piece', 'Attack on Titan', 'Demon Slayer', 'Jujutsu Kaisen'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchTerm(term)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full text-sm transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default SearchPage