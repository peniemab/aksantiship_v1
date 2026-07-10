import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center bg-surface px-4 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-md md:max-w-5xl">{children}</div>
      </main>
      <Footer />
    </>
  );
}
