import { Suspense } from "react";

// Components
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import CaseStudies from "@/components/sections/CaseStudies";
// import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import LoadingFallback from "@/components/common/LoadingFallback";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={<LoadingFallback />}>
        <Hero />
        <About />
        <Services />
        <CaseStudies />
        {/* <Testimonials /> */}
        <Contact />
        <Footer />
      </Suspense>
    </div>
  );
}
