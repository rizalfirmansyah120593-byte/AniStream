/* eslint-disable @next/next/no-img-element */
"use client";
import React, { use, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { Play, Star, Loader2, Film, CheckCircle } from "lucide-react";
import { API_URL } from '@/utils/config';

interface Anime {
  detail_url: string;
  img: string;
  alt: string;
  title: string;
  type: string;
  score: number;
  genres?: { tag: string }[];
  slug: string;
  episode?: string;
}

interface CategoryResponse {
  data: Anime[];
  total_page: number;
  current_page: number;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Category configurations
const categoryConfig: Record<string, { title: string; apiUrl: string; icon: React.ReactNode }> = {
  ongoing: {
    title: "On Going Anime",
    apiUrl: `${API_URL}/ongoing-anime`,
    icon: <Film className="w-8 h-8 text-red-600" />,
  },
  completed: {
    title: "Completed Anime",
    apiUrl: `${API_URL}/completed-anime`,
    icon: <CheckCircle className="w-8 h-8 text-green-600" />,
  },
};

async function fetchCategoryAnime(apiUrl: string, page: number): Promise<CategoryResponse> {
  const { data } = await axios.get(`${apiUrl}?page=${page}`);
  return data;
}

const CategoryPage = (props: PageProps) => {
  const { slug } = use(props.params);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get category config
  const config = categoryConfig[slug];

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["category-anime", slug],
    queryFn: ({ pageParam = 1 }) => fetchCategoryAnime(config?.apiUrl || "", pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.total_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    enabled: !!config,
  });

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Flatten all pages data
  const allAnime = data?.pages.flatMap((page) => page.data) || [];
  const currentPage = data?.pages[data.pages.length - 1]?.current_page || 1;
  const totalPage = data?.pages[0]?.total_page || 1;

  // If category not found
  if (!config) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] px-4">
          <Film className="w-16 h-16 text-gray-600 mb-4" />
          <h1 className="text-2xl font-heading text-white mb-2">Category Not Found</h1>
          <p className="text-gray-400 text-center mb-6">
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] px-4">
          <p className="text-red-500 text-xl">Error loading anime</p>
          <p className="text-gray-400 mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Header */}
      <div className="pt-20 pb-8 px-4 md:px-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            {config.icon}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading text-white">
              {config.title.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-sm mt-2">
            <span>Page {currentPage} of {totalPage}</span>
            <span>•</span>
            <span>{allAnime.length} anime loaded</span>
          </div>
        </div>
      </div>

      {/* Anime Grid */}
      <div className="px-4 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          {allAnime.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Film className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No anime found in this category</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {allAnime.map((anime: Anime, index: number) => (
                  <Link key={`${anime.slug}-${index}`} href={`/anime${anime.slug}`}>
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
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs z-10">
                            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-white font-medium">
                              {Number(anime.score).toFixed(1)}
                            </span>
                          </div>
                        )}

                        {/* Type Badge */}
                        {anime.type && (
                          <div className="absolute top-2 right-2 bg-red-600 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-white z-10">
                            {anime.type}
                          </div>
                        )}

                        {/* Episode Badge */}
                        {anime.episode && (
                          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs text-white z-10">
                            {anime.episode}
                          </div>
                        )}

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-black fill-black ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="mt-2 sm:mt-3 px-0.5">
                        <h3 className="text-white text-xs sm:text-sm font-medium line-clamp-2 group-hover:text-red-500 transition-colors">
                          {anime.title}
                        </h3>
                        {anime.genres && anime.genres.length > 0 && (
                          <div className="flex gap-1 mt-1 overflow-hidden">
                            {anime.genres.slice(0, 2).map((genre, idx) => (
                              <span
                                key={idx}
                                className="text-gray-500 text-[10px] sm:text-xs truncate"
                              >
                                {genre.tag}
                                {idx < Math.min(anime.genres!.length, 2) - 1 && " •"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                ) : hasNextPage ? (
                  <div className="text-gray-500 text-sm">Scroll for more</div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    You&apos;ve reached the end • {allAnime.length} anime total
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CategoryPage;
