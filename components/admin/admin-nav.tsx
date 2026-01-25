"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, BookOpen, ShoppingCart, Sliders, BarChart3, LogOut, Users } from "lucide-react"
import { clearAdminSession } from "@/lib/admin-auth"

interface AdminNavProps {
  activeTab: "books" | "orders" | "sliders" | "partners" | "statistics"
}

export function AdminNav({ activeTab }: AdminNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const tabs = [
    { id: "statistics", label: "Statistiques", icon: BarChart3 },
    { id: "books", label: "Livres", icon: BookOpen },
    { id: "orders", label: "Commandes", icon: ShoppingCart },
    { id: "sliders", label: "Promotions", icon: Sliders },
    { id: "partners", label: "Partenaires", icon: Users },
  ]

  const handleLogout = () => {
    clearAdminSession()
    router.push("/admin/login")
  }

  return (
    <nav className="sticky top-16 z-30 bg-primary text-white border-b border-primary/20 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-14">
          <div className="font-bold text-base md:text-lg">Tableau de Bord Admin</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Link
                  key={tab.id}
                  href={`/admin?tab=${tab.id}`}
                  className={`flex items-center gap-2 pb-2 text-sm md:text-base transition-all duration-200 hover:scale-105 active:scale-95 ${activeTab === tab.id
                      ? "border-b-2 border-secondary text-white font-semibold"
                      : "text-white/70 hover:text-white"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </Link>
              )
            })}
          </div>

          {/* Right Side - Logout & Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-slideInLeft">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Link
                  key={tab.id}
                  href={`/admin?tab=${tab.id}`}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                      ? "bg-white/20 font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
