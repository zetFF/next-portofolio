"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import caseStudiesContent from "@/data/caseStudiesContent.json";

gsap.registerPlugin(ScrollTrigger);

type Project = (typeof caseStudiesContent.projects)[0];

export default function CaseStudies() {
  // Refs and animation state
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Project filtering and selection state
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(caseStudiesContent.projects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"default" | "budget" | "duration">("default");

  // Motion values for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollY = useMotionValue(0);

  // Filter projects based on active category and search query
  useEffect(() => {
    let filtered = caseStudiesContent.projects;

    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((project) => project.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((project) => project.title.toLowerCase().includes(query) || project.client.toLowerCase().includes(query) || project.location.toLowerCase().includes(query));
    }

    // Apply sorting
    if (sortOrder === "budget") {
      filtered = [...filtered].sort((a, b) => {
        const budgetA = parseInt(a.budget.replace(/[^0-9]/g, ""));
        const budgetB = parseInt(b.budget.replace(/[^0-9]/g, ""));
        return budgetB - budgetA;
      });
    } else if (sortOrder === "duration") {
      filtered = [...filtered].sort((a, b) => {
        const durationA = parseInt(a.duration.replace(/[^0-9]/g, ""));
        const durationB = parseInt(b.duration.replace(/[^0-9]/g, ""));
        return durationB - durationA;
      });
    }

    setFilteredProjects(filtered);
  }, [activeCategory, searchQuery, sortOrder]);

  // Create memoized category counts
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: caseStudiesContent.projects.length };

    caseStudiesContent.categories.forEach((category) => {
      const categoryLower = category.toLowerCase();
      counts[categoryLower] = caseStudiesContent.projects.filter((project) => project.category.toLowerCase() === categoryLower).length;
    });

    return counts;
  }, []);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  // Set up GSAP animations
  useEffect(() => {
    if (!sectionRef.current) return;

    // GSAP animation for title reveal
    gsap.fromTo(
      ".case-studies-title",
      {
        opacity: 0,
        y: -50,
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

    // Advanced grid animations
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".project-card");

      gsap.fromTo(
        cards,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    // Set up canvas for particle effects
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas dimensions
      const updateDimensions = () => {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
          setDimensions({ width: rect.width, height: rect.height });
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      // Create particles
      const particles: {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        color: string;
      }[] = [];

      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`,
        });
      }

      // Animate particles
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle) => {
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();

          particle.x += particle.speedX;
          particle.y += particle.speedY;

          if (particle.x < 0 || particle.x > canvas.width) {
            particle.speedX *= -1;
          }

          if (particle.y < 0 || particle.y > canvas.height) {
            particle.speedY *= -1;
          }
        });

        requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Project card hover effects
  const getCardSpring = (value: MotionValue<number>, from: number, to: number) => {
    const springValue = useSpring(useTransform(value, [from, to], [10, -10]), {
      stiffness: 200,
      damping: 30,
    });
    return springValue;
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  // Modal animations
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  const openProjectModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeProjectModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <section ref={sectionRef} id="projects" className="min-h-screen py-24 relative overflow-hidden">
      {/* Particle canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 -z-5 opacity-20" />

      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl z-10 relative">
        {/* Animated header */}
        <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 10 }} transition={{ duration: 0.8 }}>
          <h2 className="case-studies-title text-5xl  font-bold tracking-tight relative inline-block">
            {caseStudiesContent.title}
            <motion.span
              className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary to-primary/0"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </h2>
        </motion.div>

        {/* Category filters */}
        <motion.div className="flex flex-wrap gap-4 mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <motion.button
            className={`px-6 py-2 rounded-full transition-all font-medium relative overflow-hidden ${
              activeCategory === "all" ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary/40 text-foreground/80 hover:bg-secondary/60"
            }`}
            onClick={() => setActiveCategory("all")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            All
            <motion.span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-white/20" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              {categoryCounts.all}
            </motion.span>
            {activeCategory === "all" && (
              <motion.span
                className="absolute bottom-0 left-0 h-full w-full bg-gradient-to-r from-primary/40 to-secondary/20 -z-10"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.button>

          {caseStudiesContent.categories.map((category, index) => (
            <motion.button
              key={index}
              className={`px-6 py-2 rounded-full transition-all font-medium relative overflow-hidden ${
                activeCategory === category.toLowerCase() ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary/40 text-foreground/80 hover:bg-secondary/60"
              }`}
              onClick={() => setActiveCategory(category.toLowerCase())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.05 }}>
              {category}
              <motion.span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-white/20" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                {categoryCounts[category.toLowerCase()] || 0}
              </motion.span>

              {activeCategory === category.toLowerCase() && (
                <motion.span
                  className="absolute bottom-0 left-0 h-full w-full bg-gradient-to-r from-primary/40 to-secondary/20 -z-10"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <div ref={gridRef} className="relative min-h-[400px]">
          {filteredProjects.length === 0 && (
            <motion.div className="text-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl text-white/60 font-medium">No projects found</h3>
              <p className="text-white/40 mt-2">Try changing your search or category filter</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + searchQuery + sortOrder}
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="project-card group relative rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    boxShadow: "0 10px 30px -15px rgba(0,0,0,0.3)",
                  }}
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)",
                  }}
                  onClick={() => openProjectModal(project)}
                  onMouseEnter={() => setHoveredCard(project.id)}
                  onMouseLeave={() => setHoveredCard(null)}>
                  <div className="aspect-[16/10] w-full relative">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ objectPosition: "center" }}
                      unoptimized
                    />

                    {/* Overlay with gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
                      initial={{ opacity: 0.8 }}
                      animate={{
                        opacity: hoveredCard === project.id ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Particle effect on hover */}
                    {hoveredCard === project.id && (
                      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {Array.from({ length: 10 }).map((_, index) => (
                          <motion.div
                            key={index}
                            className="absolute w-1 h-1 rounded-full bg-primary"
                            initial={{
                              x: Math.random() * 100 + 100,
                              y: Math.random() * 100 + 100,
                              opacity: 0,
                            }}
                            animate={{
                              x: Math.random() * 300,
                              y: Math.random() * 200,
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              delay: index * 0.08,
                              repeat: Infinity,
                              repeatType: "loop",
                            }}
                            style={{
                              width: Math.random() * 3 + 2 + "px",
                              height: Math.random() * 3 + 2 + "px",
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <div className="absolute inset-0 p-6 flex flex-col justify-end transform transition-transform duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-primary-foreground">{project.category}</span>
                      <motion.div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" initial={{ y: 10, opacity: 0 }} whileHover={{ y: 0, opacity: 1 }}>
                        <p className="text-xs text-foreground/70">{project.budget}</p>
                        <p className="text-xs text-foreground/70">{project.duration}</p>
                      </motion.div>
                    </div>

                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-sm text-foreground/70 mb-4">
                      {project.client} • {project.location}
                    </p>

                    <motion.div initial={{ width: 0 }} whileHover={{ width: "100%" }} className="h-0.5 bg-primary/50 mb-4" />

                    <motion.div className="inline-flex items-center text-sm text-primary hover:text-primary/90 transition-colors" whileHover={{ x: 5 }}>
                      View case study
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating decoration elements */}
      <motion.div
        className="absolute top-20 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 bg-primary/30 -z-5"
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute bottom-40 -left-24 w-80 h-80 rounded-full blur-3xl opacity-10 bg-primary/20 -z-5"
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Project modal */}
      <AnimatePresence>
        {isModalOpen && selectedProject && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeProjectModal}>
            {/* Modal backdrop */}
            <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

            {/* Modal content */}
            <motion.div
              className="bg-black/90 border border-primary/20 rounded-2xl overflow-hidden relative z-10 w-full max-w-5xl max-h-[90vh] shadow-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button className="absolute top-4 right-4 z-10 bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors" onClick={closeProjectModal}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row h-full overflow-hidden">
                {/* Project image */}
                <div className="w-full md:w-1/2 relative">
                  <div className="aspect-[4/3] relative">
                    <Image src={selectedProject.imageUrl} alt={selectedProject.title} fill className="object-cover" unoptimized />
                  </div>
                </div>

                {/* Project details */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto custom-scrollbar">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-primary/20 text-primary text-xs py-1 px-3 rounded-full">{selectedProject.category}</span>
                      <span className="text-xs text-white/60">ID: {selectedProject.id}</span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{selectedProject.title}</h2>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                        <span className="block text-white/40 text-xs">Client</span>
                        <span>{selectedProject.client}</span>
                      </div>

                      <div className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                        <span className="block text-white/40 text-xs">Location</span>
                        <span>{selectedProject.location}</span>
                      </div>

                      <div className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                        <span className="block text-white/40 text-xs">Budget</span>
                        <span>{selectedProject.budget}</span>
                      </div>

                      <div className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                        <span className="block text-white/40 text-xs">Duration</span>
                        <span>{selectedProject.duration}</span>
                      </div>
                    </div>

                    {/* Long description */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Project Overview</h3>
                      <p className="text-white/70 leading-relaxed mb-4">
                        {selectedProject.description ||
                          "A comprehensive project showcasing our expertise in delivering high-quality solutions tailored to the client's specific needs. This project demonstrates our ability to balance aesthetics, functionality, and technical excellence."}
                      </p>

                      <p className="text-white/70 leading-relaxed">
                        The project involved extensive collaboration with the client to ensure their vision was accurately translated into a practical and effective solution. The result exceeded
                        expectations and provided significant business value.
                      </p>
                    </div>

                    {/* Project features */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <motion.li key={i} className="flex items-center gap-2 text-white/70" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                            <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                            <span>Feature {i + 1}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Call to action */}
                    <Link href={selectedProject.detailUrl} className="inline-block">
                      <motion.div
                        className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-lg font-medium mt-4 inline-flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        See Full Case Study
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </motion.div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
