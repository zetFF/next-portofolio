"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import testimonialsContent from "@/data/testimonialsContent.json";

gsap.registerPlugin(ScrollTrigger);

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const testimonials = testimonialsContent.testimonials;

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    if (sectionRef.current) {
      // GSAP animation for title
      gsap.fromTo(
        ".testimonials-title",
        {
          opacity: 0,
          y: -30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const testimonialVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      x: -60,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/90"></div>

        {/* Modern background effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, hsla(var(--primary), 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 30%, hsla(var(--primary), 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 70%, hsla(var(--primary), 0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-5xl relative">
        <h2 className="testimonials-title text-5xl font-bold mb-20 tracking-tight text-center">{testimonialsContent.title}</h2>

        {/* Testimonial slider */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {testimonials.map(
              (testimonial, index) =>
                index === activeIndex && (
                  <motion.div key={testimonial.id} variants={testimonialVariants} initial="hidden" animate="visible" exit="exit" className="rounded-2xl p-10 relative z-10 min-h-[300px]">
                    <div className="flex flex-col md:flex-row items-center gap-10 relative">
                      {/* Quote symbol */}
                      <div className="absolute -top-16 left-0 text-[120px] leading-none opacity-10 font-serif select-none text-primary" aria-hidden="true">
                        &ldquo;
                      </div>

                      <div className="flex-shrink-0 mb-6 md:mb-0">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/20">
                          {/* <Image src={testimonial.imageUrl} alt={testimonial.name} fill className="object-cover" /> */}
                        </div>
                      </div>

                      <div>
                        <p className="text-xl md:text-2xl mb-8 text-foreground/90 font-light leading-relaxed italic">&ldquo;{testimonial.text}&rdquo;</p>

                        <div className="border-l-4 border-primary pl-4">
                          <h4 className="text-xl font-semibold">{testimonial.name}</h4>
                          <p className="text-foreground/70">
                            {testimonial.position}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>

          {/* Glass card background */}
          <div
            className="absolute inset-0 -z-10 rounded-2xl"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}></div>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-3 mt-10">
          {testimonials.map((_, index) => (
            <button key={index} onClick={() => setActiveIndex(index)} className="group relative" aria-label={`Go to testimonial ${index + 1}`}>
              <span className={`block w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex ? "bg-primary scale-100" : "bg-foreground/20 scale-75 hover:bg-foreground/40"}`}></span>

              <span className={`absolute -inset-2 bg-primary/20 rounded-full scale-0 transition-transform duration-300 ${index === activeIndex ? "scale-100" : "group-hover:scale-75"}`}></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
