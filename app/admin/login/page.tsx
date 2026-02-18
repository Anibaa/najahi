"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { validateAdminCredentials, setAdminSession } from "@/lib/admin-auth"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (validateAdminCredentials(username, password)) {
      setAdminSession(username)
      router.push("/admin")
    } else {
      setError("Identifiants invalides")
    }

    setIsLoading(false)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-soft p-8 animate-fadeInUp">
            <h1 className="text-2xl font-bold text-foreground mb-6 text-center">Connexion Admin</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            {/* <p className="text-center text-xs text-muted-foreground mt-4">Démo: admin / admin123</p> */}

            <div className="mt-6 pt-6 border-t border-border">
              <Link href="/" className="text-center block text-sm text-primary hover:text-primary/80 transition-colors">
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
