"use client";

import React, { useState } from "react";
import { List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TableOfContents } from "./table-of-contents";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export function MobileTOC() {
  const [isOpen, setIsOpen] = useState(false);
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  return (
    <div className="lg:hidden fixed bottom-6 right-6 z-[80]">
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-4 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center group active:scale-95 transition-transform"
      >
        <List className="w-6 h-6" />
      </button>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              ref={focusTrapRef}
              className="fixed inset-x-0 bottom-0 bg-white dark:bg-zinc-950 rounded-t-[32px] z-[100] p-8 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold tracking-tight">Navigation</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="pb-10">
                <TableOfContents />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
