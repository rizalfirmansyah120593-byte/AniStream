/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Image from "next/image";
import Footer from "@/components/Footer";
import { getYouTubeEmbedUrl } from "@/utils/animeTrailers";
import StrawHatImg from "./Straw_Hat.png";
import OnePieceLogo from "./One-Piece-Logo.png";
import { Play, Plus, Check, ThumbsUp, Volume2, VolumeX, X, ArrowUp, ArrowDown, Anchor, Ship, Skull, Compass, MapPin } from "lucide-react";
import { isInMyList, toggleMyList, isAnimeLiked, toggleLikeAnime } from "@/utils/myList";
import groupByProvider from "@/utils/groupByProvider";
import { API_URL } from '@/utils/config';

async function fetchAnimeDetail() {
  const { data } = await axios.get(
    `${API_URL}/detail-anime/one-piece`
  );
  return data;
}

// Straw Hat Crew Members untuk showcase
const strawHatCrew = [
  { name: "Monkey D. Luffy", role: "Captain", bounty: "3.000.000.000", emoji: "👒" },
  { name: "Roronoa Zoro", role: "Swordsman", bounty: "1.111.000.000", emoji: "⚔️" },
  { name: "Nami", role: "Navigator", bounty: "366.000.000", emoji: "🗺️" },
  { name: "Usopp", role: "Sniper", bounty: "500.000.000", emoji: "🎯" },
  { name: "Sanji", role: "Cook", bounty: "1.032.000.000", emoji: "🍳" },
  { name: "Tony Tony Chopper", role: "Doctor", bounty: "1.000", emoji: "🦌" },
  { name: "Nico Robin", role: "Archaeologist", bounty: "930.000.000", emoji: "📚" },
  { name: "Franky", role: "Shipwright", bounty: "394.000.000", emoji: "🔧" },
  { name: "Brook", role: "Musician", bounty: "383.000.000", emoji: "🎸" },
  { name: "Jinbe", role: "Helmsman", bounty: "1.100.000.000", emoji: "🐟" },
];

// One Piece Arcs
const majorArcs = [
  { name: "East Blue Saga", episodes: "1-61", color: "from-blue-400 to-blue-600" },
  { name: "Arabasta Saga", episodes: "62-135", color: "from-yellow-400 to-orange-500" },
  { name: "Sky Island Saga", episodes: "136-206", color: "from-sky-300 to-blue-400" },
  { name: "Water 7 Saga", episodes: "207-325", color: "from-cyan-400 to-blue-500" },
  { name: "Thriller Bark Saga", episodes: "326-384", color: "from-purple-500 to-gray-700" },
  { name: "Summit War Saga", episodes: "385-516", color: "from-red-500 to-orange-600" },
  { name: "Fish-Man Island Saga", episodes: "517-574", color: "from-teal-400 to-blue-500" },
  { name: "Dressrosa Saga", episodes: "575-746", color: "from-pink-400 to-red-500" },
  { name: "Whole Cake Island Saga", episodes: "747-877", color: "from-pink-300 to-purple-400" },
  { name: "Wano Country Saga", episodes: "878-1085", color: "from-red-600 to-purple-700" },
  { name: "Final Saga", episodes: "1086+", color: "from-yellow-400 to-red-500" },
];

