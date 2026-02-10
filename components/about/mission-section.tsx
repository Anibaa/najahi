"use client"

import { motion } from "framer-motion"

export function MissionSection() {
  return (
    <section className="px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Notre Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Notre mission est de rendre l'accès aux livres scolaires simple, rapide et abordable pour
            tous les étudiants en Tunisie.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
