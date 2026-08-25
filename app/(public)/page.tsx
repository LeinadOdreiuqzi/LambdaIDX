"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, Cpu, Globe, Activity, Code, Target } from "lucide-react";
import { motion } from "framer-motion";
import { PublicFooter } from "@/components/shared/public-footer";
import { InteractiveKnowledgeGraph } from "@/components/features/landing/interactive-knowledge-graph";

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
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tight leading-none md:leading-[0.95] mb-12">
              Knowledge<br />
              <span className="text-zinc-600 outline-text">Archive.</span>
            </h1>

            <p className="max-w-3xl text-lg md:text-xl text-zinc-400 font-medium leading-relaxed mb-16">
              El repositorio unificado para la investigación de las 5 Ciencias Fundamentales.
              LambdaIDX proporciona un entorno de investigación de alta eficiencia para navegar por la complejidad
              de todo el conocimiento humano a través de estructuras jerárquicas claras.
            </p>

            <div className="flex flex-col items-center gap-4">
              <Link
                href="/index/introduccion"
                className="group relative px-16 py-7 bg-white dark:bg-zinc-200 text-black dark:text-black font-black uppercase tracking-widest text-lg overflow-hidden transition-all hover:pr-20 hover:scale-105 shadow-2xl shadow-white/20 dark:shadow-zinc-500/30"
              >
                <span>Iniciar Cartografía</span>
                <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>

              <Link
                href="/login"
                className="px-6 py-2 border border-zinc-800 dark:border-zinc-600 bg-transparent hover:bg-zinc-900/50 dark:hover:bg-zinc-700/50 transition-colors font-medium uppercase tracking-wider text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-400 dark:hover:text-zinc-300 mt-2"
              >
                Gestión Central
              </Link>
            </div>
          </motion.div>

          {/* Visual Knowledge Graph Hook */}
          <InteractiveKnowledgeGraph />
        </section>

        {/* FEATURES - THE CORE PROMISE */}
        <section className="px-6 py-32 border-t border-zinc-900 bg-zinc-950/20">
          <div className="max-w-7xl mx-auto">

            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
              <div className="max-w-2xl text-left">
                <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest mb-4 block underline underline-offset-8">
                  Sección: Ecosistema_Del_Conocimiento
                </span>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mt-4">
                  La Infraestructura <br />
                  <span className="text-zinc-600">del Saber.</span>
                </h2>
                <p className="mt-6 text-zinc-500 text-sm leading-relaxed max-w-lg">
                  LambdaIDX no es una enciclopedia ni un buscador. Es un sistema de navegación
                  jerárquica para investigadores, estudiantes y profesionales que necesitan
                  orientarse dentro de la complejidad del conocimiento científico.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 font-mono text-[10px] text-zinc-600 uppercase tracking-widest border-l border-zinc-800 pl-6 shrink-0">
                <span className="text-zinc-400">// core_properties</span>
                <span>Arquitectura: Árbol Jerárquico</span>
                <span>Curaduría: Editorial Humana</span>
                <span>Objetivo: Orientación Científica</span>
                <span>Alcance: 5 Ciencias Fundamentales</span>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-zinc-900">
              <FeatureBlock
                id="01"
                icon={<Layers className="w-5 h-5 text-white" />}
                title="Archivo Unificado"
                description="Todas las ciencias en una sola estructura. Física, Química, Biología, Matemáticas y Ciencias Sociales organizadas en un árbol jerárquico único, coherente y navegable desde cualquier profundidad."
              />
              <FeatureBlock
                id="02"
                icon={<Target className="w-5 h-5 text-white" />}
                title="Navegación de Precisión"
                description="Cada concepto tiene una coordenada exacta dentro del sistema. No buscas: navegas. De lo general a lo específico, con contexto completo en cada nodo del árbol."
              />
              <FeatureBlock
                id="03"
                icon={<Globe className="w-5 h-5 text-white" />}
                title="Mapa Interdisciplinario"
                description="Visualiza cómo se conectan las ciencias entre sí. Descubre que la física cuántica alimenta la química computacional, y que la bioquímica ancla a la biología molecular."
              />
              <FeatureBlock
                id="04"
                icon={<Cpu className="w-5 h-5 text-white" />}
                title="Anti-Infoxicación"
                description="Diseñado contra el ruido informativo. Cada página entrega contexto jerarquizado: qué es el concepto, de dónde viene en el árbol y qué profundidad sigue a continuación."
              />
              <FeatureBlock
                id="05"
                icon={<Activity className="w-5 h-5 text-white" />}
                title="Motor de Descubrimiento"
                description="Transforma la curiosidad en recorrido estructurado. Cada nodo es un paso trazable en una ruta de aprendizaje que va desde los fundamentos hasta el límite del conocimiento actual."
              />
              <FeatureBlock
                id="06"
                icon={<Code className="w-5 h-5 text-white" />}
                title="Rendimiento de Investigación"
                description="Construido para sesiones largas de estudio y análisis profesional. Lectura limpia, acceso instantáneo a cualquier nodo y estructura que elimina la fricción cognitiva."
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
              <span className="ml-auto text-[10px] font-mono text-zinc-500 uppercase tracking-widest">bitacora_mision_lambdaidx --read</span>
            </div>
            <div className="p-8 font-mono text-sm leading-relaxed text-zinc-400">
              <p className="text-white">$ cat mision.txt</p>
              <p className="mt-4 text-zinc-300">&quot;LambdaIDX sirve como un repositorio vivo para la investigación y el estudio de todas las ciencias conocidas.&quot;</p>
              <p className="mt-2">Mapeando eficientemente la complejidad del conocimiento científico a través de 5 ramas fundamentales centrales.</p>
              <p className="mt-4 text-green-500">✓ Archivo Científico Unificado en Línea</p>
              <p className="mt-1 text-green-500">✓ Entorno de Investigación de Alta Eficiencia</p>
              <p className="mt-1 text-green-500">✓ Mapeando la complejidad de las 5 Ciencias</p>
              <p className="mt-8 text-white">Estado: ARCHIVE_READY. Proceder con la Investigación.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Design */}
      <PublicFooter />
    </div>
  );
}

function FeatureBlock({ id, icon, title, description }: { id: string, icon: React.ReactNode; title: string, description: string }) {
  return (
    <div className="p-10 border border-zinc-900 hover:bg-zinc-900/40 dark:hover:bg-zinc-800/40 transition-all group relative overflow-hidden">
      <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-800 dark:text-zinc-600 tracking-tighter group-hover:text-white dark:group-hover:text-zinc-300 transition-colors">
        INDEX__{id}
      </div>
      <div className="w-10 h-10 mb-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center rounded-lg group-hover:scale-110 group-hover:border-white dark:group-hover:border-zinc-400 transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-bold uppercase tracking-tight mb-3 group-hover:text-white dark:group-hover:text-zinc-200 transition-colors">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed lowercase tracking-tight group-hover:text-zinc-300 dark:group-hover:text-zinc-500 transition-colors">
        {description}
      </p>
    </div>
  );
}
