import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import packageJson from "@/package.json";

const footerGroups = [
  {
    title: "Explorar",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Introducción", href: "/index/introduccion" },
    ],
  },
  {
    title: "Sistema",
    links: [{ label: "Gestión central", href: "/login" }],
  },
] as const;

export function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-zinc-200 px-6 py-12 dark:border-zinc-900 md:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 md:flex-row">
        <div>
          <Link
            href="/"
            aria-label="Ir al inicio de LambdaIDX"
            className="inline-block transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
          >
            <Logo size={40} className="mb-6" />
          </Link>
          <p className="max-w-xs text-sm italic leading-relaxed text-zinc-600 dark:text-zinc-500">
            &quot;Porque la información sin estructura es solo ruido estático.&quot;
          </p>
        </div>

        <nav aria-label="Enlaces del pie de página" className="grid grid-cols-2 gap-10 sm:gap-16">
          {footerGroups.map((group) => (
            <FooterLinkGroup key={group.title} {...group} />
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-zinc-200 pt-8 font-mono text-[10px] uppercase tracking-widest text-zinc-600 dark:border-zinc-900 sm:flex-row sm:items-center sm:justify-between md:mt-20">
        <span>© {new Date().getFullYear()} LambdaIDX</span>
        <span>v{packageJson.version}</span>
      </div>
    </footer>
  );
}

type FooterLinkGroupProps = (typeof footerGroups)[number];

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700 dark:text-zinc-300">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm uppercase tracking-tighter text-zinc-600 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground dark:text-zinc-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
