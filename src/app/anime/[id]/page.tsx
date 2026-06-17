/* eslint-disable @next/next/no-img-element */
"use client";
import React, { use, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import Image from "next/image";
import EpisodeCard from "@/components/EpisodeCard";
import Footer from "@/components/Footer";
import dataSupport from "@/utils/dataSupport";
import { getTrailerBySlug, getYouTubeEmbedUrl } from "@/utils/animeTrailers";
import { Play, Plus, Check, ThumbsUp, Info, Volume2, VolumeX, X, ArrowUpDown, ArrowUp, ArrowDown, Server, Loader2, MonitorPlay, Film, Clock, Calendar, Download, ExternalLink, ChevronDown, Package } from "lucide-react";
import { isInMyList, toggleMyList, isAnimeLiked, toggleLikeAnime } from "@/utils/myList";
import groupByProvider from "@/utils/groupByProvider";
import { API_URL } from '@/utils/config';

async function fetchAnimeDetail(id: string) {
  const { data } = await axios.get(
    `${API_URL}/detail-anime/${id}`
  );
  return data;
}

interface DownloadLink {
  title: string;
  link: string;
}

interface DownloadResolution {
  resolution: string;
  links: DownloadLink[];
}

interface DownloadFormat {
  format: string;
  list: DownloadResolution[];
}

interface BatchDownloadResponse {
  title?: string;
  img?: string;
  downloads: DownloadFormat[];
}

async function fetchBatchDownload(id: string): Promise<BatchDownloadResponse> {
  try {
    const { data } = await axios.get(
      `${API_URL}/download-anime/${id}`
    );
    return data;
  } catch {
    return { downloads: [] };
  }
}

interface AnimePageProps {
  params: Promise<{ id: string }>;
}

const Anime = (props: AnimePageProps) => {
  const { id } = use(props.params);
  const [isMuted, setIsMuted] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<{
    videos: { id: string; title: string; video: string; type: string }[];
    title: string;
    description: string;
    downloads?: DownloadFormat[];
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = newest first, asc = oldest first
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [expandedResolutions, setExpandedResolutions] = useState<string[]>([]);
  const [selectedEpisodeFormat, setSelectedEpisodeFormat] = useState<string>('');
  const [expandedEpisodeResolutions, setExpandedEpisodeResolutions] = useState<string[]>([]);
  
  // Get trailer info from config
  const trailer = getTrailerBySlug(id);
  const trailerUrl = getYouTubeEmbedUrl(id, { muted: isMuted });
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["detail-anime", id],
    queryFn: () => fetchAnimeDetail(id),
  });

  const { data: batchDownload, isLoading: isLoadingBatch } = useQuery({
    queryKey: ["batch-download", id],
    queryFn: () => fetchBatchDownload(id),
    enabled: !!data,
  });

  // Set default format when batch download data is loaded
  useEffect(() => {
    if (batchDownload?.downloads && batchDownload.downloads.length > 0 && !selectedFormat) {
      setSelectedFormat(batchDownload.downloads[0].format);
    }
  }, [batchDownload, selectedFormat]);

  // Toggle resolution expansion
  const toggleResolution = (resolution: string) => {
    setExpandedResolutions(prev => 
      prev.includes(resolution) 
        ? prev.filter(r => r !== resolution)
        : [...prev, resolution]
    );
  };

  // Toggle episode download resolution expansion
  const toggleEpisodeResolution = (resolution: string) => {
    setExpandedEpisodeResolutions(prev => 
      prev.includes(resolution) 
        ? prev.filter(r => r !== resolution)
        : [...prev, resolution]
    );
  };

  // Set default episode format when episode details are loaded
  useEffect(() => {
    if (episodeDetails?.downloads && episodeDetails.downloads.length > 0 && !selectedEpisodeFormat) {
      setSelectedEpisodeFormat(episodeDetails.downloads[0].format);
    }
  }, [episodeDetails, selectedEpisodeFormat]);

  // Reset episode download state when modal closes
  useEffect(() => {
    if (!showPlayer) {
      setSelectedEpisodeFormat('');
      setExpandedEpisodeResolutions([]);
    }
  }, [showPlayer]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if anime is in My List and Liked
  useEffect(() => {
    if (data) {
      const link = `/anime/${id}`;
      
      const checkList = () => {
        setIsInList(isInMyList(link));
      };
      
      const checkLiked = () => {
        setIsLiked(isAnimeLiked(link));
      };
      
      checkList();
      checkLiked();
      
      // Listen for updates
      const handleListUpdate = () => checkList();
      const handleLikedUpdate = () => checkLiked();
      
      window.addEventListener('mylist-updated', handleListUpdate);
      window.addEventListener('liked-updated', handleLikedUpdate);
      
      return () => {
        window.removeEventListener('mylist-updated', handleListUpdate);
        window.removeEventListener('liked-updated', handleLikedUpdate);
      };
    }
  }, [data, id]);

  // Handle add/remove from My List
  const handleToggleMyList = useCallback(() => {
    if (!data) return;
    
    toggleMyList({
      link: `/anime/${id}`,
      img: data.img,
      alt: data.title,
      title: data.title,
      episode: `${data.episodes?.length || 0} Episodes`,
      released: data.released,
      type: data.type,
      score: parseFloat(data.rating) || 0,
    });
  }, [data, id]);

  // Handle like/unlike
  const handleToggleLike = useCallback(() => {
    toggleLikeAnime(`/anime/${id}`);
  }, [id]);

  // Fetch video URL
  const fetchVideoUrl = useCallback(async (videoPath: string) => {
    try {
      setIsLoadingVideo(true);
      setSelectedVideoPath(videoPath);
      const response = await fetch(`${API_URL}${videoPath}`);
      const videoData = await response.json();
      setVideoUrl(videoData.url);
    } catch (error) {
      console.error('Failed to fetch video:', error);
    } finally {
      setIsLoadingVideo(false);
    }
  }, []);

  // Close modal handler
  const closeModal = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      setShowPlayer(false);
      setVideoUrl(null);
      setEpisodeDetails(null);
      setSelectedVideoPath(null);
    }, 200);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showPlayer) {
        closeModal();
      }
    };
    
    if (showPlayer) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showPlayer, closeModal]);

  // Animate modal in
  useEffect(() => {
    if (showPlayer) {
      requestAnimationFrame(() => {
        setShowModal(true);
      });
    }
  }, [showPlayer]);

  // Play latest episode
  const handlePlayLatest = useCallback(async () => {
    if (!data || !data.episodes || data.episodes.length === 0) return;
    
    // Get the latest episode (last in the array)
    const latestEpisode = data.episodes[data.episodes.length - 1];
    
    try {
      setVideoUrl(null);
      setEpisodeDetails(null);
      setShowPlayer(true);
      
      const response = await axios.get(
        `${API_URL}${latestEpisode.detail_eps}`
      );

      console.log("response.data loh yah =>", response);
      
      setEpisodeDetails(response.data);
      
      // Auto-play first video
      if (response.data.videos && response.data.videos.length > 0) {
        const firstVideoPath = response.data.videos[0].video;
        setSelectedVideoPath(firstVideoPath);
        fetchVideoUrl(firstVideoPath);
      }
    } catch (error) {
      console.error('Failed to fetch episode:', error);
    }
  }, [data, fetchVideoUrl]);

  if (isLoading)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-black">
        <Loading />
      </div>
    );
  if (isError)
    return (
      <div className="w-full h-screen flex justify-center items-center bg-black">
        <h1 className="text-white">Error</h1>
      </div>
    );

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <main className="relative">
        <div className="relative w-full h-[70vh] min-h-[400px] max-h-[500px] md:min-h-[600px] md:max-h-none lg:min-h-[700px] overflow-hidden">
          {/* Video Background for supported anime */}
          {trailer && trailerUrl ? (
            <>
              <div className="absolute inset-0 w-full h-full">
                <iframe
                  src={trailerUrl}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] sm:w-[200%] sm:h-[200%] md:w-[150%] md:h-[150%] pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${trailer.title || 'Anime'} Trailer`}
                />
              </div>
              
              {/* Mute/Unmute Button - positioned differently on mobile */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 md:bottom-24 md:right-16 z-30 w-9 h-9 md:w-12 md:h-12 rounded-full border border-gray-500 md:border-2 md:border-gray-400 hover:border-white bg-black/60 md:bg-black/50 flex items-center justify-center transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 md:w-6 md:h-6 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 md:w-6 md:h-6 text-white" />
                )}
              </button>
            </>
          ) : (
            <Image
              src={
                dataSupport.find((support) => support.slug === id)?.landscape ||
                data.img
              }
              alt={data.title}
              layout="fill"
              objectFit="cover"
              className="object-top"
            />
          )}
          
          {/* Gradient Overlays - stronger on mobile for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 md:via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 md:via-black/20 to-black/30 z-10" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 md:px-16 pb-8 md:pb-16 pt-20 z-20">
            <div className="max-w-2xl">
              {/* Logo or Title */}
              {dataSupport.some((support) => support.slug === id) &&
              dataSupport.find((support) => support?.slug === id)?.logo !== "" ? (
                <img
                  src={dataSupport.find((support) => support.slug === id)?.logo || ""}
                  alt="Logo"
                  className="mb-3 md:mb-4 w-auto h-[60px] sm:h-[80px] md:h-[120px] lg:h-[150px] drop-shadow-2xl"
                />
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-heading mb-2 md:mb-3 drop-shadow-2xl leading-tight">
                  {data.synonims}
                </h1>
              )}
              
              {/* Japanese Title - smaller on mobile */}
              <p className="text-sm sm:text-base md:text-xl text-gray-300 mb-2 md:mb-3 font-light line-clamp-1">
                {data.japanese_title}
              </p>
              
              {/* Meta Info */}
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-2 md:mb-3 flex-wrap text-[10px] sm:text-xs md:text-sm">
                <span className="text-green-500 font-semibold">{data.rating}% Match</span>
                <span className="border border-gray-500 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">{data.type}</span>
                <span className="text-gray-400 hidden sm:inline">{data.season}</span>
                <span className="border border-gray-500 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">HD</span>
              </div>
              
              {/* Genres - show fewer on mobile */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 md:mb-4 flex-wrap">
                {data.genres.slice(0, 3).map((genre: { tag: string }, index: number) => (
                  <React.Fragment key={index}>
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-300">{genre.tag}</span>
                    {index < Math.min(data.genres.length, 3) - 1 && (
                      <span className="text-gray-600">�</span>
                    )}
                  </React.Fragment>
                ))}
                {data.genres.length > 3 && (
                  <span className="hidden md:inline text-gray-600">�</span>
                )}
                {data.genres.slice(3, 4).map((genre: { tag: string }, index: number) => (
                  <span key={index + 3} className="hidden md:inline text-xs md:text-sm text-gray-300">{genre.tag}</span>
                ))}
              </div>
              
              {/* Description - Hidden on mobile */}
              <p className="hidden md:block text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed max-w-xl">
                {data.descriptions[0]}
              </p>
              
              {/* Action Buttons - compact on mobile */}
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {data.episodes && data.episodes.length > 0 ? (
                  <button 
                    onClick={handlePlayLatest}
                    className="bg-white hover:bg-gray-200 text-black font-semibold py-1.5 px-3 sm:py-2 sm:px-4 md:py-3 md:px-8 rounded flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm md:text-base"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-black" />
                    <span>Play</span>
                  </button>
                ) : (
                  <button 
                    disabled
                    className="bg-gray-600 text-gray-400 font-semibold py-1.5 px-3 sm:py-2 sm:px-4 md:py-3 md:px-8 rounded flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base cursor-not-allowed"
                    title="Belum ada episode tersedia"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-gray-400" />
                    <span>Coming Soon</span>
                  </button>
                )}
                <button 
                  onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gray-600/80 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 md:py-3 md:px-8 rounded flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm md:text-base"
                >
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  <span className="hidden sm:inline">More Info</span>
                  <span className="sm:hidden">Info</span>
                </button>
                {batchDownload && batchDownload.downloads && batchDownload.downloads.length > 0 && (
                  <button 
                    onClick={() => document.getElementById('batch-download-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 md:py-3 md:px-8 rounded flex items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm md:text-base"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">DL</span>
                  </button>
                )}
                <button 
                  onClick={handleToggleMyList}
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border sm:border-2 flex items-center justify-center transition-all ${
                    isInList
                      ? 'border-green-500 bg-green-500/30 hover:bg-green-500/50'
                      : 'border-gray-500 sm:border-gray-400 hover:border-white'
                  }`}
                  title={isInList ? 'Remove from My List' : 'Add to My List'}
                >
                  {isInList ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500" />
                  ) : (
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  )}
                </button>
                <button 
                  onClick={handleToggleLike}
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border sm:border-2 flex items-center justify-center transition-all ${
                    isLiked
                      ? 'border-blue-500 bg-blue-500/30 hover:bg-blue-500/50'
                      : 'border-gray-500 sm:border-gray-400 hover:border-white'
                  }`}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${isLiked ? 'text-blue-500 fill-blue-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Episode Section */}
      <section className="relative z-10 pb-8 md:pb-16 bg-black">
        <div className="px-4 sm:px-6 md:px-16">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading tracking-wide">EPISODES</h2>
            {data.episodes && data.episodes.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-gray-400">{data.episodes.length} Episodes</span>
                {/* Sort Toggle Button */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-xs sm:text-sm"
                  title={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                >
                  {sortOrder === 'desc' ? (
                    <>
                      <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Terbaru</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Terlama</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Episode Grid or Empty State */}
          {data.episodes && data.episodes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {(sortOrder === 'desc' 
                ? data.episodes.slice().reverse() 
                : data.episodes.slice()
              ).map(
                  (
                    episode: {
                      episode: number;
                      title: string;
                      description: string;
                      detail_eps: string;
                    },
                    index: number
                  ) => (
                    <EpisodeCard
                      key={index}
                      episodeNumber={episode.episode}
                      title={episode.title}
                      description={episode.description}
                      img={data.img}
                      detail_eps={episode.detail_eps}
                    />
                  )
                )}
            </div>
          ) : (
            /* Empty State - No Episodes */
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
              <div className="relative mb-6">
                {/* Background glow */}
                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl scale-150" />
                {/* Icon container */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
                  <Film className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                </div>
              </div>
              
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 text-center">
                Belum Ada Episode
              </h3>
              <p className="text-gray-400 text-sm sm:text-base text-center max-w-md mb-6 px-4">
                Episode untuk anime ini belum tersedia. Silakan cek kembali nanti atau lihat jadwal tayang.
              </p>
            </div>
          )}
        </div>

        {/* Batch Download Section */}
        {batchDownload && batchDownload.downloads && batchDownload.downloads.length > 0 && (
          <div id="batch-download-section" className="px-4 sm:px-6 md:px-16 mt-8 md:mt-12">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-heading tracking-wide">BATCH DOWNLOAD</h2>
                <p className="text-xs sm:text-sm text-gray-400">Download semua episode sekaligus</p>
              </div>
            </div>

            {isLoadingBatch ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800/50 rounded-2xl overflow-hidden">
                {/* Format Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-800/50">
                  {batchDownload.downloads.map((format) => (
                    <button
                      key={format.format}
                      onClick={() => setSelectedFormat(format.format)}
                      className={`relative px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-200 ${
                        selectedFormat === format.format
                          ? 'text-emerald-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {format.format}
                      {selectedFormat === format.format && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Resolution List */}
                <div className="p-3 sm:p-4 md:p-6 space-y-3">
                  {batchDownload.downloads
                    .find(f => f.format === selectedFormat)
                    ?.list.map((resolution) => {
                      const isExpanded = expandedResolutions.includes(`${selectedFormat}-${resolution.resolution}`);
                      return (
                        <div 
                          key={resolution.resolution}
                          className="bg-gray-800/40 border border-gray-700/30 rounded-xl overflow-hidden hover:border-gray-600/50 transition-colors"
                        >
                          {/* Resolution Header */}
                          <button
                            onClick={() => toggleResolution(`${selectedFormat}-${resolution.resolution}`)}
                            className="w-full flex items-center justify-between p-3 sm:p-4 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 sm:w-14 h-8 sm:h-9 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                                <span className="text-emerald-400 text-xs sm:text-sm font-bold">{resolution.resolution}</span>
                              </div>
                              <div className="text-left">
                                <span className="text-white text-sm sm:text-base font-medium">{selectedFormat} - {resolution.resolution}</span>
                                <p className="text-gray-500 text-xs">{resolution.links.length} mirror tersedia</p>
                              </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Download Links */}
                          {isExpanded && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                {resolution.links.map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gray-700/40 hover:bg-emerald-500/20 border border-gray-600/30 hover:border-emerald-500/40 transition-all duration-200"
                                  >
                                    <Download className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                                    <span className="text-xs sm:text-sm text-gray-300 group-hover:text-emerald-400 font-medium transition-colors">{link.title}</span>
                                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* More Details Section */}
        <div id="about-section" className="px-4 sm:px-6 md:px-16 mt-8 md:mt-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-heading tracking-wide mb-4 md:mb-6">ABOUT THIS ANIME</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-gray-900/50 rounded-lg p-4 sm:p-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 md:mb-4 text-white">Synopsis</h3>
              <div className="text-gray-400 text-xs sm:text-sm leading-relaxed space-y-2 sm:space-y-3">
                {data.descriptions.map((desc: string, index: number) => (
                  <p key={index}>{desc}</p>
                ))}
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">English:</span>
                <span className="text-white text-xs sm:text-sm">{data.english_title.trim()}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">Season:</span>
                <span className="text-white text-xs sm:text-sm">{data.season}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">Studio:</span>
                <span className="text-white text-xs sm:text-sm">{data.studio}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">Producers:</span>
                <span className="text-white text-xs sm:text-sm line-clamp-2">{data.producer}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">Released:</span>
                <span className="text-white text-xs sm:text-sm">{data.released}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">Source:</span>
                <span className="text-white text-xs sm:text-sm">{data.source}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">Rating:</span>
                <span className="text-yellow-400 flex items-center gap-1 text-xs sm:text-sm">
                  ? {data.rating} <span className="text-gray-500">({data.rating_count})</span>
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-gray-500 w-20 sm:w-24 flex-shrink-0 text-xs sm:text-sm">Genres:</span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {data.genres.map((genre: { tag: string }, index: number) => (
                    <span key={index} className="bg-red-600/20 text-red-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
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
      {showPlayer && isMounted &&
        createPortal(
          <div 
            className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto scrollbar-modal transition-all duration-200 ${
              showModal ? 'bg-black/95 backdrop-blur-sm' : 'bg-transparent'
            }`}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div 
              className={`relative bg-gradient-to-b from-gray-900 to-gray-950 sm:rounded-2xl w-full max-w-5xl shadow-2xl max-h-full sm:max-h-[95vh] overflow-hidden transition-all duration-200 ${
                showModal ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              {/* Header Bar */}
              <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 sm:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white font-bold text-sm sm:text-base">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm sm:text-base line-clamp-1">
                      Now Playing
                    </span>
                    <span className="text-gray-400 text-[10px] sm:text-xs hidden sm:block">
                      {episodeDetails?.title?.slice(0, 50)}...
                    </span>
                  </div>
                </div>
                
                {/* Close Button */}
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:rotate-90 duration-200"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
              
              {/* Video Player */}
              <div className="relative aspect-video bg-black overflow-hidden">
                {videoUrl && !isLoadingVideo ? (
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Player"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/20 flex items-center justify-center">
                        {isLoadingVideo ? (
                          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 animate-spin" />
                        ) : (
                          <MonitorPlay className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      {isLoadingVideo ? 'Loading video...' : 'Loading player...'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Episode Info & Server Selection */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[40vh] sm:max-h-[35vh] scrollbar-modal">
                {/* Episode Title & Description */}
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
                    {episodeDetails?.title || 'Loading...'}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {episodeDetails?.description}
                  </p>
                </div>
                
                {/* Server Selection */}
                {episodeDetails?.videos && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                      <h3 className="text-sm sm:text-base font-semibold text-white">Select Server</h3>
                    </div>
                    
                    <div className="grid gap-3">
                      {Object.entries(groupByProvider(episodeDetails.videos)).map(
                        ([providerName, videos], index) => (
                          <div 
                            key={index} 
                            className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3 sm:p-4 hover:border-gray-600/50 transition-colors"
                          >
                            <h4 className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-2 sm:mb-3 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              {providerName}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {videos.map((video: { video: string; title: string }, idx: number) => (
                                <button
                                  key={idx}
                                  onClick={() => fetchVideoUrl(video.video)}
                                  disabled={isLoadingVideo}
                                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                                    selectedVideoPath === video.video
                                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
                                  } ${isLoadingVideo ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {selectedVideoPath === video.video && isLoadingVideo && (
                                    <Loader2 className="w-3 h-3 animate-spin absolute left-1.5 top-1/2 -translate-y-1/2" />
                                  )}
                                  <span className={selectedVideoPath === video.video && isLoadingVideo ? 'ml-4' : ''}>
                                    {video.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Episode Download Section */}
                {episodeDetails?.downloads && episodeDetails.downloads.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      <h3 className="text-sm sm:text-base font-semibold text-white">Download Episode</h3>
                    </div>

                    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden">
                      {/* Format Tabs */}
                      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-700/50">
                        {episodeDetails.downloads.map((format) => (
                          <button
                            key={format.format}
                            onClick={() => setSelectedEpisodeFormat(format.format)}
                            className={`px-4 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                              selectedEpisodeFormat === format.format
                                ? 'text-emerald-400 bg-gray-700/50 border-b-2 border-emerald-500'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                            }`}
                          >
                            {format.format.length > 20 ? format.format.split(' ')[0] : format.format}
                          </button>
                        ))}
                      </div>

                      {/* Resolution List */}
                      <div className="p-3 space-y-2">
                        {episodeDetails.downloads
                          .find(f => f.format === selectedEpisodeFormat)
                          ?.list.map((resolution) => {
                            const isExpanded = expandedEpisodeResolutions.includes(`${selectedEpisodeFormat}-${resolution.resolution}`);
                            return (
                              <div 
                                key={resolution.resolution}
                                className={`rounded-lg overflow-hidden transition-colors ${
                                  isExpanded ? 'bg-gray-700/40' : 'bg-gray-700/20 hover:bg-gray-700/30'
                                }`}
                              >
                                <button
                                  onClick={() => toggleEpisodeResolution(`${selectedEpisodeFormat}-${resolution.resolution}`)}
                                  className="w-full flex items-center justify-between p-2.5 sm:p-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                                      {resolution.resolution}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {resolution.links.length} link
                                    </span>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {isExpanded && (
                                  <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
                                    <div className="flex flex-wrap gap-1.5">
                                      {resolution.links.map((link, idx) => (
                                        <a
                                          key={idx}
                                          href={link.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-gray-600/50 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 text-xs transition-colors"
                                        >
                                          <Download className="w-3 h-3" />
                                          {link.title}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default Anime;
