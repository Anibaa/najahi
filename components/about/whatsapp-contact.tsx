"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

export function WhatsAppContact() {
  const whatsappLink = "https://wa.me/21697240542?text=Bonjour%20Tunitest,%20j'aimerais%20avoir%20plus%20d'informations"

  return (
    <section className="px-4 md:px-8 py-12 md:py-20 bg-muted/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto text-center space-y-6"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Contactez-nous facilement</h2>
        <p className="text-lg text-muted-foreground">Une question ? Notre équipe Tunitest est disponible sur WhatsApp.</p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors shadow-soft hover:shadow-soft-hover"
        >
          <MessageCircle className="w-5 h-5" />
          Contacter Tunitest sur WhatsApp
        </a>
      </motion.div>
    </section>
  )
}
