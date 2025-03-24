"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroContent from "@/data/heroContent.json";
import { Button } from "@/components/ui/button";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Helper function to safely check if code is running in browser
const isBrowser = typeof window !== "undefined";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse follower variables
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");

  // Mouse movement values for parallax effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transform mouse movement to create parallax effect
  const backgroundX = useTransform(mouseX, [-800, 800], [40, -40]);
  const backgroundY = useTransform(mouseY, [-800, 800], [40, -40]);

  // Add spring physics to make movement smoother
  const springX = useSpring(backgroundX, { damping: 25, stiffness: 150 });
  const springY = useSpring(backgroundY, { damping: 25, stiffness: 150 });

  // State for animated roles and text reveal
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [, setTextRevealed] = useState(false);

  // State for 3D card rotation
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });

  // Safe window dimensions for transformations
  const [windowSize, setWindowSize] = useState({
    width: isBrowser ? window.innerWidth : 1200,
    height: isBrowser ? window.innerHeight : 800,
  });

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // WebGL canvas for background particles
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener("resize", setCanvasDimensions);

    // Particle settings
    const particleCount = 100;
    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      velocity: { x: number; y: number };
      opacity: number;
    }[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 2 + 0.5;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        color: `hsla(${Math.random() * 60 + 200}, 100%, 70%, ${Math.random() * 0.5 + 0.3})`,
        velocity: {
          x: (Math.random() - 0.5) * 0.3,
          y: (Math.random() - 0.5) * 0.3,
        },
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update particles
      particles.forEach((particle) => {
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;

        // Boundary check
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.velocity.x = -particle.velocity.x;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.velocity.y = -particle.velocity.y;
        }

        // Influence particles with mouse
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = 0.1;
          const angle = Math.atan2(dy, dx);
          particle.velocity.x -= Math.cos(angle) * force;
          particle.velocity.y -= Math.sin(angle) * force;
        }
      });

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 100;

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
    };
  }, [mousePosition]);

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Animated roles rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % heroContent.roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Initialize animations
  useEffect(() => {
    if (sectionRef.current && titleRef.current && subtitleRef.current && contentRef.current) {
      // GSAP timeline for initial animations
      const initialTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => setTextRevealed(true),
      });

      initialTl
        .fromTo(".hero-subtitle-line", { width: 0 }, { width: "100%", duration: 1.5 })
        .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=1")
        .fromTo(".hero-title-mask", { width: "0%" }, { width: "100%", duration: 1.2, ease: "power4.inOut" }, "-=0.3")
        .fromTo(".hero-intro-text", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, "-=0.5")
        .fromTo(".hero-role", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6 }, "-=0.5")
        .fromTo(".hero-cta", { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.3")
        .fromTo(".hero-floating-element", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 }, "-=0.8")
        .fromTo(".hero-scroll-indicator", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.2");

      // Modified scroll-triggered animations (subtle parallax without disappearing)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      scrollTl
        .to(titleRef.current, {
          y: 50, // Less movement
          opacity: 0.9, // Don't fully disappear
          ease: "power2.inOut",
        })
        .to(
          ".hero-floating-element",
          {
            y: -30, // Less movement
            opacity: 0.8, // Don't fully disappear
            stagger: 0.1,
            ease: "power2.inOut",
          },
          "<"
        )
        .to(
          contentRef.current,
          {
            y: -20, // Less movement
            opacity: 0.9, // Don't fully disappear
            ease: "power2.inOut",
          },
          "<"
        );
    }

    return () => {
      // Clean up ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Mouse interactions for button and text
  const handleMouseEnterText = () => setCursorVariant("text");
  const handleMouseLeaveText = () => setCursorVariant("default");
  const handleMouseEnterButton = () => setCursorVariant("button");
  const handleMouseLeaveButton = () => setCursorVariant("default");

  // Handle 3D card effect
  const handleCardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setCardRotation({ x: rotateX, y: rotateY });
  };

  const handleCardLeave = () => {
    setCardRotation({ x: 0, y: 0 });
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* WebGL Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 z-0">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.02] z-10" />

        {/* Noise texture */}
        <div className="absolute inset-0 bg-[url('/noise-texture.png')] opacity-[0.03] mix-blend-overlay z-20" />

        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-black z-0" />

        {/* Animated gradient blob */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-20 z-0 hero-floating-element"
          style={{
            background: "radial-gradient(circle at center, hsla(var(--primary), 0.5), hsla(var(--primary), 0), transparent 70%)",
            x: springX,
            y: springY,
            top: "10%",
            left: "30%",
          }}
        />

        {/* Secondary blob */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-10 z-0 hero-floating-element"
          style={{
            background: "radial-gradient(circle at center, hsla(210, 100%, 50%, 0.4), transparent 70%)",
            x: useTransform(mouseX, [-800, 800], [-20, 20]),
            y: useTransform(mouseY, [-800, 800], [-20, 20]),
            bottom: "20%",
            right: "10%",
          }}
        />

        {/* Small glowing orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/80 hero-floating-element"
            style={{
              boxShadow: "0 0 10px 2px hsla(var(--primary), 0.5)",
              top: `${15 + i * 10}%`,
              left: `${10 + i * 10}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 1.5,
            }}
          />
        ))}

        {/* Abstract circular shapes */}
        <svg className="absolute top-[20%] right-[15%] w-[150px] h-[150px] opacity-10 hero-floating-element" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsla(var(--primary), 0.5)"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "loop", ease: "linear" }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="hsla(var(--primary), 0.5)"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "loop", ease: "linear", delay: 1 }}
          />
        </svg>
      </div>

      {/* Custom mouse follower */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-50 hidden md:block"
        variants={{
          default: {
            width: 12,
            height: 12,
            backgroundColor: "transparent",
            border: "2px solid hsla(var(--primary), 0.5)",
            x: 0,
            y: 0,
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 150,
              mass: 0.5,
            },
          },
          text: {
            width: 100,
            height: 100,
            backgroundColor: "hsla(var(--primary), 0.1)",
            x: -50,
            y: -50,
            mixBlendMode: "difference",
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 150,
              mass: 0.5,
            },
          },
          button: {
            width: 60,
            height: 60,
            backgroundColor: "hsla(var(--primary), 0.2)",
            x: -30,
            y: -30,
            transition: {
              type: "spring",
              damping: 25,
              stiffness: 150,
              mass: 0.5,
            },
          },
        }}
        animate={cursorVariant}
        style={{ left: mousePosition.x, top: mousePosition.y }}
      />

      <div className="relative z-10 container mx-auto px-4 py-24">
        <div ref={contentRef} className="text-center flex flex-col items-center">
          {/* Subtitle text with gradient line */}
          <motion.div ref={subtitleRef} className="font-mono text-sm uppercase tracking-widest text-foreground/70 mb-6 relative hero-role">
            <span>{heroContent.subtitle}</span>
            <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden">
              <motion.div className="hero-subtitle-line h-full" style={{ background: "linear-gradient(to right, transparent, hsla(var(--primary), 0.5), transparent)" }} />
            </div>
          </motion.div>

          {/* Animated title with clip reveal */}
          <h1
            ref={titleRef}
            className="text-5xl sm:text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-[0.9] relative overflow-hidden"
            onMouseEnter={handleMouseEnterText}
            onMouseLeave={handleMouseLeaveText}>
            <div className="hero-title-mask overflow-hidden relative">
              <span className="block bg-clip-text ">{heroContent.title}</span>
            </div>

            {/* Title glow effect */}
            <motion.div
              className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
              animate={{
                opacity: [0, 0.5, 0],
                left: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 5,
              }}
            />
          </h1>

          {/* Introduction with word-by-word animation */}
          <div className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto hero-intro-text space-y-4">
            {heroContent.introduction.split(". ").map((sentence, i) => (
              <p key={i} className="hero-intro-text" onMouseEnter={handleMouseEnterText} onMouseLeave={handleMouseLeaveText}>
                {sentence}
                {i < heroContent.introduction.split(". ").length - 1 ? "." : ""}
              </p>
            ))}
          </div>

          {/* Animated roles */}
          <div className="h-16 mb-12 overflow-hidden">
            <div className="flex flex-wrap gap-3 justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRoleIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm px-6 py-3 border border-primary/20 rounded-full bg-primary/5 backdrop-blur-xl font-mono">
                  {heroContent.roles[currentRoleIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* 3D tilt card with interactive effects */}
          <motion.div
            className="relative mb-16 group p-1 rounded-2xl hero-cta"
            style={{
              perspective: 1000,
              transform: `rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
              transition: "transform 0.2s ease-out",
            }}
            onMouseMove={handleCardMove}
            onMouseLeave={handleCardLeave}
            whileHover={{ scale: 1.05 }}>
            {/* Particle effect on hover */}
            <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-primary"
                  initial={{
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    opacity: 0,
                  }}
                  animate={{
                    x: [null, Math.random() * 200 - 100],
                    y: [null, Math.random() * 200 - 100],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <Button
              size="lg"
              className="relative rounded-xl text-primary-foreground bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 border-0 px-8 py-6 h-auto overflow-hidden group"
              onMouseEnter={handleMouseEnterButton}
              onMouseLeave={handleMouseLeaveButton}>
              <span className="relative z-10 text-base font-medium">{heroContent.ctaText}</span>

              {/* Button shimmer effect */}
              <motion.span
                className="absolute inset-0 -z-10"
                initial={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                  left: "-100%",
                }}
                animate={{ left: "200%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              />

              {/* Button glow pulse */}
              <motion.span
                className="absolute inset-0 rounded-xl -z-10"
                animate={{
                  boxShadow: ["0 0 0px hsla(var(--primary), 0)", "0 0 20px hsla(var(--primary), 0.5)", "0 0 0px hsla(var(--primary), 0)"],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </Button>
          </motion.div>

          {/* Animated badge/tech stack display */}
          <motion.div
            className="flex flex-wrap gap-2 justify-center max-w-md mx-auto mb-12 hero-floating-element"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}>
            {["React", "Next.js", "TypeScript", "Tailwind", "GSAP"].map((tech, i) => (
              <motion.span
                key={i}
                className="px-3 py-1 text-xs bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/70"
                whileHover={{ scale: 1.1, backgroundColor: "hsla(var(--primary), 0.2)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.1, duration: 0.5 }}>
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hero-scroll-indicator">
          <div className="flex flex-col items-center">
            <div className="w-8 h-12 border border-white/10 rounded-full flex justify-center">
              <motion.div
                className="w-2 h-2 bg-primary rounded-full mt-2"
                animate={{
                  y: [0, 20, 0],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
