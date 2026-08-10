import React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function PublicFooter() {
  return (
    <footer className="relative z-10 px-6 py-20 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size={40} className="mb-6" />
          </Link>
          <p className="text-zinc-500 max-w-xs text-sm leading-relaxed italic">
            &quot;Porque la información sin estructura es solo ruido estático.&quot;
          </p>
        </div>
        <div className="grid grid-cols-2 gap-16">
          <FooterLinkGroup
            title="Arquitectura"
            links={["Nodos", "Registro", "Motor"]}
          />
          <FooterLinkGroup
            title="Protocolo"
            links={["Docs", "Seguridad", "Estándares"]}
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] uppercase font-mono text-zinc-600 tracking-widest">
        <span>© 2026 Lambda IDX</span>
        <span>v1.0.0-alpha</span>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-[10px] font-mono text-zinc-300 uppercase tracking-[0.3em] font-bold">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[rgb(51,65,85)] transition-colors uppercase tracking-tighter">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
