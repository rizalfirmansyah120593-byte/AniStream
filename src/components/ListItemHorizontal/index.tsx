/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Star, Play, Plus, ChevronRight, Radio, CheckCircle, Check } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";
import { toggleMyList, isInMyList } from "@/utils/myList";

interface ListItemHorizontalProps {
  title: string;
  placeholder?: boolean;
  apifetch: string;
  queryKey?: string;
  categorySlug?: string; // Slug for "See All" navigation (e.g., "ongoing", "completed")
  seeAllHref?: string; // Full href for "See All" link (overrides categorySlug)
  variant?: "default" | "ongoing" | "completed"; // Header style variant
}

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

const VARIANT_CONFIG = {
  default: {
    icon: null,
    color: "text-white",
    badgeColor: "",
    badgeText: "",
  },
  ongoing: {
    icon: <Radio className="w-5 h-5" />,
    color: "text-green-400",
    badgeColor: "bg-green-600",
    badgeText: "LIVE",
  },
  completed: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-blue-400",
    badgeColor: "bg-blue-600",
    badgeText: "END",
  },
};

const ListItemHorizontal = (props: ListItemHorizontalProps) => {
  const { title, placeholder, apifetch, queryKey, categorySlug, seeAllHref, variant = "default" } = props;
  const config = VARIANT_CONFIG[variant];
  
  // Track which anime are in My List
  const [myListItems, setMyListItems] = useState<Set<string>>(new Set());
  
  // Determine the "See All" link
  const seeAllLink = seeAllHref || (categorySlug ? `/category/${categorySlug}` : null);

  // Fetch anime data
  const data = useQuery({
    queryKey: [queryKey || Math.random().toString(36).substring(2, 15)],
    queryFn: async () => {
      const { data } = await axios.get(apifetch);
      return data;
    },
  });

  // Initialize and listen for My List updates
  useEffect(() => {
    // Check initial state from loaded anime data
    const checkMyList = () => {
      if (data.data?.data) {
        const newSet = new Set<string>();
        data.data.data.forEach((anime: Anime) => {
          const link = `/anime${anime.slug}`;
          if (isInMyList(link)) {
            newSet.add(link);
          }
        });
        setMyListItems(newSet);
      }
    };
    
    checkMyList();
    
    const handleUpdate = () => checkMyList();
    window.addEventListener('mylist-updated', handleUpdate);
    return () => window.removeEventListener('mylist-updated', handleUpdate);
  }, [data.data]);

  // Handle toggle My List
  const handleToggleMyList = useCallback((e: React.MouseEvent, anime: Anime) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = `/anime${anime.slug}`;
    toggleMyList({
      link,
      img: anime.img,
      alt: anime.alt,
      title: anime.title,
      type: anime.type,
      score: anime.score,
    });
    
    // Update local state immediately for better UX
    setMyListItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(link)) {
        newSet.delete(link);
      } else {
        newSet.add(link);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="w-full px-4 md:px-8 lg:px-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl md:text-2xl font-heading tracking-wide flex items-center gap-2 group cursor-pointer ${config.color}`}>
          {config.icon && (
            <span className={`${variant === 'ongoing' ? 'animate-pulse' : ''}`}>
              {config.icon}
            </span>
          )}
          {title}
          {config.badgeText && (
            <span className={`${config.badgeColor} text-white text-[10px] px-2 py-0.5 rounded font-bold ml-1`}>
              {config.badgeText}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-red-600 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
        </h2>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 3, spaceBetween: 12 },
          640: { slidesPerView: 4, spaceBetween: 12 },
          768: { slidesPerView: 5, spaceBetween: 14 },
          1024: { slidesPerView: 6, spaceBetween: 16 },
          1280: { slidesPerView: 7, spaceBetween: 16 },
        }}
        className="anime-swiper"
      >
        {(placeholder || data.isLoading
          ? Array.from({ length: 10 })
          : data.data.data
        ).map((anime: Anime, index: number) => {
          return (
            <SwiperSlide key={index}>
              {placeholder || data.isLoading ? (
                // Skeleton Loading
                <div className="anime-card-skeleton">
                  <div className="aspect-[2/3] rounded-md overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 relative">
                    <div className="absolute inset-0 shimmer-effect" />
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="h-3 bg-gray-800 rounded w-3/4 shimmer-effect" />
                    <div className="h-2 bg-gray-800 rounded w-1/2 shimmer-effect" />
                  </div>
                </div>
              ) : (
                // Anime Card
                <Link href={`/anime${anime.slug}`}>
                  <div className="anime-card group relative">
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
                      
                      {/* Rating Badge - Only show if score is valid */}
                      {anime.score && Number(anime.score) > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs z-10">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-white font-medium">{Number(anime.score).toFixed(1)}</span>
                        </div>
                      )}
                      
                      {/* Type Badge */}
                      {anime.type && (
                        <div className={`absolute top-2 right-2 ${variant === 'ongoing' ? 'bg-green-600' : variant === 'completed' ? 'bg-blue-600' : 'bg-red-600'} px-2 py-0.5 rounded text-xs font-bold text-white z-10`}>
                          {anime.type}
                        </div>
                      )}
                      
                      {/* Play Button - Center */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-6 h-6 text-black fill-black ml-1" />
                        </div>
                      </div>
                      
                      {/* Bottom Actions */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                        <button 
                          onClick={(e) => handleToggleMyList(e, anime)}
                          className={`w-8 h-8 rounded-full border-2 ${myListItems.has(`/anime${anime.slug}`) ? 'border-green-500 bg-green-500/50' : 'border-gray-400 hover:border-white bg-black/50'} flex items-center justify-center transition-colors`}
                          title={myListItems.has(`/anime${anime.slug}`) ? 'Hapus dari My List' : 'Tambah ke My List'}
                        >
                          {myListItems.has(`/anime${anime.slug}`) ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Plus className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Card Info */}
                    <div className="mt-3 px-0.5">
                      <h3 className="text-white text-sm font-medium truncate group-hover:text-red-500 transition-colors">
                        {anime.title}
                      </h3>
                      
                      {/* Genres */}
                      <div className="flex gap-1 mt-1 overflow-hidden">
                        {anime.genres?.slice(0, 2).map((genre, idx) => (
                          <span
                            key={idx}
                            className="text-gray-500 text-xs truncate"
                          >
                            {genre.tag}{idx < Math.min((anime.genres?.length || 0), 2) - 1 && ' •'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </SwiperSlide>
          );
        })}
        
        {/* See More Card */}
        {seeAllLink && (
          <SwiperSlide>
            <Link href={seeAllLink}>
              <div className="aspect-[2/3] rounded-md bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center cursor-pointer group hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-800 hover:border-red-600/50">
                <div className="w-14 h-14 rounded-full border-2 border-gray-600 group-hover:border-red-600 flex items-center justify-center mb-3 transition-colors">
                  <ChevronRight className="w-7 h-7 text-gray-400 group-hover:text-red-600 transition-colors" />
                </div>
                <p className="text-gray-400 group-hover:text-white text-sm font-medium transition-colors">See All</p>
                <p className="text-gray-600 text-xs mt-1 text-center px-2">{title}</p>
              </div>
            </Link>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
};

export default ListItemHorizontal;
