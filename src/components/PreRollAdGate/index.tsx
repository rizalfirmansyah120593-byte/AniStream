"use client";

import { useEffect, useState } from "react";
import { Loader2, Play } from "lucide-react";

const adUrl = process.env.NEXT_PUBLIC_PRE_ROLL_AD_URL || "";
const configuredSkipAfter = Number(process.env.NEXT_PUBLIC_PRE_ROLL_SKIP_SECONDS || 5);
const skipAfterSeconds = Number.isFinite(configuredSkipAfter) && configuredSkipAfter >= 0
  ? configuredSkipAfter
  : 5;

interface PreRollAdGateProps {
  videoUrl: string;
  title: string;
}

export default function PreRollAdGate({ videoUrl, title }: PreRollAdGateProps) {
  const [adFinished, setAdFinished] = useState(false);
  const [adTime, setAdTime] = useState(0);
  const canSkip = adTime >= skipAfterSeconds;

  useEffect(() => {
    setAdFinished(false);
    setAdTime(0);
  }, [videoUrl]);

  if (!adUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-950 px-6 text-center">
        <p className="text-white font-semibold">Video iklan belum dikonfigurasi</p>
        <p className="text-gray-400 text-sm">
          Atur NEXT_PUBLIC_PRE_ROLL_AD_URL sebelum video episode dapat diputar.
        </p>
      </div>
    );
  }

  if (adFinished) {
    return (
      <iframe
        src={videoUrl}
        className="w-full h-full"
        allowFullScreen
        title={title}
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        key={adUrl}
        className="w-full h-full object-contain"
        src={adUrl}
        autoPlay
        muted
        playsInline
        preload="auto"
        controls={false}
        onTimeUpdate={(event) => setAdTime(event.currentTarget.currentTime)}
        onEnded={() => setAdFinished(true)}
        onContextMenu={(event) => event.preventDefault()}
      />
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 text-xs text-white">
        <Play className="h-3 w-3 fill-white" />
        Iklan
      </div>
      {!canSkip && (
        <div className="absolute bottom-3 right-3 rounded bg-black/75 px-3 py-2 text-xs text-white">
          Skip tersedia dalam {Math.ceil(skipAfterSeconds - adTime)} detik
        </div>
      )}
      {canSkip && (
        <button
          type="button"
          onClick={() => setAdFinished(true)}
          className="absolute bottom-3 right-3 rounded bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200"
        >
          Skip Iklan
        </button>
      )}
      {!adTime && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      )}
    </div>
  );
}
