/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useQuery, useQueries } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { Star, Play, Calendar, Clock, List, Grid3X3, X } from "lucide-react";
import { API_URL } from '@/utils/config';

interface ScheduleAnime {
  title: string;
  slug: string;
  img: string;
  type: string;
  score: number;
  genres: string[];
  time: string;
  schedule: string;
  description: string;
  detail_url: string;
}

interface DayOption {
  day: string;
  day_value: string;
  endpoint: string;
}

interface ScheduleResponse {
  message: string;
  day: string;
  day_value: string;
  available_days: DayOption[];
  total_anime: number;
  data: ScheduleAnime[];
}

async function fetchSchedule(day: string): Promise<ScheduleResponse> {
  const { data } = await axios.get(
    `${API_URL}/release-schedule?day=${day}`
  );
  return data;
}

// Get current day value
function getCurrentDayValue(): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = new Date().getDay();
  return days[today];
}

// Get day value from date
function getDayValueFromDate(date: Date): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()];
}

// Month names in Indonesian
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_VALUES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

type ViewMode = "list" | "calendar";

const SchedulePage = () => {
  const [selectedDay, setSelectedDay] = useState<string>(getCurrentDayValue());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Lock calendar to current month only
  const currentMonth = new Date();

  // Query for list view
  const { data, isLoading, error } = useQuery({
    queryKey: ["schedule", selectedDay],
    queryFn: () => fetchSchedule(selectedDay),
    enabled: viewMode === "list",
  });

  // Queries for all days (calendar view)
  const allDaysQueries = useQueries({
    queries: DAY_VALUES.map((day) => ({
      queryKey: ["schedule", day],
      queryFn: () => fetchSchedule(day),
      enabled: viewMode === "calendar",
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Create a map of day_value to anime list
  const scheduleByDay = useMemo(() => {
    const map: Record<string, ScheduleAnime[]> = {};
    allDaysQueries.forEach((query, index) => {
      if (query.data) {
        map[DAY_VALUES[index]] = query.data.data;
      }
    });
    return map;
  }, [allDaysQueries]);

  const isCalendarLoading = allDaysQueries.some((q) => q.isLoading);

  // Get available days from data or use default
  const availableDays = useMemo(() => {
    if (data?.available_days) return data.available_days;
    return [
      { day: "Senin", day_value: "monday", endpoint: "/release-schedule?day=monday" },
      { day: "Selasa", day_value: "tuesday", endpoint: "/release-schedule?day=tuesday" },
      { day: "Rabu", day_value: "wednesday", endpoint: "/release-schedule?day=wednesday" },
      { day: "Kamis", day_value: "thursday", endpoint: "/release-schedule?day=thursday" },
      { day: "Jumat", day_value: "friday", endpoint: "/release-schedule?day=friday" },
      { day: "Sabtu", day_value: "saturday", endpoint: "/release-schedule?day=saturday" },
      { day: "Minggu", day_value: "sunday", endpoint: "/release-schedule?day=sunday" },
    ];
  }, [data?.available_days]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Get anime for a specific date
  const getAnimeForDate = (date: Date | null): ScheduleAnime[] => {
    if (!date) return [];
    const dayValue = getDayValueFromDate(date);
    return scheduleByDay[dayValue] || [];
  };

  if (error && viewMode === "list") {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[80vh] px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-heading mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-400 text-center mb-6">
            {(error as Error).message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Header */}
      <div className="pt-20 pb-4 px-4 md:px-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-8 h-8 text-red-600" />
                <h1 className="text-3xl md:text-5xl font-heading text-white">
                  JADWAL RILIS
                </h1>
              </div>
              <p className="text-gray-400 text-lg">
                Jadwal rilis anime terbaru setiap hari
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-800/50 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "calendar"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Kalender</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          {/* Day Tabs */}
          <div className="sticky top-14 z-30 bg-black/95 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 md:px-12">
              <div className="flex overflow-x-auto scrollbar-hide gap-1 py-3">
                {availableDays.map((dayOption) => {
                  const isActive = selectedDay === dayOption.day_value;
                  const isTodayTab = getCurrentDayValue() === dayOption.day_value;
                  
                  return (
                    <button
                      key={dayOption.day_value}
                      onClick={() => setSelectedDay(dayOption.day_value)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-red-600 text-white"
                          : "bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <span>{dayOption.day}</span>
                      {isTodayTab && (
                        <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
                          Hari ini
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* List Content */}
          <div className="px-4 md:px-12 py-8">
            <div className="max-w-7xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loading />
                </div>
              ) : data?.data && data.data.length > 0 ? (
                <>
                  {/* Schedule Info */}
                  <div className="mb-6">
                    <p className="text-gray-400">
                      <span className="text-white font-semibold">{data.total_anime}</span> anime tayang hari{" "}
                      <span className="text-red-500 font-semibold">{data.day}</span>
                    </p>
                  </div>

                  {/* Anime List */}
                  <div className="space-y-4">
                    {data.data.map((anime, index) => (
                      <Link 
                        key={index} 
                        href={`/anime${anime.slug}`}
                        className="block"
                      >
                        <div className="group bg-gray-900/50 hover:bg-gray-800/70 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300">
                          <div className="flex flex-col md:flex-row">
                            {/* Time Badge - Mobile */}
                            <div className="md:hidden flex items-center justify-between px-4 py-2 bg-gray-800/50">
                              <div className="flex items-center gap-2 text-red-500">
                                <Clock className="w-4 h-4" />
                                <span className="font-bold text-lg">{anime.time}</span>
                              </div>
                              {anime.type && (
                                <span className="bg-red-600 px-2 py-0.5 rounded text-xs font-bold text-white">
                                  {anime.type}
                                </span>
                              )}
                            </div>

                            {/* Time Badge - Desktop */}
                            <div className="hidden md:flex flex-shrink-0 w-24 bg-gradient-to-br from-red-600 to-red-700 items-center justify-center">
                              <div className="text-center text-white py-4">
                                <Clock className="w-5 h-5 mx-auto mb-1 opacity-80" />
                                <span className="font-bold text-xl">{anime.time}</span>
                              </div>
                            </div>

                            {/* Image */}
                            <div className="flex-shrink-0 w-full md:w-32 h-40 md:h-auto relative overflow-hidden">
                              <img
                                src={anime.img}
                                alt={anime.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                              {/* Play Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                  <Play className="w-6 h-6 text-black fill-black ml-1" />
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 md:p-5 flex flex-col justify-center">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white text-lg md:text-xl font-semibold group-hover:text-red-500 transition-colors line-clamp-2">
                                    {anime.title}
                                  </h3>
                                  
                                  {/* Meta Info */}
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {anime.score && Number(anime.score) > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-yellow-500 text-sm font-medium">
                                          {Number(anime.score).toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                    {anime.type && (
                                      <span className="hidden md:inline-block bg-red-600/20 text-red-400 px-2 py-0.5 rounded text-xs">
                                        {anime.type}
                                      </span>
                                    )}
                                    {anime.genres && anime.genres.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {anime.genres.slice(0, 3).map((genre, idx) => (
                                          <span
                                            key={idx}
                                            className="bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded text-xs"
                                          >
                                            {genre}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Description */}
                                  {anime.description && (
                                    <p className="text-gray-400 text-sm mt-3 line-clamp-2 hidden md:block">
                                      {anime.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-gray-400 text-xl font-heading mb-2">
                    Tidak ada anime
                  </h3>
                  <p className="text-gray-600">
                    Tidak ada anime yang tayang hari {data?.day || "ini"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Calendar View */}
          <div className="px-4 md:px-12 py-6">
            <div className="max-w-7xl mx-auto">
              {/* Calendar Header */}
              <div className="flex items-center justify-center mb-6 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl md:text-2xl font-heading text-white">
                    {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                </div>
              </div>

              {isCalendarLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loading />
                </div>
              ) : (
                <>
                  {/* Calendar Grid */}
                  <div className="bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 bg-gray-800/50">
                      {DAY_NAMES.map((day, index) => (
                        <div
                          key={day}
                          className={`p-3 text-center text-sm font-medium ${
                            index === 0 ? "text-red-400" : "text-gray-400"
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7">
                      {calendarDays.map((date, index) => {
                        const animeList = getAnimeForDate(date);
                        const hasAnime = animeList.length > 0;
                        const isTodayDate = isToday(date);
                        
                        return (
                          <div
                            key={index}
                            onClick={() => date && hasAnime && setSelectedDate(date)}
                            className={`min-h-[100px] md:min-h-[120px] p-2 border-t border-r border-gray-800 last:border-r-0 ${
                              !date ? "bg-gray-900/50" : "bg-transparent"
                            } ${
                              date && hasAnime ? "cursor-pointer hover:bg-gray-800/50" : ""
                            } ${
                              isTodayDate ? "bg-red-600/10" : ""
                            } transition-colors`}
                          >
                            {date && (
                              <>
                                <div className={`text-sm mb-2 ${
                                  isTodayDate 
                                    ? "w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white font-bold" 
                                    : date.getDay() === 0 
                                      ? "text-red-400" 
                                      : "text-gray-400"
                                }`}>
                                  {date.getDate()}
                                </div>
                                
                                {hasAnime && (
                                  <div className="space-y-1">
                                    {animeList.slice(0, 2).map((anime, idx) => (
                                      <div
                                        key={idx}
                                        className="text-[10px] md:text-xs bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded truncate"
                                        title={anime.title}
                                      >
                                        <span className="text-gray-500 mr-1">{anime.time}</span>
                                        <span className="hidden md:inline">{anime.title.substring(0, 15)}...</span>
                                        <span className="md:hidden">{anime.title.substring(0, 8)}...</span>
                                      </div>
                                    ))}
                                    {animeList.length > 2 && (
                                      <div className="text-[10px] md:text-xs text-gray-500 px-1.5">
                                        +{animeList.length - 2} lainnya
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span>Hari ini</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600/20 rounded"></div>
                      <span>Ada jadwal anime</span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      * Klik tanggal untuk melihat detail jadwal
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Date Detail Modal */}
      {selectedDate && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/90 z-[100] p-4 overflow-y-auto"
          onClick={() => setSelectedDate(null)}
        >
          <div 
            className="relative bg-gray-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-heading text-white">
                  {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h3>
                <p className="text-gray-400 text-sm">
                  {DAY_NAMES[selectedDate.getDay()]} - {getAnimeForDate(selectedDate).length} anime
                </p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-3">
                {getAnimeForDate(selectedDate).map((anime, index) => (
                  <Link
                    key={index}
                    href={`/anime${anime.slug}`}
                    onClick={() => setSelectedDate(null)}
                    className="block"
                  >
                    <div className="flex gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group">
                      <img
                        src={anime.img}
                        alt={anime.title}
                        className="w-16 h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-red-500 font-bold text-sm">{anime.time}</span>
                          {anime.type && (
                            <span className="bg-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                              {anime.type}
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-medium truncate group-hover:text-red-500 transition-colors">
                          {anime.title}
                        </h4>
                        {anime.score && Number(anime.score) > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-yellow-500 text-xs">
                              {Number(anime.score).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {anime.genres && anime.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {anime.genres.slice(0, 3).map((genre, idx) => (
                              <span
                                key={idx}
                                className="bg-gray-700/50 text-gray-400 px-1.5 py-0.5 rounded text-[10px]"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Play className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SchedulePage;
