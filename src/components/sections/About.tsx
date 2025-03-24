"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, AnimatePresence, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import aboutContent from "@/data/aboutContent.json";

gsap.registerPlugin(ScrollTrigger);

// Helper function to safely check if code is running in browser
const isBrowser = typeof window !== "undefined";

// Define types for our content structure
type Skill = {
  name: string;
  level?: number;
};

type Journey = {
  year: string;
  title: string;
  description: string;
};

// Define the structure for our JSON data
type AboutContentType = {
  title: string;
  paragraphs: string[];
  emphasisPhrases: string[];
  skills: string[];
  skillsByCategory: {
    [key: string]: Skill[];
  };
  experience: {
    years: number;
    projects: number;
  };
  journey: Journey[];
};

// Type assertion to tell TypeScript the structure of our data
const typedAboutContent = aboutContent as unknown as AboutContentType;

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Mouse interaction state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // For parallax effects
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Spring physics for smoother motion
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 30 });

  // State for active skill category
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(typedAboutContent.skillsByCategory)[0]);

  // State for animated counter
  const [yearsCount, setYearsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const targetYears = typedAboutContent.experience.years;
  const targetProjects = typedAboutContent.experience.projects;

  // State for experience graph
  const [showGraph, setShowGraph] = useState(false);

  // Handle mouse move for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Canvas particle effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const skills = typedAboutContent.skills;
    const particles: {
      x: number;
      y: number;
      size: number;
      text: string;
      vx: number;
      vy: number;
      color: string;
    }[] = [];

    // Create particles for each skill
    skills.forEach((skill) => {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 15 + 10,
        text: skill,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: `hsla(${Math.random() * 60 + 200}, 70%, 60%, 0.7)`,
      });
    });

    let animationFrameId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px 'SF Mono', monospace`;
        ctx.fillText(p.text, p.x, p.y);

        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Boundary checks
        if (p.x < 0 || p.x > canvas.width - p.size * p.text.length) {
          p.vx *= -1;
        }

        if (p.y < p.size || p.y > canvas.height) {
          p.vy *= -1;
        }

        // Mouse interaction
        const dx = mouseX.get() - p.x;
        const dy = mouseY.get() - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const angle = Math.atan2(dy, dx);
          const force = 1 - dist / 150;
          p.vx -= Math.cos(angle) * force * 0.5;
          p.vy -= Math.sin(angle) * force * 0.5;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [mouseX, mouseY]);

  // GSAP animations for skills
  useEffect(() => {
    if (skillsRef.current) {
      const skillsElements = skillsRef.current.querySelectorAll(".skill-item");

      // Create a staggered animation for skill items
      gsap.fromTo(
        skillsElements,
        {
          opacity: 0,
          y: 20,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: skillsRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // Bio section animation
      if (bioRef.current) {
        gsap.fromTo(
          bioRef.current.querySelectorAll("p"),
          {
            opacity: 0,
            x: -30,
          },
          {
            opacity: 1,
            x: 0,
            stagger: 0.2,
            duration: 0.8,
            scrollTrigger: {
              trigger: bioRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }
    }

    return () => {
      // Clean up ScrollTrigger instances
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Start counter animation when section comes into view
  useEffect(() => {
    if (isInView) {
      const animateCounters = () => {
        const duration = 2000; // 2 seconds
        const frameDuration = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);

        let frame = 0;

        const counter = setInterval(() => {
          frame++;
          const progress = frame / totalFrames;

          setYearsCount(Math.floor(progress * targetYears));
          setProjectsCount(Math.floor(progress * targetProjects));

          if (frame === totalFrames) {
            clearInterval(counter);
            setYearsCount(targetYears);
            setProjectsCount(targetProjects);

            // Show graph after counters complete
            setTimeout(() => setShowGraph(true), 300);
          }
        }, frameDuration);

        return () => clearInterval(counter);
      };

      const counterCleanup = animateCounters();
      return () => counterCleanup();
    }
  }, [isInView, targetYears, targetProjects]);

  // Variants for animations
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const emphasisVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.2,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 },
    },
  };

  useEffect(() => {
    // Now it's safe to use window
    const handleResize = () => {
      // Update rotation transforms based on window size
      rotateX.set(0); // Set initial values
      rotateY.set(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rotateX, rotateY]);

  return (
    <section ref={sectionRef} className="min-h-screen py-24 relative overflow-hidden" id="about">
      {/* Particle canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-20 opacity-[0.15]" />

      {/* Modern grid lines */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        <div className="flex items-center mb-16">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-px bg-primary flex-grow mr-4 origin-left"
          />
          <motion.h2
            initial={{ opacity: 0, y: -50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
            className="text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {typedAboutContent.title}
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
            className="h-px bg-primary flex-grow ml-4 origin-right"
          />
        </div>

        {/* 3D rotating cards with experience stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <motion.div
            style={{
              perspective: 1000,
              rotateX: springRotateX,
              rotateY: springRotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-40 w-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center"
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              whileHover="hover"
              transition={{ delay: 0.1 }}>
              <h3 className="text-lg text-white/70 mb-2 font-mono">Experience</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold mr-2 text-primary">{yearsCount}</span>
                <span className="text-xl text-white/60">years</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{
              perspective: 1000,
              rotateX: springRotateX,
              rotateY: springRotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-40 w-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center"
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              whileHover="hover"
              transition={{ delay: 0.2 }}>
              <h3 className="text-lg text-white/70 mb-2 font-mono">Projects Completed</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold mr-2 text-primary">{projectsCount}</span>
                <span className="text-xl text-white/60">projects</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{
              perspective: 1000,
              rotateX: springRotateX,
              rotateY: springRotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-40 w-full">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center"
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              whileHover="hover"
              transition={{ delay: 0.3 }}>
              <h3 className="text-lg text-white/70 mb-2 font-mono">Satisfaction Rate</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold mr-2 text-primary">99</span>
                <span className="text-xl text-white/60">%</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div ref={bioRef}>
            {/* About me content with special effects */}
            <div className="relative">
              {typedAboutContent.paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  variants={textVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.2 }}
                  className="text-foreground/80 mb-8 leading-relaxed relative z-10">
                  {paragraph}
                </motion.p>
              ))}

              {/* Interactive highlight words */}
              <div className="mt-16 space-y-4">
                {typedAboutContent.emphasisPhrases.map((phrase, index) => (
                  <motion.div key={index} custom={index} variants={emphasisVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="group">
                    <div className="text-3xl md:text-4xl font-bold text-primary relative z-10 inline-block">
                      {phrase}
                      <motion.div
                        className="absolute inset-0 -z-10 rounded-md opacity-0 group-hover:opacity-100"
                        animate={{
                          boxShadow: ["0 0 0px hsla(var(--primary), 0)", "0 0 40px hsla(var(--primary), 0.2)", "0 0 0px hsla(var(--primary), 0)"],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Experience graph */}
              <AnimatePresence>
                {showGraph && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="mt-16">
                    <h3 className="text-lg font-mono text-white/70 mb-4">Experience Growth</h3>
                    <div className="h-40 relative rounded-md overflow-hidden border border-white/10 p-3">
                      <div className="absolute inset-0 grid grid-cols-5 grid-rows-4">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="border-b border-r border-white/5"></div>
                        ))}
                      </div>
                      <div className="absolute bottom-3 left-0 right-0 h-px bg-white/20" />
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-white/20" />

                      <motion.svg viewBox="0 0 100 100" className="w-full h-full relative z-10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }}>
                        <motion.path
                          d="M 0,100 Q 20,80 40,70 T 60,40 T 100,10"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                        {/* Data points */}
                        {[
                          [0, 100],
                          [20, 80],
                          [40, 70],
                          [60, 40],
                          [100, 10],
                        ].map(([x, y], i) => (
                          <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="hsl(var(--primary))"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5 + i * 0.2, duration: 0.5 }}
                          />
                        ))}
                      </motion.svg>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Skills section with tabs and interactive elements */}
          <div ref={skillsRef}>
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {Object.keys(typedAboutContent.skillsByCategory).map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-mono transition-all duration-300 ${
                      activeCategory === category ? "bg-primary text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    {category}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {typedAboutContent.skillsByCategory[activeCategory].map((skill, i) => (
                    <motion.div
                      key={i}
                      className="skill-item relative px-4 py-4 border border-border rounded-lg text-center bg-secondary/10 backdrop-blur-sm hover:bg-secondary/30 transition-colors duration-300 group overflow-hidden"
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}>
                      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/20 to-transparent" />
                      <div className="font-mono text-sm">{skill.name}</div>

                      {skill.level && (
                        <div className="mt-2 bg-black/20 h-1.5 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Professional journey timeline */}
            <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-16 relative">
              <h3 className="text-lg font-mono text-white/70 mb-8">Professional Journey</h3>

              <div className="relative border-l-2 border-primary/30 pl-8 ml-2">
                {typedAboutContent.journey?.map((item, i) => (
                  <motion.div
                    key={i}
                    className="mb-10 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.2 }}>
                    <div className="absolute -left-10 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                    <div className="text-sm font-mono text-primary mb-1">{item.year}</div>
                    <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-white/60 text-sm">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Animated background element */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, hsla(var(--primary), 0.15) 0%, transparent 70%)",
              "radial-gradient(circle at 70% 60%, hsla(var(--primary), 0.15) 0%, transparent 70%)",
              "radial-gradient(circle at 40% 80%, hsla(var(--primary), 0.15) 0%, transparent 70%)",
              "radial-gradient(circle at 20% 30%, hsla(var(--primary), 0.15) 0%, transparent 70%)",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 -z-10"
        />
      </div>
    </section>
  );
}
