"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, Cpu, Globe, Database, Activity, Code, Target } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative min-h-screen selection:bg-white selection:text-black overflow-x-hidden font-sans">
      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="px-6 pt-32 pb-20 md:pt-52 md:pb-32 max-w-7xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center"
          >
            <div className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950/50 text-[10px] font-mono text-zinc-400 mb-10 tracking-[0.2em] uppercase">
               [PROTOCOLO_CARTOGRAFIA_VIVA_KNOWLEDGE_TREE]
            </div>

            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-12">
               Knowledge <br />
               <span className="text-zinc-600 outline-text">Archive.</span>
            </h1>

            <p className="max-w-3xl text-lg md:text-xl text-zinc-400 font-medium leading-relaxed mb-16">
              The unified repository for the investigation of the 5 Core Sciences. 
              LambdaIDX provides a high-efficiency research environment to navigate the complexity 
              of all known human knowledge through clear, hierarchical structures.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-6">
              <Link 
                href="/p/introduction" 
                className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-sm overflow-hidden transition-all hover:pr-14"
              >
                <span>Initialize Cartography</span>
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              
              <Link 
                href="/admin/dashboard" 
                className="px-10 py-5 border border-zinc-800 bg-black hover:bg-zinc-900 transition-colors font-bold uppercase tracking-widest text-xs text-zinc-400"
              >
                Core Management
              </Link>
            </div>
          </motion.div>

          {/* Visual Knowledge Graph Hook */}
          <div className="mt-32 w-full max-w-4xl aspect-[21/9] relative blueprint-border border rounded-2xl overflow-hidden group">
             <div className="absolute inset-0 bg-zinc-950/50 group-hover:bg-transparent transition-colors duration-700" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="flex flex-col items-center text-center">
                    <Database className="w-12 h-12 text-zinc-700 mb-4 animate-bounce" />
                    <span className="font-mono text-[10px] text-zinc-600 tracking-[0.3em] uppercase">Mapping Hierarchical Academic Nodes...</span>
                 </div>
             </div>
             {/* Decorative blueprint lines */}
             <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-900" />
             <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-900" />
          </div>
        </section>

        {/* FEATURES - THE CORE PROMISE */}
        <section className="px-6 py-32 border-t border-zinc-900 bg-zinc-950/20">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
                <div className="max-w-xl text-left">
                   <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest mb-4 block underline underline-offset-8">Section: Knowledge_Ecosystem</span>
                   <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-4">
                      Beyond <br /> <span className="text-zinc-600">Classification.</span>
                   </h2>
                </div>
                <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-700 uppercase tracking-widest border-l border-zinc-800 pl-6">
                    <span>Hierarchy: Multi-Level</span>
                    <span>Curation: Human-Led</span>
                    <span>Goal: Discovery</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-zinc-900">
                <FeatureBlock 
                   id="01"
                   icon={<Layers className="w-5 h-5 text-white" />}
                   title="Universal Repository"
                   description="A centralized archive for the 5 Core Sciences, organizing every known concept into a clear, navigable hierarchy."
                />
                <FeatureBlock 
                   id="02"
                   icon={<Target className="w-5 h-5 text-white" />}
                   title="Research Efficiency"
                   description="Optimized for deep study and investigation. Find the exact node of information without the noise of generic search."
                />
                <FeatureBlock 
                   id="03"
                   icon={<Globe className="w-5 h-5 text-white" />}
                   title="Scientific Mapping"
                   description="Visualize the connections between Formal, Natural, and Social sciences in a living map of relationships."
                />
                <FeatureBlock 
                   id="04"
                   icon={<Cpu className="w-5 h-5 text-white" />}
                   title="Infoxication Shield"
                   description="Reduces cognitive overload by providing structure and direction. Know 'what', 'with what' and 'where' to study."
                />
                <FeatureBlock 
                   id="05"
                   icon={<Activity className="w-5 h-5 text-white" />}
                   title="Discovery Engine"
                   description="Transform search into logic. Every node is a step in a structured journey of learning and research."
                />
                <FeatureBlock 
                   id="06"
                   icon={<Code className="w-5 h-5 text-white" />}
                   title="Technical Density"
                   description="Designed for professional analysis and data collection, ensuring sub-200ms transitions between nodes."
                />
             </div>
          </div>
        </section>

        {/* MOCK TERMINAL - CORE MISSION */}
        <section className="px-6 py-40 max-w-5xl mx-auto">
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="h-10 bg-zinc-800/50 flex items-center px-4 gap-2 border-b border-zinc-800">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                    <span className="ml-auto text-[10px] font-mono text-zinc-500 uppercase tracking-widest">lambdaidx_mission_log --read</span>
                </div>
                <div className="p-8 font-mono text-sm leading-relaxed text-zinc-400">
                    <p className="text-white">$ cat mission.txt</p>
                    <p className="mt-4 text-zinc-300">"LambdaIDX serves as a living repository for the investigation and study of all known sciences."</p>
                    <p className="mt-2">Efficiently mapping the complexity of scientific knowledge through 5 core foundational branches.</p>
                    <p className="mt-4 text-green-500">✓ Unified Scientific Archive Online</p>
                    <p className="mt-1 text-green-500">✓ High-efficiency Research Environment</p>
                    <p className="mt-1 text-green-500">✓ Mapping complexity of the 5 Sciences</p>
                    <p className="mt-8 text-white">Status: ARCHIVE_READY. Proceed with Research.</p>
                </div>
            </div>
        </section>
      </main>

      {/* Footer Design */}
      <footer className="relative z-10 px-6 py-20 border-t border-zinc-900">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div>
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black rounded-sm">L</div>
                 <span className="text-2xl font-black uppercase tracking-tighter">LambdaIDX</span>
               </div>
               <p className="text-zinc-500 max-w-xs text-sm leading-relaxed italic">
                 "Because information without structure is just static noise."
               </p>
            </div>
            <div className="grid grid-cols-2 gap-16">
               <FooterLinkGroup 
                  title="Architecture" 
                  links={["Nodes", "Registry", "Engine"]} 
               />
               <FooterLinkGroup 
                  title="Protocol" 
                  links={["Docs", "Security", "Standards"]} 
               />
            </div>
         </div>
         <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] uppercase font-mono text-zinc-600 tracking-widest">
            <span>© 2024 Lambda Engineering System</span>
            <span>Est. San Francisco_v7</span>
         </div>
      </footer>

      <style jsx global>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(51, 65, 85, 0.5);
          color: transparent;
          text-shadow: 0 0 0 rgba(51, 65, 85, 0.08);
        }

        html[data-theme="dark"] .outline-text {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);
          color: transparent;
          text-shadow: none;
        }
      `}</style>
    </div>
  );
}

function FeatureBlock({ id, icon, title, description }: { id: string, icon: React.ReactNode; title: string, description: string }) {
  return (
    <div className="p-10 border border-zinc-900 hover:bg-zinc-900/40 transition-all group relative overflow-hidden">
      <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-800 tracking-tighter">
        INDEX__{id}
      </div>
      <div className="w-10 h-10 mb-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center rounded-lg group-hover:scale-110 group-hover:border-white transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-bold uppercase tracking-tight mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed lowercase tracking-tight">
        {description}
      </p>
    </div>
  );
}

function FooterLinkGroup({ title, links }: { title: string, links: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[10px] font-mono text-zinc-300 uppercase tracking-[0.3em] font-bold">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="text-sm text-zinc-600 hover:text-white transition-colors uppercase tracking-tighter">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
