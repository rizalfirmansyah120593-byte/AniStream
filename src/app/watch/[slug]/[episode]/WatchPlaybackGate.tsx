"use client";

import { useEffect, useState } from "react";
import { useDonationPrompt } from "@/components/DonationPrompt";

export function WatchPlaybackGate({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [canPlay, setCanPlay] = useState(false);
  const { requestPlay } = useDonationPrompt();

  useEffect(() => {
    requestPlay(() => setCanPlay(true));
  }, [requestPlay]);

  if (!canPlay) {
    return (
      <div className="mt-6 flex aspect-video items-center justify-center rounded-lg bg-gray-900 p-6 text-center text-gray-300">
        Pemutar siap. Silakan pilih lanjut menonton pada dialog.
      </div>
    );
  }

  return (
    <div className="mt-6 aspect-video overflow-hidden rounded-lg bg-black">
      <iframe
        src={src}
        title={title}
        className="h-full w-full"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
