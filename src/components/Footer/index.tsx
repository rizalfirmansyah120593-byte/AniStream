"use client";
import React from "react";
import Link from "next/link";
import { Play, Facebook, Twitter, Instagram, Youtube, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    browse: [
      { label: "Home", href: "/" },
      { label: "Latest", href: "/latest" },
      { label: "Popular", href: "/popular" },
      { label: "Genres", href: "/genres" },
    ],
    categories: [
      { label: "On Going", href: "/category/ongoing" },
      { label: "Completed", href: "/category/completed" },
      { label: "Movies", href: "/genres/movie" },
      { label: "OVA", href: "/genres/ova" },
    ],
    help: [
      { label: "FAQ", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "Youtube" },
  ];

  return (
    <footer className="bg-black border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          {/* Logo & Description */}
          <div className="md:max-w-xs">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-2xl font-heading text-white">AniStream</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Nonton Anime Sub Indo terbaru dalam kualitas HD di AniStream. Stream pilihan anime favoritmu, temukan seri populer, dan nikmati pengalaman menonton terbaik secara online.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Browse */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Browse</h3>
              <ul className="space-y-2">
                {footerLinks.browse.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
              <ul className="space-y-2">
                {footerLinks.categories.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Help</h3>
              <ul className="space-y-2">
                {footerLinks.help.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {currentYear} AniStream. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by{" "}
              <a 
                href="https://github.com/rizalfirmansyah120593-byte" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                Rizal Firmansyah
              </a>
            </p>
          </div>
          
          {/* Disclaimer */}
          <p className="text-gray-600 text-xs text-center mt-4 max-w-2xl mx-auto">
            Disclaimer: AniStream does not host, upload, or store any video files on its servers. All content is provided by non-affiliated third parties and is indexed through automated processes. All trademarks and logos are the property of their respective owners. If you believe that any content on this site infringes upon your copyright, please contact us immediately so we can remove the content
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
