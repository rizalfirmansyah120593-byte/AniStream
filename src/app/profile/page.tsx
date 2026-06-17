/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { 
  UserRound, 
  Heart, 
  Trash2, 
  Play, 
  Star, 
  Calendar, 
  Film, 
  AlertCircle,
  CheckCircle,
  X,
  Bookmark,
  Clock
} from "lucide-react";
import { getMyList, removeFromMyList, clearMyList, SavedAnime } from "@/utils/myList";

export default function ProfilePage() {
  const [myList, setMyList] = useState<SavedAnime[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load My List on mount
  useEffect(() => {
    const loadMyList = () => {
      const list = getMyList();
      setMyList(list);
    };
    
    loadMyList();
    
    // Listen for updates
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SavedAnime[]>;
      setMyList(customEvent.detail);
    };
    window.addEventListener('mylist-updated', handleUpdate);
    return () => window.removeEventListener('mylist-updated', handleUpdate);
  }, []);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle remove from list
  const handleRemove = (anime: SavedAnime) => {
    const success = removeFromMyList(anime.link);
    if (success) {
      showNotification(`"${anime.title}" telah dihapus dari My List`, 'success');
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    clearMyList();
    setShowClearConfirm(false);
    showNotification('Semua anime telah dihapus dari My List', 'success');
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
          <span className="text-white text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="pt-20 pb-8 px-4 md:px-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl">
              <UserRound className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
            
            {/* Profile Info */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-4xl font-heading text-white mb-2">Guest User</h1>
              <p className="text-gray-400 mb-4">Selamat datang di AniStream</p>
              
              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <span className="text-white font-semibold">{myList.length}</span>
                  <span className="text-gray-400 text-sm">My List</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-blue-500" />
                  <span className="text-white font-semibold">0</span>
                  <span className="text-gray-400 text-sm">Bookmarks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My List Section */}
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <h2 className="text-xl md:text-2xl font-heading text-white">My List</h2>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {myList.length}
              </span>
            </div>
            
            {myList.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>
            )}
          </div>

          {/* My List Grid */}
          {myList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {myList.map((anime, index) => (
                <div 
                  key={index} 
                  className="group relative bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all"
                >
                  {/* Image */}
                  <Link href={anime.link}>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={anime.img}
                        alt={anime.alt || anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Play button on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>

                      {/* Type Badge */}
                      {anime.type && (
                        <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 bg-red-600 text-white rounded font-medium">
                          {anime.type}
                        </span>
                      )}

                      {/* Score Badge */}
                      {anime.score && Number(anime.score) > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-xs">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-white">{Number(anime.score).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <Link href={anime.link}>
                      <h3 className="text-white text-sm font-medium line-clamp-2 hover:text-red-400 transition-colors mb-2">
                        {anime.title}
                      </h3>
                    </Link>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      {anime.episode && (
                        <span className="flex items-center gap-1">
                          <Film className="w-3 h-3" />
                          {anime.episode}
                        </span>
                      )}
                    </div>

                    {/* Added date */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                      <Clock className="w-3 h-3" />
                      Ditambahkan: {formatDate(anime.addedAt)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(anime)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-800 hover:bg-red-600/20 text-gray-400 hover:text-red-400 transition-colors text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-heading text-white mb-2">My List Kosong</h3>
              <p className="text-gray-400 max-w-md mb-6">
                Belum ada anime di My List kamu. Klik tombol + pada anime yang ingin kamu simpan untuk ditonton nanti.
              </p>
              <Link href="/">
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Play className="w-5 h-5 fill-white" />
                  Jelajahi Anime
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <div 
            className="bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-heading text-white">Hapus Semua?</h3>
                <p className="text-gray-400 text-sm">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Apakah kamu yakin ingin menghapus semua {myList.length} anime dari My List?
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
