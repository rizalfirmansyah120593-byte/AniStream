/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { Star, Play, Clock, Loader2 } from "lucide-react";
import { API_URL } from '@/utils/config';

interface Anime {
  link: string;
  img: string;
  alt: string;
  title: string;
  type: string;
  score: number;
  episode: string;
  released: string;
}

interface LatestResponse {
  data: Anime[];
  total_page: number;
  current_page: number;
}

async function fetchLatestAnime(page: number): Promise<LatestResponse> {
  const { data } = await axios.get(
    `${API_URL}/new-anime?page=${page}`
  );
  return data;
}

const LatestPage = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["latest-anime"],
    queryFn: ({ pageParam = 1 }) => fetchLatestAnime(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.total_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
  });

  // Flatten all pages data
  const allAnime = data?.pages.flatMap((page) => page.data) || [];
  const totalPages = data?.pages[0]?.total_page || 0;
  const currentPage = data?.pages.length || 0;

  // Load more function
  const loadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, loadMore]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">Error loading anime</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Header */}
      <div className="pt-20 pb-8 px-4 md:px-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl md:text-5xl font-heading text-white">
              LATEST ANIME
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            {allAnime.length} anime loaded • Page {currentPage} of {totalPages}
          </p>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="px-4 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allAnime.map((anime: Anime, index: number) => (
              <Link key={`${anime.link}-${index}`} href={anime.link}>
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
                        <span className="text-white font-medium">
                          {Number(anime.score).toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Type Badge */}
                    {anime.type && (
                      <div className="absolute top-2 right-2 bg-red-600 px-2 py-0.5 rounded text-xs font-bold text-white z-10">
                        {anime.type}
                      </div>
                    )}

                    {/* Episode Badge */}
                    {anime.episode && (
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white z-10">
                        {anime.episode}
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
                    {anime.released && (
                      <p className="text-gray-500 text-xs mt-1">{anime.released}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Trigger / Loading Indicator */}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center items-center py-8 mt-4"
            >
              {isFetchingNextPage ? (
                <div className="flex items-center gap-3 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  <span>
                    Loading page {currentPage + 1} of {totalPages}...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-red-600 animate-spin" />
                  <span className="text-gray-500 text-sm">Scroll for more</span>
                </div>
              )}
            </div>
          )}

          {/* End of Results */}
          {!hasNextPage && allAnime.length > 0 && (
            <div className="text-center py-8 mt-4">
              <p className="text-gray-600 text-sm">
                You&apos;ve reached the end • {allAnime.length} anime total
              </p>
            </div>
          )}

          {/* Empty State */}
          {allAnime.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No anime found</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LatestPage;
