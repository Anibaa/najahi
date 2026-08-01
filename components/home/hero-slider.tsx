"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { SliderItem } from "@/lib/types"

interface HeroSliderProps {
  items: SliderItem[]
}

export function HeroSlider({ items }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (!isAutoPlay || items.length < 2) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setCurrentIndex((prev) => (prev + 1) % items.length)
      setTimeout(() => setIsTransitioning(false), 300)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlay, items.length])

  const goToPrevious = () => {
    if (!items.length) return
    setIsAutoPlay(false)
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToNext = () => {
    if (!items.length) return
    setIsAutoPlay(false)
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % items.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  if (!items.length) return null

  const currentItem = items[currentIndex]

  return (
    <div
      className="relative w-full bg-primary overflow-hidden rounded-lg md:rounded-xl shadow-soft-hover"
      style={{ aspectRatio: "16/6" }}
    >
      {/* Slider Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {currentItem.image && (
          <img
            src={currentItem.image || "/placeholder.svg"}
            alt={currentItem.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isTransitioning ? "scale-105 opacity-0" : "scale-100 opacity-100"
            }`}
          />
        )}
        <div className="absolute inset-0"></div>
      </div>



      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm"
        aria-label="Diapositive précédente"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm"
        aria-label="Diapositive suivante"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlay(false)
              setIsTransitioning(true)
              setCurrentIndex(index)
              setTimeout(() => setIsTransitioning(false), 300)
            }}
            className={`rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-6 h-2" : "bg-white/50 hover:bg-white/75 w-2 h-2"
            }`}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
