import InfoPage from "@/components/InfoPage";

export default function AboutPage() {
  return (
    <InfoPage
      title="About AniStream"
      description="AniStream helps anime fans discover series, films, schedules, genres, and episode listings in one place."
      sections={[
        { title: "What AniStream offers", content: "Browse anime information, explore genres and release schedules, and follow episode links where available. The site is designed to make discovery straightforward on desktop and mobile." },
        { title: "Third-party video links", content: "AniStream does not host, upload, or store video files. Playback links may be provided by unaffiliated third parties and their availability can change." },
        { title: "Get in touch", content: "Questions or feedback? Contact the AniStream team at contact@anistreaming.com." },
      ]}
    />
  );
}
