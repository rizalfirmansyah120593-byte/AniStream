'use client';

import { useEffect, useRef } from 'react';

const HOST = 'https://alwaysmulticulturallanding.com';

type AdSize = '320x50' | '468x60' | '728x90' | '160x300' | '160x600' | '300x250';

const bannerKeys: Record<AdSize, string> = {
  '320x50': '002b263866fb36860a9087044e280355',
  '468x60': 'a04c6bee429bd7a070a394d14405597a',
  '728x90': 'daefcd0da8999f398d62edb6161a6a14',
  '160x300': 'bb6934eee474b0d5325b03f54add9c69',
  '160x600': '6b091aefc4e7695af54e94e29cb0ad3d',
  '300x250': 'a8153b53d78849fdb5bbb1337bd0c559',
};

const dimensions: Record<AdSize, { width: number; height: number }> = {
  '320x50': { width: 320, height: 50 }, '468x60': { width: 468, height: 60 },
  '728x90': { width: 728, height: 90 }, '160x300': { width: 160, height: 300 },
  '160x600': { width: 160, height: 600 }, '300x250': { width: 300, height: 250 },
};

function loadWhenNearViewport(element: HTMLElement, load: () => void) {
  if (!("IntersectionObserver" in window)) {
    load();
    return () => undefined;
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: "300px" });
  observer.observe(element);
  return () => observer.disconnect();
}

export function AdsterraBanner({ size }: { size: AdSize }) {
  const slotRef = useRef<HTMLElement>(null);
  const loadedRef = useRef(false);
  const key = bannerKeys[size];
  const { width, height } = dimensions[size];

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    return loadWhenNearViewport(slot, () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      (window as Window & { atOptions?: Record<string, unknown> }).atOptions = {
        key,
        format: "iframe",
        height,
        width,
        params: {},
      };
      const script = document.createElement("script");
      script.async = true;
      script.src = `${HOST}/${key}/invoke.js`;
      slot.appendChild(script);
    });
  }, [height, key, width]);

  return <aside ref={slotRef} className="ad-slot flex justify-center overflow-hidden" style={{ minHeight: height }} aria-label="Iklan" />;
}

export function AdsterraNative() {
  const id = "bcf5164b464a8e3c0b486cd50f77b999";
  const slotRef = useRef<HTMLElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    return loadWhenNearViewport(slot, () => {
      if (loadedRef.current) return;
      loadedRef.current = true;
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = `${HOST}/${id}/invoke.js`;
      slot.appendChild(script);
    });
  }, [id]);

  return (
    <aside ref={slotRef} className="ad-slot min-h-[250px]" aria-label="Iklan rekomendasi">
      <div id={`container-${id}`} />
    </aside>
  );
}
