"use client"

import { useState } from "react"
import { Eye, Trash2 } from "lucide-react"
import type { Partner } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface PartnersManagementProps {
    partners: Partner[]
}

export function PartnersManagement({ partners: initialPartners }: PartnersManagementProps) {
    const [partners, setPartners] = useState<Partner[]>(initialPartners)
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleViewDetails = (partner: Partner) => {
        setSelectedPartner(partner)
        setIsDetailModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous certain de vouloir supprimer ce partenaire?")) return

        try {
            const res = await fetch(`/api/partners/${id}`, {
                method: "DELETE",
            })

            if (res.ok) {
                setPartners(partners.filter(p => p.id !== id))
                toast({ title: "Succès", description: "Partenaire supprimé avec succès" })
                router.refresh()
            } else {
                toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" })
            }
        } catch (error) {
            console.error("Failed to delete partner:", error)
            toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" })
        }
    }

    return (
        <div className="animate-fadeInUp">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground">Demandes de Partenariat</h2>
                <p className="text-muted-foreground text-sm mt-1">Gérez les demandes de nouveaux partenaires</p>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg bg-white shadow-soft">
                <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border sticky top-0">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-foreground">Nom</th>
                            <th className="px-6 py-4 text-left font-semibold text-foreground">Livre Proposé</th>
                            <th className="px-6 py-4 text-left font-semibold text-foreground hidden md:table-cell">Email</th>
                            <th className="px-6 py-4 text-left font-semibold text-foreground hidden md:table-cell">Téléphone</th>
                            <th className="px-6 py-4 text-left font-semibold text-foreground">Date</th>
                            <th className="px-6 py-4 text-center font-semibold text-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {partners.map((partner, idx) => (
                            <tr
                                key={partner.id}
                                className="hover:bg-muted/50 transition-colors animate-fadeInUp"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <td className="px-6 py-4 font-medium text-foreground">{partner.name}</td>
                                <td className="px-6 py-4 text-foreground">{partner.bookTitle}</td>
                                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-sm">{partner.email}</td>
                                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-sm">{partner.phone}</td>
                                <td className="px-6 py-4 text-muted-foreground text-sm">
                                    {new Date(partner.createdAt).toLocaleDateString("fr-TN")}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleViewDetails(partner)}
                                            className="p-2 hover:bg-primary/10 text-primary rounded transition-all hover:scale-110"
                                            title="Voir détails"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(partner.id)}
                                            className="p-2 hover:bg-destructive/10 text-destructive rounded transition-all hover:scale-110"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {partners.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                    Aucune demande de partenariat pour le moment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {isDetailModalOpen && selectedPartner && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeInUp">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-foreground mb-6">Détails du Partenaire</h3>

                        <div className="space-y-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nom Complet</p>
                                    <p className="font-semibold text-lg">{selectedPartner.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Date de la demande</p>
                                    <p className="font-semibold">{new Date(selectedPartner.createdAt).toLocaleDateString("fr-TN")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-semibold">{selectedPartner.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Téléphone</p>
                                    <p className="font-semibold">{selectedPartner.phone}</p>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h4 className="font-bold text-lg mb-3">Informations sur le Livre</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Titre du Livre</p>
                                        <p className="font-semibold">{selectedPartner.bookTitle}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Catégorie</p>
                                        <p className="font-semibold capitalize">{selectedPartner.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Niveau</p>
                                        <p className="font-semibold capitalize">{selectedPartner.level}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Langue</p>
                                        <p className="font-semibold uppercase">{selectedPartner.language}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                                    <div className="p-4 bg-muted rounded-lg text-sm text-foreground/80 leading-relaxed">
                                        {selectedPartner.description}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsDetailModalOpen(false)}
                            className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-bold"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
