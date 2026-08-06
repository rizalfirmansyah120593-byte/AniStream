import Link from "next/link";
import Footer from "@/components/Footer";

interface InfoSection {
  title: string;
  content: string;
}

interface InfoPageProps {
  title: string;
  description: string;
  sections: InfoSection[];
}

export default function InfoPage({ title, description, sections }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="pt-24 pb-16 px-4 md:px-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-red-500 hover:text-red-400 text-sm transition-colors">
            ← Kembali ke AniStream
          </Link>
          <h1 className="mt-6 text-4xl md:text-5xl font-heading text-white">{title}</h1>
          <p className="mt-4 text-gray-400 leading-7">{description}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                <p className="mt-2 text-gray-400 leading-7">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
