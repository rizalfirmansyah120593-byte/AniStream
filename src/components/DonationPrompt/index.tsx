"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ExternalLink, Heart, X } from "lucide-react";

const DONATION_URL = "https://saweria.co/RizalFirmansyah";
const SESSION_KEY = "anistream-karhutla-donation-prompted";

type DonationContextValue = {
  openDonation: () => void;
  requestPlay: (onContinue: () => void) => void;
};

const DonationContext = createContext<DonationContextValue | null>(null);

export function DonationPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const continueRef = useRef<(() => void) | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const openDonation = useCallback(() => {
    const activeElement = document.activeElement;
    openerRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    continueRef.current = null;
    setIsOpen(true);
  }, []);

  const requestPlay = useCallback((onContinue: () => void) => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
        onContinue();
        return;
      }
    } catch (error) {
      console.warn("Could not read donation prompt session state:", error);
    }

    const activeElement = document.activeElement;
    openerRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    continueRef.current = onContinue;
    setIsOpen(true);
  }, []);

  const continueToPlayback = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch (error) {
      console.warn("Could not save donation prompt session state:", error);
    }

    const continueAction = continueRef.current;
    continueRef.current = null;
    setIsOpen(false);
    continueAction?.();
  }, []);

  const dismissPrompt = continueToPlayback;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissPrompt();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
      openerRef.current = null;
    };
  }, [dismissPrompt, isOpen]);

  const value = { openDonation, requestPlay };

  return (
    <DonationContext.Provider value={value}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) dismissPrompt();
          }}
        >
          <section
            aria-labelledby="karhutla-donation-title"
            aria-modal="true"
            className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-300/20 bg-[#081a16] text-white shadow-[0_24px_100px_rgba(0,0,0,0.7)]"
            role="dialog"
          >
            <button
              aria-label="Tutup ajakan donasi"
              className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/50 p-2 text-white transition hover:bg-black/80"
              onClick={dismissPrompt}
              ref={closeButtonRef}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-48 sm:h-56">
              <Image
                alt="Ilustrasi hutan Indonesia yang perlu dijaga dari kebakaran"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 640px) 100vw, 512px"
                src="/karhutla-donation.svg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081a16] via-[#081a16]/20 to-black/10" />
              <span className="absolute bottom-4 left-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-black/45 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100 backdrop-blur">
                <Heart className="h-3.5 w-3.5 fill-current text-rose-400" />
                PEDULI HUTAN INDONESIA
              </span>
            </div>

            <div className="px-5 pb-6 sm:px-7">
              <h2
                className="text-2xl font-bold leading-tight sm:text-3xl"
                id="karhutla-donation-title"
              >
                Jaga hutan, dukung pemulihan
              </h2>
              <p className="mt-3 leading-7 text-emerald-50/75">
                Sebelum menonton, mari ikut memberi perhatian pada dampak
                kebakaran hutan dan lahan di Indonesia. Dukungan sekecil apa
                pun berarti.
              </p>
              <p className="mt-3 text-xs leading-5 text-emerald-100/55">
                Tautan donasi menuju Saweria AniStream. Silakan periksa
                informasi penerima dan penyaluran pada halaman donasi sebelum
                berdonasi.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-lime-300 to-amber-300 px-4 py-3 text-center font-extrabold text-emerald-950 shadow-[0_8px_30px_rgba(163,230,53,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_36px_rgba(163,230,53,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
                  href={DONATION_URL}
                  onClick={continueToPlayback}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Heart className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
                  Dukung lewat Saweria
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  className="min-h-12 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  onClick={continueToPlayback}
                  type="button"
                >
                  Lanjutkan menonton
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-white/40">
                Ajakan ini hanya muncul sekali per sesi.
              </p>
            </div>
          </section>
        </div>
      )}
    </DonationContext.Provider>
  );
}

export function useDonationPrompt() {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error("useDonationPrompt must be used within DonationPromptProvider");
  }
  return context;
}
