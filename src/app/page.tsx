import { BackToTop } from "@/components/landing/BackToTop";
import { CTA } from "@/components/landing/CTA";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Trust } from "@/components/landing/Trust";
import { UseCases } from "@/components/landing/UseCases";

export default function HomePage() {
  return (
    <main id="top">
      <Header />
      <Hero />
      <Trust />
      <Features />
      <UseCases />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
      <BackToTop />
    </main>
  );
}