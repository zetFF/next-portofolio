"use client";

import { motion } from "framer-motion";

export default function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
        <motion.div
          animate={{
            rotate: 360,
            borderRadius: ["25%", "50%", "25%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 mx-auto mb-4 border-t-4 border-l-4 border-purple-500"
        />
        <p className="text-xl text-white/80">Loading amazing things...</p>
      </motion.div>
    </div>
  );
}
