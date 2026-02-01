"use client";
import { motion } from "framer-motion";

export default function FancyHeroClient() {
  return (
    <main className="min-h-dvh grid place-items-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          Tu producto, <span className="underline decoration-wavy">más cerca</span>
        </h1>
      </motion.div>
    </main>
  );
}