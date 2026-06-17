/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Loading from "@/components/Loading";
import Footer from "@/components/Footer";
import { Film, ChevronRight } from "lucide-react";
import { API_URL } from '@/utils/config';

interface Genre {
  title: string;
  id: string;
}

async function fetchGenres() {
  const { data } = await axios.get(
    `${API_URL}/genres`
  );
  return data;
}

const GenresPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["genres-list"],
    queryFn: fetchGenres,
  });

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
          <p className="text-red-500">Error loading genres</p>
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
            <Film className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl md:text-5xl font-heading text-white">
              BROWSE BY GENRE
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Explore anime by your favorite genres
          </p>
        </div>
      </div>

      {/* Genres Grid */}
      <div className="px-4 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data?.data?.map((genre: Genre, index: number) => (
              <Link 
                key={index} 
                href={`/genres/${genre.id}`}
                className="group"
              >
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 h-32 flex flex-col justify-between overflow-hidden border border-gray-800 hover:border-red-600/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-900/20">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-600 rounded-full blur-3xl group-hover:opacity-50 transition-opacity" />
                  </div>
                  
                  {/* Genre Icon */}
                  <div className="relative">
                    <Film className="w-6 h-6 text-red-600 group-hover:text-red-500 transition-colors" />
                  </div>
                  
                  {/* Genre Name */}
                  <div className="relative flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm group-hover:text-red-400 transition-colors">
                      {genre.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default GenresPage;
