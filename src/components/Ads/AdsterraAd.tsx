'use client';

import Script from 'next/script';

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

export function AdsterraBanner({ size }: { size: AdSize }) {
  const key = bannerKeys[size];
  const { width, height } = dimensions[size];
  return (
    <div className="ad-slot flex justify-center overflow-hidden" style={{ minHeight: height }} aria-label="Iklan">
      <Script id={`adsterra-${key}`} strategy="afterInteractive">
        {`window.atOptions = {key: '${key}', format: 'iframe', height: ${height}, width: ${width}, params: {}};`}
      </Script>
      <Script src={`${HOST}/${key}/invoke.js`} strategy="afterInteractive" />
    </div>
  );
}

export function AdsterraNative() {
  const id = 'bcf5164b464a8e3c0b486cd50f77b999';
  return (
    <div className="ad-slot min-h-[100px]" aria-label="Iklan rekomendasi">
      <Script async data-cfasync="false" src={`${HOST}/${id}/invoke.js`} strategy="afterInteractive" />
      <div id={`container-${id}`} />
    </div>
  );
}

export function AdsterraSiteScripts() {
  return (
    <>
      <Script src={`${HOST}/fe/8f/81/fe8f815f75fcefd6fa17243386912ae0.js`} strategy="lazyOnload" />
      <Script src={`${HOST}/a2/e0/3c/a2e03cf1bed0e9d731c3812e05e4517c.js`} strategy="lazyOnload" />
    </>
  );
}
