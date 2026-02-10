"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import type { Category, Level, Language } from "@/lib/types"

export function PartnerForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookTitle: "",
    category: "",
    level: "",
    language: "",
    description: "",
  })

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Le nom est requis"
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Un email valide est requis"
    if (!formData.phone.match(/^\+?[0-9\s\-()]{7,}$/)) newErrors.phone = "Un numéro de téléphone valide est requis"
    if (!formData.bookTitle.trim()) newErrors.bookTitle = "Le titre du livre est requis"
    if (!formData.category) newErrors.category = "La catégorie est requise"
    if (!formData.level) newErrors.level = "Le niveau est requis"
    if (!formData.language) newErrors.language = "La langue est requise"
    if (!formData.description.trim() || formData.description.length < 30)
      newErrors.description = "La description doit contenir au moins 30 caractères"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setStatus("loading")

    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus("success")
        setFormData({
          name: "",
          email: "",
          phone: "",
          bookTitle: "",
          category: "",
          level: "",
          language: "",
          description: "",
        })
        setTimeout(() => setStatus("idle"), 5000)
      } else {
        throw new Error("Failed")
      }
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-scaleIn">
      {/* Success Message */}
      {status === "success" && (
        <div className="flex gap-3 p-4 md:p-5 bg-accent/10 border border-accent rounded-lg md:rounded-xl animate-slideInLeft">
          <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-card-foreground text-sm md:text-base">Votre demande a été reçue avec succès</p>
            <p className="text-xs md:text-sm text-muted-foreground">Notre équipe vous contactera très bientôt</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === "error" && (
        <div className="flex gap-3 p-4 md:p-5 bg-destructive/10 border border-destructive rounded-lg md:rounded-xl animate-slideInLeft">
          <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-card-foreground text-sm md:text-base">Une erreur s'est produite</p>
            <p className="text-xs md:text-sm text-muted-foreground">Veuillez réessayer</p>
          </div>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
          Nom Complet
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.name ? "border-destructive bg-destructive/5" : "border-border bg-background hover:border-primary/30"
            }`}
          placeholder="Jean Dupont"
        />
        {errors.name && <p className="text-xs md:text-sm text-destructive mt-2 font-medium">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.email ? "border-destructive bg-destructive/5" : "border-border bg-background hover:border-primary/30"
            }`}
          placeholder="votre@email.com"
        />
        {errors.email && <p className="text-xs md:text-sm text-destructive mt-2 font-medium">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.phone ? "border-destructive bg-destructive/5" : "border-border bg-background hover:border-primary/30"
            }`}
          placeholder="+216 92 123 456"
        />
        {errors.phone && <p className="text-xs md:text-sm text-destructive mt-2 font-medium">{errors.phone}</p>}
      </div>

      {/* Book Title */}
      <div>
        <label htmlFor="bookTitle" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
          Titre du Livre
        </label>
        <input
          type="text"
          id="bookTitle"
          name="bookTitle"
          value={formData.bookTitle}
          onChange={handleChange}
          className={`w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.bookTitle
            ? "border-destructive bg-destructive/5"
            : "border-border bg-background hover:border-primary/30"
            }`}
          placeholder="Titre du livre"
        />
        {errors.bookTitle && <p className="text-xs md:text-sm text-destructive mt-2 font-medium">{errors.bookTitle}</p>}
      </div>

      {/* Category, Level, Language */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
            Catégorie
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border border-border bg-background hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          >
            <option value="" disabled>Choisir une catégorie</option>
            <option value="writing">Writing</option>
            <option value="cours">Cours</option>
            <option value="devoirs">Devoirs</option>
            <option value="histoire">Histoire</option>
          </select>
        </div>

        <div>
          <label htmlFor="level" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
            Niveau
          </label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border border-border bg-background hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          >
            <option value="" disabled>Choisir un niveau</option>
            <option value="college">Collège</option>
            <option value="lycee">Lycée</option>
            <option value="preparatoire">Préparatoire</option>
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
            Langue
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border border-border bg-background hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          >
            <option value="" disabled>Choisir une langue</option>
            <option value="ar">Arabe</option>
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm md:text-base font-semibold text-card-foreground mb-2">
          Description du Livre
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className={`w-full px-4 py-3 md:py-3.5 rounded-lg md:rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${errors.description
            ? "border-destructive bg-destructive/5"
            : "border-border bg-background hover:border-primary/30"
            }`}
          placeholder="Décrivez le contenu du livre en détail..."
        />
        <div className="flex justify-between items-center mt-2">
          {errors.description && (
            <p className="text-xs md:text-sm text-destructive font-medium">{errors.description}</p>
          )}
          <p className="text-xs md:text-sm text-muted-foreground ms-auto">{formData.description.length}/500</p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-6 py-3 md:py-4 bg-primary hover:bg-primary/90 hover:shadow-soft-hover hover:scale-105 active:scale-95 disabled:bg-primary/50 disabled:cursor-not-allowed disabled:scale-100 text-white font-bold rounded-lg md:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base md:text-lg"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          "Envoyer Votre Demande"
        )}
      </button>

      <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
        Votre demande sera examinée par notre équipe et les détails vérifiés
      </p>
    </form>
  )
}
