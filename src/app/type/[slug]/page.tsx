/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { Star, Play, Tv, Film, Clapperboard, Sparkles, Popcorn, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { API_URL } from '@/utils/config';

interface Genre {
  tag: string;
  link: string;
}

interface Anime {
  img: string;
  alt: string;
  slug: string;
  type: string;
  score: string;
  title: string;
  total_views: number;
  description: string;
  genres: Genre[];
  detail_url: string;
}

interface TypeResponse {
  data: Anime[];
  total_items: number;
  current_page: number;
  total_page: number;
  type: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  tv: { 
    label: "TV Series", 
    icon: <Tv className="w-8 h-8" />, 
    color: "text-blue-400",
    bgColor: "bg-blue-600"
  },
  ova: { 
    label: "OVA", 
    icon: <Film className="w-8 h-8" />, 
    color: "text-purple-400",
    bgColor: "bg-purple-600"
  },
  ona: { 
    label: "ONA", 
    icon: <Clapperboard className="w-8 h-8" />, 
    color: "text-green-400",
    bgColor: "bg-green-600"
  },
  special: { 
    label: "Special", 
    icon: <Sparkles className="w-8 h-8" />, 
    color: "text-yellow-400",
    bgColor: "bg-yellow-600"
  },
  movie: { 
    label: "Movie", 
    icon: <Popcorn className="w-8 h-8" />, 
    color: "text-red-400",
    bgColor: "bg-red-600"
  },
};

async function fetchTypeAnime(type: string, page: number): Promise<TypeResponse> {
  const { data } = await axios.get(
    `${API_URL}/type-anime/${type}?page=${page}`
  );
  return data;
}

const TypeDetailPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const config = TYPE_CONFIG[slug] || TYPE_CONFIG.tv;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["type-anime-list", slug],
    queryFn: ({ pageParam = 1 }) => fetchTypeAnime(slug, pageParam),
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
  const totalItems = data?.pages[0]?.total_items || 0;
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
      <div className={`pt-20 pb-8 px-4 md:px-12 bg-gradient-to-b from-gray-900 to-black`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className={`p-3 rounded-xl ${config.bgColor}`}>
              {config.icon}
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl font-heading ${config.color}`}>
                {config.label.toUpperCase()}
              </h1>
              <p className="text-gray-400 text-lg">
                {totalItems} anime • Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="px-4 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allAnime.map((anime: Anime, index: number) => (
              <Link key={`${anime.slug}-${index}`} href={`/anime${anime.slug}`}>
                <div className="group relative">
                  {/* Image Container */}
                  <div className="aspect-[2/3] rounded-md overflow-hidden relative bg-gray-900 border-2 border-transparent group-hover:border-white/30 transition-all duration-300">
                    <img
                      src={anime.img}
                      alt={anime.alt || anime.title}
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
                    <div className={`absolute top-2 right-2 ${config.bgColor} px-2 py-0.5 rounded text-xs font-bold text-white z-10`}>
                      {anime.type || slug.toUpperCase()}
                    </div>

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
                    {anime.genres && anime.genres.length > 0 && (
                      <div className="flex gap-1 mt-1 overflow-hidden">
                        {anime.genres.slice(0, 2).map((genre, idx) => (
                          <span
                            key={idx}
                            className="text-gray-500 text-xs truncate"
                          >
                            {genre.tag}{idx < Math.min(anime.genres.length, 2) - 1 && ' •'}
                          </span>
                        ))}
                      </div>
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

export default TypeDetailPage;
