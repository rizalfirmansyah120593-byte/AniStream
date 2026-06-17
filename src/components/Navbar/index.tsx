'use client'
import React, { useState, useEffect, useRef } from 'react'
import { UserRound, Bookmark, Search, Play, Bell, Menu, X, Home, Film, Heart, Calendar, Tv, Compass, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { API_URL } from '@/utils/config';

interface NotificationAnime {
  img: string;
  alt: string;
  slug: string;
  type: string;
  score: string;
  title: string;
  total_views: number;
  description: string;
  genres: { tag: string; link: string }[];
  detail_url: string;
}

interface NotificationResponse {
  data: NotificationAnime[];
  total_items: number;
  current_page: number;
  total_page: number;
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationAnime[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [pathname]);

  // Fetch notifications when menu opens
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isNotificationOpen && notifications.length === 0) {
        setIsLoadingNotifications(true);
        try {
          const response = await fetch(`${API_URL}/order-anime/latest-update`);
          const data: NotificationResponse = await response.json();
          setNotifications(data.data.slice(0, 10)); // Show only 10 latest
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        } finally {
          setIsLoadingNotifications(false);
        }
      }
    };
    fetchNotifications();
  }, [isNotificationOpen, notifications.length]);

  // Close notification menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/popular', label: 'Browse', icon: Compass },
    { href: '/genres', label: 'Genres', icon: Film },
    { href: '/type', label: 'Type', icon: Tv },
    { href: '/schedule', label: 'Schedule', icon: Calendar },
    { href: '/profile', label: 'My List', icon: Heart },
  ];

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-black/95 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}>
        <div className='flex justify-between items-center px-4 md:px-12 py-3'>
          {/* Logo & Menu */}
          <div className='flex items-center gap-8'>
            <Link href="/" className='flex items-center gap-2 group'>
              <Play className='text-red-600 fill-red-600 w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform' />
              <span className='text-red-600 font-heading text-xl md:text-3xl tracking-wider group-hover:text-red-500 transition-colors'>
                AniStream
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <ul className='hidden md:flex items-center gap-1'>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isActiveLink(link.href) 
                        ? 'text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Icons */}
          <div className='flex items-center gap-3 md:gap-5'>
            <Link href="/search" className='text-white hover:text-gray-300 transition-colors'>
              <Search className='w-5 h-5' />
            </Link>
            {/* Notification Button & Menu */}
            <div className='hidden md:block relative' ref={notificationRef}>
              <button 
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (!isNotificationOpen) setHasNewNotifications(false);
                }}
                className='text-white hover:text-gray-300 transition-colors relative'
              >
                <Bell className='w-5 h-5' />
                {hasNewNotifications && (
                  <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse'></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className='absolute right-0 top-full mt-3 w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50'>
                  {/* Header */}
                  <div className='flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/95'>
                    <h3 className='text-white font-semibold flex items-center gap-2'>
                      <Bell className='w-4 h-4 text-red-500' />
                      Update Terbaru
                    </h3>
                    <Link 
                      href="/latest" 
                      className='text-xs text-red-500 hover:text-red-400 transition-colors'
                      onClick={() => setIsNotificationOpen(false)}
                    >
                      Lihat Semua
                    </Link>
                  </div>

                  {/* Notification List */}
                  <div className='max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900'>
                    {isLoadingNotifications ? (
                      <div className='flex items-center justify-center py-12'>
                        <Loader2 className='w-6 h-6 text-red-500 animate-spin' />
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className='divide-y divide-gray-800'>
                        {notifications.map((anime, index) => (
                          <Link
                            key={index}
                            href={`/anime${anime.detail_url.replace('/detail-anime', '')}`}
                            onClick={() => setIsNotificationOpen(false)}
                            className='flex gap-3 p-3 hover:bg-gray-800/50 transition-colors group'
                          >
                            <div className='relative w-14 h-20 flex-shrink-0 rounded-md overflow-hidden'>
                              <Image
                                src={anime.img}
                                alt={anime.alt || anime.title}
                                fill
                                className='object-cover group-hover:scale-105 transition-transform'
                                sizes='56px'
                              />
                              {anime.type && (
                                <span className='absolute top-1 left-1 text-[8px] px-1 py-0.5 bg-red-600 text-white rounded font-medium'>
                                  {anime.type}
                                </span>
                              )}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h4 className='text-sm font-medium text-white line-clamp-2 group-hover:text-red-400 transition-colors'>
                                {anime.title}
                              </h4>
                              <p className='text-xs text-gray-400 line-clamp-2 mt-1'>
                                {anime.description}
                              </p>
                              {anime.score && (
                                <div className='flex items-center gap-1 mt-1'>
                                  <span className='text-yellow-500 text-xs'>★</span>
                                  <span className='text-xs text-gray-400'>{anime.score}</span>
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                        <Bell className='w-8 h-8 mb-2' />
                        <p className='text-sm'>Tidak ada notifikasi</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link href="/profile" className='hidden md:block text-white hover:text-gray-300 transition-colors'>
              <Bookmark className='w-5 h-5' />
            </Link>
            <Link href="/profile" className='hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity'>
              <div className='w-8 h-8 rounded bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center'>
                <UserRound className='w-5 h-5 text-white' />
              </div>
            </Link>
            
            {/* Hamburger Button - Mobile Only */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='md:hidden text-white hover:text-gray-300 transition-colors p-1'
              aria-label='Toggle menu'
            >
              {isMobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-gray-900 z-50 md:hidden transform transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-800'>
          <span className='text-red-600 font-heading text-xl tracking-wider'>MENU</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-gray-400 hover:text-white transition-colors p-1'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Menu Links */}
        <nav className='p-4'>
          <ul className='space-y-1'>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActiveLink(link.href)
                        ? 'bg-red-600/20 text-red-500'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    <span className='font-medium'>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Divider */}
        <div className='mx-4 border-t border-gray-800' />

        {/* Additional Links */}
        <div className='p-4'>
          <ul className='space-y-1'>
            <li>
              <Link 
                href="/search"
                className='flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all'
              >
                <Search className='w-5 h-5' />
                <span className='font-medium'>Search</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/latest"
                className='flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all w-full'
              >
                <Bell className='w-5 h-5' />
                <span className='font-medium'>Update Terbaru</span>
                {hasNewNotifications && (
                  <span className='ml-auto w-2 h-2 bg-red-600 rounded-full animate-pulse'></span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                href="/profile"
                className='flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all w-full'
              >
                <Bookmark className='w-5 h-5' />
                <span className='font-medium'>My List</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* User Profile Section */}
        <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900'>
          <Link href="/profile" className='flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-800 transition-all'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center'>
              <UserRound className='w-6 h-6 text-white' />
            </div>
            <div className='text-left'>
              <p className='text-white font-medium'>Guest User</p>
              <p className='text-gray-500 text-sm'>Lihat Profile & My List</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar