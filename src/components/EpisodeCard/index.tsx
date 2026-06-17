"use client";
import React, { Fragment, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { X, Play, Clock, Server, Loader2, MonitorPlay } from "lucide-react";
import groupByProvider from "@/utils/groupByProvider";
import { API_URL } from '@/utils/config';

interface EpisodeCardProps {
  episodeNumber: number;
  title: string;
  description: string;
  img: string;
  detail_eps: string;
}

type PlayerOption = {
  id: string;
  title: string;
  post: string;
  action: string;
  nume: string;
  type: string;
  video: string;
};

type EpisodeDetails = {
  videos: PlayerOption[];
  title: string;
  description: string;
};

const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episodeNumber,
  title,
  description,
  img,
  detail_eps,
}) => {
  const [popup, setPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchEpisodeDetails() {
    const { data } = await axios.get(
      `${API_URL}${detail_eps}`
    );
    return data;
  }

  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);

  const fetchEpisodeDetailsOnTrigger = async () => {
    setEpisodeDetails(null);
    setVideoUrl(null);
    setSelectedVideoPath(null);
    setPopup(true);
    
    const data = await fetchEpisodeDetails();
    const firstVideoPath = data.videos?.[0]?.video;
    if (firstVideoPath) {
      fetchEpisodeVideos(firstVideoPath);
    }
    setEpisodeDetails(data);
  };

  const fetchEpisodeVideos = async (video: string) => {
    setIsLoadingVideo(true);
    setSelectedVideoPath(video);
    
    try {
      const response = await fetch(
        `${API_URL}${video}`
      );
      const data = await response.json();
      setVideoUrl(data.url);
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      setPopup(false);
      setVideoUrl(null);
      setEpisodeDetails(null);
      setSelectedVideoPath(null);
    }, 200);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popup) {
        closeModal();
      }
    };
    
    if (popup) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [popup, closeModal]);

  // Animate modal in
  useEffect(() => {
    if (popup) {
      requestAnimationFrame(() => {
        setShowModal(true);
      });
    }
  }, [popup]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Fragment>
      {/* Episode Card - Netflix Style */}
      <div
        onClick={fetchEpisodeDetailsOnTrigger}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-gray-900 rounded-md overflow-hidden cursor-pointer hover:bg-gray-800 transition-all duration-300"
      >
        {/* Mobile: Stack layout, Desktop: Horizontal layout */}
        <div className="flex flex-col sm:flex-row sm:gap-4 p-2 sm:p-3">
          {/* Thumbnail */}
          <div className="relative w-full sm:w-32 h-24 sm:h-20 flex-shrink-0 rounded overflow-hidden">
            <img 
              src={img} 
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Play overlay on hover */}
            <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-black fill-black ml-0.5" />
              </div>
            </div>
            {/* Episode number badge */}
            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium">
              Ep {episodeNumber}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0 mt-2 sm:mt-0">
            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
              <h3 className="font-semibold text-white text-xs sm:text-sm truncate">
                Episode {episodeNumber}
              </h3>
              <div className="hidden sm:flex items-center gap-1 text-gray-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>24m</span>
              </div>
            </div>
            <p className="text-gray-400 text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2">{title}</p>
            <p className="hidden sm:block text-gray-500 text-xs mt-1 line-clamp-1">{description}</p>
          </div>
        </div>
        
        {/* Bottom border highlight on hover */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 transform origin-left transition-transform duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
      </div>

      {/* Video Popup Modal */}
      {popup && isMounted &&
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
                    {episodeNumber}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm sm:text-base line-clamp-1">
                      Episode {episodeNumber}
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
                              {videos.map((video, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => fetchEpisodeVideos(video.video)}
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
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </Fragment>
  );
};

export default EpisodeCard;
