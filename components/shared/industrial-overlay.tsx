"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function IndustrialOverlay() {
  const pathname = usePathname();
  const isContentPage = pathname.startsWith("/p/");
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Background Layer: Industrial Grid — hidden on content pages for reading focus */}
      <div
        className="fixed inset-0 grid-pattern pointer-events-none z-0 transition-opacity duration-700"
        style={{ opacity: isContentPage ? 0 : 0.4 }}
      />
      <div
        className="fixed inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10 dark:via-black/50 dark:to-black pointer-events-none z-0 transition-opacity duration-700"
        style={{ opacity: isContentPage ? 0 : 1 }}
      />

      {/* Interactive mouse gradient - Moved after backgrounds to ensure visibility */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-10 transition-opacity duration-700 hidden sm:block mix-blend-screen"
        style={{
          opacity: isContentPage ? 0 : 1, // Increased base opacity
          background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.08), transparent 80%)`
        }}
      />


      {!isContentPage && (
        <div className="fixed top-8 right-8 hidden lg:flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest opacity-30 pointer-events-none z-50">
          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Node Cluster Online</span>
          </div>
          <span>UTC: {new Date().toISOString().split('T')[0]}</span>
        </div>
      )}
    </>
  );
}
