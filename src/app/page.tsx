import { Footer } from "@/components/Footer";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}
