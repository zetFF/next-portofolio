"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import servicesContent from "@/data/servicesContent.json";

gsap.registerPlugin(ScrollTrigger);

// Helper function to safely check if code is running in browser
const isBrowser = typeof window !== "undefined";

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const cardsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse interaction state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Service hover state
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  // Service category filter
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const categories = ["all", "design", "development", "consulting"];

  // Animated counter state
  const [counters, setCounters] = useState({
    projects: 0,
    clients: 0,
    experience: 0,
  });

  // Handle mouse move for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Interactive particles canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isBrowser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    // Particle properties
    const particleCount = 80;
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animationFrameId = 0; // Initialize with a number value

    // Draw particles and connections
    const drawParticles = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p) => {
        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;

        // Bounce off edges
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      // Draw connections
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = "hsl(var(--primary))";

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    drawParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setCanvasDimensions);
    };
  }, []);

  // GSAP animations for service cards
  useEffect(() => {
    if (sectionRef.current && cardsRef.current) {
      const serviceCards = cardsRef.current.querySelectorAll(".service-card");
      const staggerAmount = 0.2;

      // GSAP animation for service cards
      gsap.fromTo(
        serviceCards,
        {
          opacity: 0,
          y: 100,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: staggerAmount,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            end: "bottom 60%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // Counters animation
      if (isInView) {
        const duration = 2000; // 2 seconds
        const frameDuration = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);

        const animateCounters = () => {
          let frame = 0;
          const intervalId = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;

            setCounters({
              projects: Math.floor(progress * 152),
              clients: Math.floor(progress * 47),
              experience: Math.floor(progress * 8),
            });

            if (frame === totalFrames) {
              clearInterval(intervalId);
            }
          }, frameDuration);
        };

        animateCounters();
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isInView]);

  // Filter services by category
  const filteredServices = activeCategory === "all" ? servicesContent.services : servicesContent.services.filter((service) => service.category === activeCategory);

  // Animation variants
  const titleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
    tap: { scale: 0.98 },
  };

  return (
    <section ref={sectionRef} id="services" className="min-h-screen py-24 relative overflow-hidden">
      {/* Services background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-black/95 to-black/90"></div>

      {/* Background particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-5 opacity-30" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.15),transparent_70%)]"></div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 -z-10 opacity-5"
        style={{
          backgroundImage: "url('/grid.svg')",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.h2 variants={titleVariants} initial="hidden" animate="visible" className="text-5xl font-bold mb-6 tracking-tight relative inline-block">
            {servicesContent.title}
            <motion.span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary/50" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, delay: 0.5 }} />
          </motion.h2>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="max-w-2xl mx-auto text-lg text-muted-foreground">
            {servicesContent.description}
          </motion.p>
        </div>

        {/* Service category tabs */}
        <motion.div className="flex justify-center flex-wrap gap-2 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Services stats */}
        <motion.div className="grid grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <div className="text-center p-4 border-r border-white/10">
            <div className="text-4xl font-bold mb-1 text-primary">{counters.projects}+</div>
            <div className="text-sm text-white/60">Projects Completed</div>
          </div>
          <div className="text-center p-4 border-r border-white/10">
            <div className="text-4xl font-bold mb-1 text-primary">{counters.clients}+</div>
            <div className="text-sm text-white/60">Happy Clients</div>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl font-bold mb-1 text-primary">{counters.experience}+</div>
            <div className="text-sm text-white/60">Years Experience</div>
          </div>
        </motion.div>

        {/* Service cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                onHoverStart={() => setHoveredService(service.id)}
                onHoverEnd={() => setHoveredService(null)}
                className="service-card group rounded-2xl p-8 border border-white/5 transition-all duration-300 hover:border-primary/30 relative backdrop-blur-sm overflow-hidden flex flex-col justify-between"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  minHeight: "380px",
                }}>
                {/* Hover shimmer effect */}
                <motion.div
                  className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.03), transparent)",
                    backgroundSize: "200% 200%",
                  }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                />

                {/* Glow effect */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                  style={{
                    background: "radial-gradient(circle at center, hsla(var(--primary), 0.15), transparent 60%)",
                    filter: "blur(20px)",
                  }}
                />

                {/* Service number */}
                <div className="w-14 h-14 bg-primary/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-8 shadow-inner overflow-hidden relative">
                  <motion.span
                    className="text-xl font-mono text-primary-foreground font-medium relative z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}>
                    {service.id}
                  </motion.span>

                  {/* Animated background for service number */}
                  <motion.div
                    className="absolute inset-0 bg-primary/10"
                    animate={{
                      background: [
                        "radial-gradient(circle at 30% 30%, hsla(var(--primary), 0.3), transparent 70%)",
                        "radial-gradient(circle at 70% 70%, hsla(var(--primary), 0.3), transparent 70%)",
                        "radial-gradient(circle at 30% 30%, hsla(var(--primary), 0.3), transparent 70%)",
                      ],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  />
                </div>

                {/* Service content */}
                <div>
                  <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors duration-300">{service.title}</h3>
                  <p className="text-foreground/70 mb-6 text-base leading-relaxed">{service.description}</p>
                </div>

                {/* Service features */}
                {service.features && (
                  <div className="mt-auto">
                    <div className="space-y-2">
                      {service.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={hoveredService === service.id ? { opacity: 1, x: 0 } : { opacity: 0.8, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}>
                          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-white/80">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <motion.div
                  className="w-full h-0.5 bg-gradient-to-r from-primary/80 to-primary/10 rounded-full mt-8 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div
          className="mt-20 bg-gradient-to-r from-primary/80 to-primary/10 backdrop-blur-sm p-8 rounded-xl  border-primary/20 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}>
          {/* Animated background patterns */}
          <motion.div
            className="absolute inset-0 -z-10 opacity-30"
            style={{
              background: "radial-gradient(circle at 20% 50%, hsla(var(--primary), 0.4), transparent 40%), radial-gradient(circle at 80% 30%, hsla(var(--primary), 0.2), transparent 50%)",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">Let's transform your ideas into reality. Our team of experts is ready to bring your vision to life.</p>
          <motion.button
            className="bg-white text-black hover:bg-white/90 px-8 py-3 rounded-full font-medium shadow-xl shadow-primary/20 inline-flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            Contact Us
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute top-1/4 -right-1/12 w-72 h-72 rounded-full blur-3xl -z-10 opacity-20"
        style={{ background: "linear-gradient(135deg, hsla(var(--primary), 0.3), transparent)" }}
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 -left-1/12 w-64 h-64 rounded-full blur-3xl -z-10 opacity-10"
        style={{ background: "linear-gradient(135deg, hsla(var(--primary), 0.3), transparent)" }}
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </section>
  );
}
