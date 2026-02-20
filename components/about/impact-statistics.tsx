"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let current = 0
    const increment = target / 30
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, 50)

    return () => clearInterval(interval)
  }, [target])

  return <span>{count.toLocaleString("fr-TN")}</span>
}

const stats = [
  { label: "Étudiants servis", value: 500 },
  { label: "Livres disponibles", value: 9 },
  { label: "Partenaires actifs", value: 5 },
]

export function ImpactStatistics() {
  return (
    <section className="px-4 md:px-8 py-12 md:py-20 bg-primary/10">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center"
        >
          Notre Impact
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center space-y-2"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary">
                <AnimatedCounter target={stat.value} />
                {stat.value >= 1000 && "+"}
              </div>
              <p className="text-muted-foreground text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
