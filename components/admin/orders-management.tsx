"use client"

import { useState } from "react"
import { Eye, Edit2 } from "lucide-react"
import type { Order } from "@/lib/types"
import { useEffect } from "react"

interface OrdersManagementProps {
  orders: Order[]
}

const statusColors: Record<string, string> = {
  Préparation: "bg-yellow-100 text-yellow-800",
  Livraison: "bg-blue-100 text-blue-800",
  Livré: "bg-green-100 text-green-800",
}

export function OrdersManagement({ orders }: OrdersManagementProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<Order["status"]>("Préparation")
  const [books, setBooks] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooks(data.data)
        }
      })
      .catch((err) => console.error("Failed to load books", err))
  }, [])

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setEditingStatus(order.status)
    setIsDetailModalOpen(true)
  }

  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order)
    setEditingStatus(order.status)
    setIsEditModalOpen(true)
  }

  const handleSaveStatus = async () => {
    if (!selectedOrder) return
    try {
      await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editingStatus }),
      })
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  return (
    <div className="animate-fadeInUp">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Gestion des Commandes</h2>
        <p className="text-muted-foreground text-sm mt-1">Gérez et suivez les commandes des clients</p>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-foreground">N° Commande</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Client</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground hidden md:table-cell">Email</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Montant</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Statut</th>
              <th className="px-6 py-4 text-center font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order, idx) => (
              <tr
                key={order.id}
                className="hover:bg-muted/50 transition-colors animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <td className="px-6 py-4 font-mono text-foreground">#{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-foreground font-medium">{order.customerName}</td>
                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-sm">{order.customerEmail}</td>
                <td className="px-6 py-4 font-bold text-primary">{order.totalPrice.toFixed(2)} TND</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="p-2 hover:bg-primary/10 text-primary rounded transition-all hover:scale-110"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditStatus(order)}
                      className="p-2 hover:bg-accent/10 text-accent rounded transition-all hover:scale-110"
                      title="Modifier statut"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-foreground mb-6">Détails de la Commande</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">N° Commande</p>
                  <p className="font-mono font-bold">#{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString("fr-TN")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-semibold">{selectedOrder.customerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-semibold">{selectedOrder.address}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Livres</p>
                <div className="space-y-2">
                  {selectedOrder.bookIds.map((bookId, idx) => (
                    <p key={idx} className="text-sm font-medium">
                      {books.find((b) => b.id === bookId)?.title || `Livre #${bookId}`} x{selectedOrder.quantities[idx]}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="flex justify-between font-bold text-lg text-primary">
                  <span>Montant total:</span>
                  <span>{selectedOrder.totalPrice.toFixed(2)} TND</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-foreground mb-6">Modifier le Statut</h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-foreground mb-2">Nouveau Statut</label>
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value as Order["status"])}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Préparation">Préparation</option>
                <option value="Livraison">Livraison</option>
                <option value="Livré">Livré</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveStatus}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-semibold"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
