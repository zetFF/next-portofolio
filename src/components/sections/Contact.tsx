"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import contactContent from "@/data/contactContent.json";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Form submitted:", formState);
    setIsSubmitting(false);
    setFormState({ name: "", email: "", message: "" });
    alert("Thanks for your message! I'll get back to you soon.");
  };

  useEffect(() => {
    if (sectionRef.current) {
      // GSAP animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      tl.fromTo(".contact-title", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(".contact-subtitle", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3")
        .fromTo(".contact-form", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.2");
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const socialVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.3 + custom * 0.1, duration: 0.5 },
    }),
  };

  // Define the contact info structure to match your JSON
  interface ContactInfoItem {
    label: string;
    value: string;
    icon: string;
  }

  // Create contact info items from the data we have
  const contactInfoItems: ContactInfoItem[] = [
    {
      label: "Email",
      value: contactContent.email,
      icon: "✉️", // Default icon
    },
    // You can add more contact info items here if needed
  ];

  return (
    <section ref={sectionRef} id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/90"></div>

        {/* Modern grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Animated accent */}
        <motion.div
          className="absolute -right-1/4 top-1/4 w-1/2 h-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background: "linear-gradient(135deg, hsla(var(--primary), 0.3) 0%, transparent 60%)",
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/5">
            <h2 className="contact-title text-5xl font-bold mb-6 tracking-tight">{contactContent.title}</h2>
            <p className="contact-subtitle text-lg text-foreground/70 mb-10">{contactContent.subtitle}</p>

            <div className="mb-16">
              <div className="space-y-6">
                {contactInfoItems.map((info, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4 shrink-0">
                      <span className="text-primary">{info.icon}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-foreground/60 mb-1">{info.label}</h3>
                      <p className="text-foreground font-medium">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-medium text-foreground/60 mb-4">Connect with me</h3>
                <div className="flex gap-4">
                  {contactContent.socials.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      custom={index}
                      variants={socialVariants}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-secondary/60 hover:bg-primary hover:text-white hover:scale-110">
                      <span className="sr-only">{social.name}</span>
                      {/* Just using a placeholder for icons */}
                      <div className="w-5 h-5">{social.icon.charAt(0)}</div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form lg:w-3/5">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-8 h-full"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                boxShadow: "0 4px 24px 0 rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}>
              <div className="space-y-6">
                {contactContent.formFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label htmlFor={field.id} className="block text-sm font-medium text-foreground/80">
                      {field.label}
                    </label>

                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.id}
                        name={field.id}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={formState[field.id as keyof typeof formState] || ""}
                        onChange={handleChange}
                        className="bg-secondary/30 border-white/5 focus:border-primary focus:ring-primary placeholder:text-foreground/30 rounded-lg"
                        rows={6}
                      />
                    ) : (
                      <Input
                        id={field.id}
                        name={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={formState[field.id as keyof typeof formState] || ""}
                        onChange={handleChange}
                        className="bg-secondary/30 border-white/5 focus:border-primary focus:ring-primary placeholder:text-foreground/30 rounded-lg h-12"
                      />
                    )}
                  </div>
                ))}

                <div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all duration-300 font-medium">
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      contactContent.submitText
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