const OnePiecePage = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<{
    videos: { id: string; title: string; video: string; type: string }[];
    title: string;
    description: string;
  } | null>(null);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedArc, setSelectedArc] = useState<string | null>(null);
  
  const trailerUrl = getYouTubeEmbedUrl("one-piece", { muted: isMuted });
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["detail-anime", "one-piece"],
    queryFn: fetchAnimeDetail,
  });

  useEffect(() => {
    if (data) {
      const link = `/anime/one-piece`;
      
      const checkList = () => {
        setIsInList(isInMyList(link));
      };
      
      const checkLiked = () => {
        setIsLiked(isAnimeLiked(link));
      };
      
      checkList();
      checkLiked();
      
      window.addEventListener('mylist-updated', checkList);
      window.addEventListener('liked-updated', checkLiked);
      
      return () => {
        window.removeEventListener('mylist-updated', checkList);
        window.removeEventListener('liked-updated', checkLiked);
      };
    }
  }, [data]);

  const handleToggleMyList = useCallback(() => {
    if (!data) return;
    
    toggleMyList({
      link: `/anime/one-piece`,
      img: data.img,
      alt: data.title,
      title: data.title,
      episode: `${data.episodes?.length || 0} Episodes`,
      released: data.released,
      type: data.type,
      score: parseFloat(data.rating) || 0,
    });
  }, [data]);

  const handleToggleLike = useCallback(() => {
    toggleLikeAnime(`/anime/one-piece`);
  }, []);

  const fetchVideoUrl = useCallback(async (videoPath: string) => {
    try {
      const response = await fetch(`${API_URL}${videoPath}`);
      const videoData = await response.json();
      setVideoUrl(videoData.url);
    } catch (error) {
      console.error('Failed to fetch video:', error);
    }
  }, []);

  const handlePlayLatest = useCallback(async () => {
    if (!data || !data.episodes || data.episodes.length === 0) return;
    
    const latestEpisode = data.episodes[data.episodes.length - 1];
    
    try {
      setVideoUrl(null);
      setEpisodeDetails(null);
      setShowPlayer(true);
      
      const response = await axios.get(
        `${API_URL}${latestEpisode.detail_eps}`
      );
      
      setEpisodeDetails(response.data);
      
      if (response.data.videos && response.data.videos.length > 0) {
        fetchVideoUrl(response.data.videos[0].video);
      }
    } catch (error) {
      console.error('Failed to fetch episode:', error);
    }
  }, [data, fetchVideoUrl]);

  const handlePlayEpisode = useCallback(async (detail_eps: string) => {
    try {
      setVideoUrl(null);
      setEpisodeDetails(null);
      setShowPlayer(true);
      
      const response = await axios.get(
        `${API_URL}${detail_eps}`
      );
      
      setEpisodeDetails(response.data);
      
      if (response.data.videos && response.data.videos.length > 0) {
        fetchVideoUrl(response.data.videos[0].video);
      }
    } catch (error) {
      console.error('Failed to fetch episode:', error);
    }
  }, [fetchVideoUrl]);

  // Filter episodes by arc
  const getFilteredEpisodes = () => {
    if (!data || !data.episodes) return [];
    
    let episodes = sortOrder === 'desc' 
      ? data.episodes.slice().reverse() 
      : data.episodes.slice();
    
    if (selectedArc) {
      const arc = majorArcs.find(a => a.name === selectedArc);
      if (arc) {
        const [start, end] = arc.episodes.replace('+', '-9999').split('-').map(Number);
        episodes = episodes.filter((ep: { episode: number }) => 
          ep.episode >= start && ep.episode <= (end || 9999)
        );
      }
    }
    
    return episodes;
  };

  if (isLoading)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gradient-to-b from-[#0a1628] to-[#001] one-piece-theme">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <Image src={StrawHatImg} alt="Straw Hat" width={80} height={50} className="drop-shadow-lg" />
          </div>
          <Loading />
          <p className="text-yellow-400 mt-4 font-heading text-xl animate-pulse">Setting Sail to Grand Line...</p>
        </div>
      </div>
    );
    
  if (isError)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-gradient-to-b from-[#0a1628] to-[#001]">
        <div className="text-center">
          <span className="text-6xl mb-4 block">💀</span>
          <h1 className="text-white text-2xl">Error loading One Piece!</h1>
        </div>
      </div>
    );

  return (
    <div className="one-piece-theme bg-gradient-to-b from-[#0a1628] via-[#0d2137] to-[#0a1628] text-white min-h-screen relative overflow-hidden">
      {/* Ocean Wave Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="op-wave op-wave-1"></div>
        <div className="op-wave op-wave-2"></div>
        <div className="op-wave op-wave-3"></div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl animate-float opacity-20">⚓</div>
        <div className="absolute top-40 right-20 text-3xl animate-float-delayed opacity-20">🏴‍☠️</div>
        <div className="absolute bottom-40 left-20 text-3xl animate-float opacity-20">🗺️</div>
        <div className="absolute top-60 left-1/4 text-2xl animate-float-delayed opacity-20">⭐</div>
        <div className="absolute bottom-60 right-1/4 text-2xl animate-float opacity-20">🧭</div>
      </div>

      <Navbar />
      
      {/* Hero Section - One Piece Themed */}
      <main className="relative z-10">
        <div className="relative w-full h-[75vh] min-h-[450px] max-h-[550px] md:min-h-[650px] md:max-h-none lg:min-h-[750px] overflow-hidden">
          {/* Video Background */}
          {trailerUrl ? (
            <>
              <div className="absolute inset-0 w-full h-full">
                <iframe
                  src={trailerUrl}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] sm:w-[200%] sm:h-[200%] md:w-[150%] md:h-[150%] pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="One Piece Trailer"
                />
              </div>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 md:bottom-24 md:right-16 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full border-2 border-yellow-500 hover:border-yellow-400 bg-black/60 flex items-center justify-center transition-all hover:bg-yellow-500/20"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                ) : (
                  <Volume2 className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />
                )}
              </button>
            </>
          ) : (
            <Image
              src={data.img}
              alt={data.title}
              layout="fill"
              objectFit="cover"
              className="object-top"
            />
          )}
          
          {/* Gradient Overlays - Ocean Theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/30 to-[#0a1628]/20 z-10" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 md:px-16 pb-8 md:pb-16 pt-20 z-20">
            <div className="max-w-3xl">
              
              {/* Title Logo */}
              <div className="mb-4">
                <Image 
                  src={OnePieceLogo} 
                  alt="One Piece" 
                  width={500} 
                  height={150} 
                  className="w-[280px] sm:w-[350px] md:w-[450px] lg:w-[550px] h-[60px] sm:h-[75px] md:h-[95px] lg:h-[115px] object-contain object-left drop-shadow-2xl"
                  priority
                />
              </div>
              
              {/* Japanese Title */}
              <p className="text-lg sm:text-xl md:text-2xl text-sky-300 mb-3 font-light">
                ワンピース • {data.japanese_title}
              </p>
              
              {/* Meta Info with Pirate Theme */}
              <div className="flex items-center gap-2 md:gap-4 mb-3 flex-wrap text-xs sm:text-sm">
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <span>⭐</span> {data.rating}% Match
                </span>
                <span className="bg-gradient-to-r from-red-600 to-red-800 px-3 py-1 rounded-full font-bold text-yellow-300 border border-yellow-500/50">
                  {data.type}
                </span>
                <span className="text-sky-300">{data.episodes?.length || 0}+ Episodes</span>
                <span className="bg-yellow-500/20 border border-yellow-500/50 px-2 py-1 rounded text-yellow-400 text-xs font-bold">
                  LEGENDARY
                </span>
              </div>
              
              {/* Genres */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {data.genres.slice(0, 5).map((genre: { tag: string }, index: number) => (
                  <React.Fragment key={index}>
                    <span className="text-xs md:text-sm text-sky-200">{genre.tag}</span>
                    {index < Math.min(data.genres.length, 5) - 1 && (
                      <span className="text-yellow-500">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Description - Hidden on mobile */}
              <p className="hidden md:block text-sky-100/80 text-sm mb-5 line-clamp-2 leading-relaxed max-w-2xl">
                {data.descriptions[0]}
              </p>
              
              {/* Quote */}
              <p className="hidden md:block text-yellow-400 italic text-sm mb-5 border-l-4 border-yellow-500 pl-4">
                &ldquo;I&apos;m gonna be King of the Pirates!&rdquo; - Monkey D. Luffy
              </p>
              
              {/* Action Buttons - Pirate Theme */}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <button 
                  onClick={handlePlayLatest}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-2 px-4 sm:py-3 sm:px-6 md:py-4 md:px-10 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-red-500/30 border border-red-400/30 text-sm sm:text-base"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                  <span>Set Sail!</span>
                </button>
                <button 
                  onClick={() => document.getElementById('episodes-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-sky-600/80 to-blue-700/80 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 md:py-4 md:px-8 rounded-lg flex items-center gap-2 transition-all border border-sky-400/30 text-sm sm:text-base"
                >
                  <Compass className="w-5 h-5 md:w-6 md:h-6" />
                  <span>Navigate</span>
                </button>
                <button 
                  onClick={handleToggleMyList}
                  className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                    isInList
                      ? 'border-yellow-400 bg-yellow-500/30 hover:bg-yellow-500/50'
                      : 'border-sky-400 hover:border-yellow-400 hover:bg-yellow-500/20'
                  }`}
                  title={isInList ? 'Remove from Crew' : 'Join the Crew!'}
                >
                  {isInList ? (
                    <Check className="w-5 h-5 md:w-7 md:h-7 text-yellow-400" />
                  ) : (
                    <Plus className="w-5 h-5 md:w-7 md:h-7 text-sky-300" />
                  )}
                </button>
                <button 
                  onClick={handleToggleLike}
                  className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                    isLiked
                      ? 'border-red-400 bg-red-500/30 hover:bg-red-500/50'
                      : 'border-sky-400 hover:border-red-400 hover:bg-red-500/20'
                  }`}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <ThumbsUp className={`w-4 h-4 md:w-6 md:h-6 ${isLiked ? 'text-red-400 fill-red-400' : 'text-sky-300'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Straw Hat Crew Section */}
      <section className="relative z-10 py-8 md:py-12 bg-gradient-to-b from-transparent via-[#0d2137]/50 to-transparent">
        <div className="px-4 sm:px-6 md:px-16">
          <div className="flex items-center gap-3 mb-6">
            <Skull className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl md:text-3xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              STRAW HAT PIRATES
            </h2>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {strawHatCrew.map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#1a3a5c]/80 to-[#0d2137]/80 rounded-lg p-3 md:p-4 border border-sky-500/20 hover:border-yellow-500/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/10 group"
              >
                <div className="h-10 md:h-12 mb-2 flex items-center group-hover:animate-bounce">
                  {index === 0 ? (
                    <Image src={StrawHatImg} alt="Straw Hat" width={48} height={30} className="drop-shadow-lg" />
                  ) : (
                    <span className="text-2xl md:text-3xl">{member.emoji}</span>
                  )}
                </div>
                <h3 className="text-sm md:text-base font-bold text-white truncate">{member.name}</h3>
                <p className="text-xs text-sky-300">{member.role}</p>
                <p className="text-xs text-yellow-400 mt-1">฿{member.bounty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Arc Navigator */}
      <section className="relative z-10 py-6 md:py-10">
        <div className="px-4 sm:px-6 md:px-16">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-red-400" />
            <h2 className="text-xl md:text-2xl font-heading text-white">GRAND LINE NAVIGATOR</h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => setSelectedArc(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedArc 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black' 
                  : 'bg-[#1a3a5c]/50 text-sky-300 hover:bg-[#1a3a5c] border border-sky-500/30'
              }`}
            >
              All Episodes
            </button>
            {majorArcs.map((arc, index) => (
              <button
                key={index}
                onClick={() => setSelectedArc(arc.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedArc === arc.name 
                    ? `bg-gradient-to-r ${arc.color} text-white shadow-lg` 
                    : 'bg-[#1a3a5c]/50 text-sky-300 hover:bg-[#1a3a5c] border border-sky-500/30'
                }`}
              >
                {arc.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Episode Section */}
      <section id="episodes-section" className="relative z-10 pb-8 md:pb-16">
        <div className="px-4 sm:px-6 md:px-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Ship className="w-7 h-7 text-sky-400" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading text-white">
                {selectedArc || 'ALL EPISODES'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-sky-300">{getFilteredEpisodes().length} Episodes</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a3a5c]/50 hover:bg-[#1a3a5c] text-sky-300 hover:text-white transition-colors text-xs sm:text-sm border border-sky-500/30"
              >
                {sortOrder === 'desc' ? (
                  <>
                    <ArrowDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Terbaru</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Terlama</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Episode Grid - Wanted Poster Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {getFilteredEpisodes().map((
              episode: {
                episode: number;
                title: string;
                description: string;
                detail_eps: string;
              },
              index: number
            ) => (
              <div
                key={index}
                onClick={() => handlePlayEpisode(episode.detail_eps)}
                className="group relative bg-gradient-to-br from-[#1a3a5c] to-[#0d2137] rounded-lg overflow-hidden border border-sky-500/20 hover:border-yellow-500/50 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/10 cursor-pointer"
              >
                {/* Episode Image */}
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={data.img}
                    alt={episode.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg shadow-red-500/50">
                      <Play className="w-6 h-6 md:w-7 md:h-7 text-white fill-white ml-1" />
                    </div>
                  </div>
                  
                  {/* Episode Number Badge */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border border-yellow-500/30">
                    EP {episode.episode}
                  </div>
                </div>
                
                {/* Episode Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-yellow-400 transition-colors">
                    {episode.title}
                  </h3>
                  <p className="text-xs text-sky-300/70 line-clamp-2 mt-1">
                    {episode.description}
                  </p>
                </div>
                
                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* About Section */}
        <div id="about-section" className="px-4 sm:px-6 md:px-16 mt-12 md:mt-20">
          <div className="flex items-center gap-3 mb-6">
            <Anchor className="w-7 h-7 text-yellow-400" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              ABOUT ONE PIECE
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-gradient-to-br from-[#1a3a5c]/50 to-[#0d2137]/50 rounded-xl p-5 sm:p-6 border border-sky-500/20">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-yellow-400 flex items-center gap-2">
                <span>📜</span> Synopsis
              </h3>
              <div className="text-sky-100/80 text-sm leading-relaxed space-y-3">
                {data.descriptions.map((desc: string, index: number) => (
                  <p key={index}>{desc}</p>
                ))}
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">English:</span>
                <span className="text-white text-xs sm:text-sm">{data.english_title?.trim()}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">Season:</span>
                <span className="text-white text-xs sm:text-sm">{data.season}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">Studio:</span>
                <span className="text-white text-xs sm:text-sm">{data.studio}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">Producers:</span>
                <span className="text-white text-xs sm:text-sm line-clamp-2">{data.producer}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">Released:</span>
                <span className="text-white text-xs sm:text-sm">{data.released}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">Source:</span>
                <span className="text-white text-xs sm:text-sm">{data.source}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">Rating:</span>
                <span className="text-yellow-400 flex items-center gap-1 text-xs sm:text-sm">
                  ⭐ {data.rating} <span className="text-sky-400/60">({data.rating_count})</span>
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-sky-400 w-24 flex-shrink-0 text-xs sm:text-sm">Genres:</span>
                <div className="flex flex-wrap gap-2">
                  {data.genres.map((genre: { tag: string }, index: number) => (
                    <span key={index} className="bg-gradient-to-r from-red-600/30 to-orange-600/30 text-yellow-400 px-3 py-1 rounded-full text-xs border border-yellow-500/30">
                      {genre.tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Video Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/95 z-[100] p-0 sm:p-4 overflow-y-auto scrollbar-modal">
          <div className="relative bg-gradient-to-br from-[#1a3a5c] to-[#0d2137] sm:rounded-xl w-full max-w-4xl shadow-2xl shadow-sky-500/20 max-h-full sm:max-h-[90vh] overflow-y-auto scrollbar-modal border border-sky-500/30">
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowPlayer(false);
                setVideoUrl(null);
                setEpisodeDetails(null);
              }} 
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-10 h-10 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Video Player */}
            <div className="relative aspect-video bg-black sm:rounded-t-xl overflow-hidden">
              {videoUrl ? (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Video Player"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <span className="text-5xl mb-4 animate-bounce">⚓</span>
                  <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            
            {/* Episode Info */}
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                {episodeDetails?.title || 'Loading...'}
              </h2>
              <p className="text-sky-300/80 text-sm sm:text-base mb-6 line-clamp-2 sm:line-clamp-none">
                {episodeDetails?.description}
              </p>
              
              {/* Server Selection */}
              {episodeDetails?.videos && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>⚔️</span> Select Server
                  </h3>
                  {Object.entries(groupByProvider(episodeDetails.videos as never[])).map(
                    ([providerName, videos], index) => (
                      <div key={index} className="bg-[#0d2137]/50 rounded-lg p-4 border border-sky-500/20">
                        <h4 className="text-xs sm:text-sm font-medium text-sky-400 mb-3 uppercase tracking-wider">
                          {providerName}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {videos.map((video: { video: string; title: string }, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => fetchVideoUrl(video.video)}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-yellow-500 hover:to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 border border-transparent hover:border-yellow-400/50"
                            >
                              {video.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnePiecePage;
