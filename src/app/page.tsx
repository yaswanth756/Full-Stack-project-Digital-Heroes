import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HorizontalScroll from "@/components/HorizontalScroll";
import AppPreview from "@/components/AppPreview";
import CharitySection from "@/components/CharitySection";
import DrawSection from "@/components/DrawSection";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Waitlist from "@/components/Waitlist";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HorizontalScroll />
        <AppPreview />
        <CharitySection />
        <DrawSection />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
