import React from "react";
import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Layer: Industrial Grid */}
      <div className="fixed inset-0 grid-pattern opacity-40 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
        <div className="mb-8 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <Terminal className="w-12 h-12 text-zinc-600" />
        </div>

        <div className="px-3 py-1 rounded-full border border-red-900/50 bg-red-950/20 text-[10px] font-mono text-red-500 mb-6 tracking-tight uppercase">
           [ERROR::NODE_NOT_FOUND_404]
        </div>

        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
           The Void <br />
           <span className="text-zinc-700">Awaits.</span>
        </h1>

        <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
          The knowledge node you are looking for has been moved, deleted, or never existed in this hierarchy.
        </p>

        <Link 
          href="/" 
          className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs transition-all hover:pr-10"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Origin</span>
        </Link>
      </div>

      {/* Decorative Technical Overlays */}
      <div className="absolute bottom-8 left-8 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
        <span>Status: Disconnected</span>
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
        <span>Lambda_OS_v7.4.0</span>
      </div>
    </div>
  );
}
