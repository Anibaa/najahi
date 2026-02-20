"use client"

import type { Book, Order } from "@/lib/types"
import { TrendingUp, BookOpen, ShoppingBag, DollarSign } from "lucide-react"

interface AdminStatisticsProps {
  books: Book[]
  orders: Order[]
}

export function AdminStatistics({ books, orders }: AdminStatisticsProps) {
  const totalBooks = books.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
  const inStock = books.filter((b) => b.status === "En stock").length
  const outOfStock = books.filter((b) => b.status === "Hors stock").length

  const stats = [
    { label: "Livres Totaux", value: totalBooks, icon: BookOpen, color: "text-blue-500" },
    { label: "Commandes", value: totalOrders, icon: ShoppingBag, color: "text-green-500" },
    {
      label: "Chiffre d'affaires",
      value: `${totalRevenue.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT`, // Format to handle large numbers better
      icon: DollarSign,
      color: "text-amber-500",
    },
    { label: "En Stock", value: inStock, icon: TrendingUp, color: "text-emerald-500" },
  ]

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-3xl font-bold text-foreground mb-8">Tableau de Bord Statistiques</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-soft-hover transition-all duration-200"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-sm font-medium truncate">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-2 break-words" title={String(stat.value)}>
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-10 h-10 ${stat.color} opacity-20 flex-shrink-0 ml-2`} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books Status Overview */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">État des Livres</h3>
          <div className="space-y-3">
            {[
              { status: "En stock", count: inStock, color: "bg-green-500" },
              { status: "Hors stock", count: outOfStock, color: "bg-red-500" },
              {
                status: "En préparation",
                count: books.filter((b) => b.status === "Préparation").length,
                color: "bg-yellow-500",
              },
              {
                status: "En livraison",
                count: books.filter((b) => b.status === "Livraison").length,
                color: "bg-blue-500",
              },
              { status: "Livré", count: books.filter((b) => b.status === "Livré").length, color: "bg-gray-500" },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-muted-foreground">{item.status}</span>
                </div>
                <span className="font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Status Overview */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">État des Commandes</h3>
          <div className="space-y-3">
            {[
              {
                status: "Préparation",
                count: orders.filter((o) => o.status === "Préparation").length,
                color: "bg-yellow-500",
              },
              {
                status: "Livraison",
                count: orders.filter((o) => o.status === "Livraison").length,
                color: "bg-blue-500",
              },
              { status: "Livré", count: orders.filter((o) => o.status === "Livré").length, color: "bg-green-500" },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-muted-foreground">{item.status}</span>
                </div>
                <span className="font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
