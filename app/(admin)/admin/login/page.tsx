"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Por ahora, redirigir directamente al dashboard
    // En el futuro, aquí se implementará la autenticación real
    router.push("/admin/dashboard");
  };

  return (
    <div className="relative flex min-h-screen bg-zinc-100 dark:bg-[#050505] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Background Pattern - Dot Matrix */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #71717a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Login Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-black dark:bg-white rounded-xl">
              <Shield className="w-8 h-8 text-white dark:text-black" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              LambdaIDX
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono tracking-wider">
              GESTIÓN CENTRAL
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Acceso Administrativo
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ingrese sus credenciales para acceder al panel de gestión
              </p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="admin@lambdaidx.com"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mr-2 border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-950"
                  />
                  Recordar sesión
                </label>
                <Link
                  href="#"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  ¿Olvidó su contraseña?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200"
              >
                <Lock className="w-4 h-4" />
                Ingresar al Sistema
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            {/* Notice */}
            <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                <span className="font-semibold">Nota:</span> Esta es una página de login
                temporal.
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
          >
            © 2026 LambdaIDX — Knowledge Infrastructure
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
