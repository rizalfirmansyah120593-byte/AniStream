/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tv, Film, Clapperboard, Sparkles, Popcorn, ChevronRight } from "lucide-react";
import Link from "next/link";

const TYPE_LIST = [
  { 
    type: "TV", 
    slug: "tv", 
    icon: Tv, 
    color: "text-blue-400",
    bgColor: "bg-blue-600",
    description: "Serial anime yang ditayangkan di televisi Jepang"
  },
  { 
    type: "OVA", 
    slug: "ova", 
    icon: Film, 
    color: "text-purple-400",
    bgColor: "bg-purple-600",
    description: "Original Video Animation - dirilis langsung ke video"
  },
  { 
    type: "ONA", 
    slug: "ona", 
    icon: Clapperboard, 
    color: "text-green-400",
    bgColor: "bg-green-600",
    description: "Original Net Animation - dirilis melalui platform streaming"
  },
  { 
    type: "Special", 
    slug: "special", 
    icon: Sparkles, 
    color: "text-yellow-400",
    bgColor: "bg-yellow-600",
    description: "Episode spesial atau bonus dari serial anime"
  },
  { 
    type: "Movie", 
    slug: "movie", 
    icon: Popcorn, 
    color: "text-red-400",
    bgColor: "bg-red-600",
    description: "Film anime yang ditayangkan di bioskop"
  },
];

const TypePage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Header */}
      <div className="pt-20 pb-8 px-4 md:px-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl md:text-5xl font-heading text-white">
              TIPE ANIME
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Jelajahi anime berdasarkan tipe rilis
          </p>
        </div>
      </div>

      {/* Type Grid */}
      <div className="px-4 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TYPE_LIST.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.slug} href={`/type/${item.slug}`}>
                  <div className="group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all duration-300">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${item.bgColor}`} />
                    
                    <div className="relative p-6 flex items-center gap-4">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-2xl font-heading ${item.color} group-hover:text-white transition-colors`}>
                          {item.type}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TypePage;
