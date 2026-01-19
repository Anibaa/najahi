"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Edit2, Trash2, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Book } from "@/lib/types"

interface BooksManagementProps {
  books: Book[]
}

const statusColors: Record<string, string> = {
  "En stock": "text-green-600",
  "Hors stock": "text-red-600",
  Préparation: "text-yellow-600",
  Livraison: "text-blue-600",
  Livré: "text-gray-600",
}

export function BooksManagement({ books }: BooksManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState<Partial<Book>>({
    images: [],
  })
  const [imageInput, setImageInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData(book)
    setImageInput("")
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous certain de vouloir supprimer ce livre?")) {
      try {
        const res = await fetch(`/api/books/${id}`, {
          method: "DELETE",
        })

        if (!res.ok) throw new Error("Failed to delete")

        toast({
          title: "Succès",
          description: "Livre supprimé avec succès",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le livre",
          variant: "destructive",
        })
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) : value,
    }))
  }

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), imageInput.trim()],
        image: imageInput.trim(), // Set primary image
      }))
      setImageInput("")
      toast({
        title: "Image ajoutée",
        description: "L'image a été ajoutée à la galerie",
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images?.filter((_, i) => i !== index) || []
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : "", // Sync primary image
      }
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'descriptionImage' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()

      if (field === 'descriptionImage') {
        setFormData(prev => ({ ...prev, descriptionImage: data.url }))
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), data.url],
          image: prev.image || data.url // Set primary if empty
        }))
      }

      toast({
        title: "Succès",
        description: "Image téléchargée avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec du téléchargement",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset input value to allow selecting same file again
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Ensure at least one image
    if (!formData.images || formData.images.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins une image",
      })
      setIsLoading(false)
      return
    }

    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books"
      const method = editingBook ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Correction failed")

      toast({
        title: "Succès",
        description: editingBook
          ? `Livre "${formData.title}" modifié avec succès`
          : `Livre "${formData.title}" ajouté avec succès`,
      })

      router.refresh()
      setIsModalOpen(false)
      setFormData({ images: [] })
      setEditingBook(null)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }

  }

  return (
    <div className="animate-fadeInUp">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestion des Livres</h2>
          <p className="text-muted-foreground text-sm mt-1">Gérez votre catalogue de livres</p>
        </div>
        <button
          onClick={() => {
            setEditingBook(null)
            setFormData({})
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-soft-hover hover:scale-105 active:scale-95 w-full md:w-auto justify-center md:justify-start"
        >
          <Plus className="w-5 h-5" />
          Ajouter un Livre
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Livre</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground hidden sm:table-cell">Auteur</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Prix</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground">Statut</th>
              <th className="px-6 py-4 text-left font-semibold text-foreground hidden md:table-cell">Note</th>
              <th className="px-6 py-4 text-center font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {books.map((book, idx) => (
              <tr
                key={book.id}
                className="hover:bg-muted/50 transition-colors animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <td className="px-6 py-4 font-semibold text-foreground line-clamp-1">{book.title}</td>
                <td className="px-6 py-4 text-muted-foreground hidden sm:table-cell text-sm">{book.author}</td>
                <td className="px-6 py-4 font-bold text-primary">{book.price} DT</td>
                <td className="px-6 py-4">
                  <span className={`text - sm font - semibold ${statusColors[book.status]}`}>{book.status}</span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(book)}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-all hover:scale-110 active:scale-95"
                      aria-label="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-all hover:scale-110 active:scale-95"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeInUp">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-lg border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                {editingBook ? "Modifier le Livre" : "Ajouter un Nouveau Livre"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setFormData({})
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Titre</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Titre du livre"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Auteur</label>
                  <input
                    type="text"
                    name="author"
                    placeholder="Nom de l'auteur"
                    value={formData.author || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Prix (DT)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Prix"
                    value={formData.price || ""}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Catégorie</label>
                  <select
                    name="category"
                    value={formData.category || "primary"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="primary">Primaire</option>
                    <option value="secondary">Secondaire</option>
                    <option value="university">Université</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Niveau</label>
                  <select
                    name="level"
                    value={formData.level || "primary"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="primary">Primaire</option>
                    <option value="secondary">Secondaire</option>
                    <option value="university">Université</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Image Descriptif (URL ou Upload)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="descriptionImage"
                      placeholder="URL de l'image (optionnel)"
                      value={formData.descriptionImage || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'descriptionImage')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <button type="button" className="px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg border border-border h-full flex items-center justify-center min-w-[3rem]">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {formData.descriptionImage && (
                    <div className="mt-3 relative w-full sm:w-1/2 md:w-1/3 group animate-fadeInUp">
                      <img
                        src={formData.descriptionImage}
                        alt="Aperçu description"
                        className="w-full aspect-video object-cover rounded-lg border border-border bg-muted"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, descriptionImage: "" }))}
                        className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white p-1.5 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                        title="Supprimer l'image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Langue</label>
                  <select
                    name="language"
                    value={formData.language || "fr"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="ar">Arabe</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Statut</label>
                  <select
                    name="status"
                    value={formData.status || "En stock"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option>En stock</option>
                    <option>Hors stock</option>
                    <option>Préparation</option>
                    <option>Livraison</option>
                    <option>Livré</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Description du livre..."
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              {/* Image Gallery Management */}
              <div className="border border-primary/20 rounded-lg p-5 bg-primary/5">
                <label className="block text-sm font-semibold text-foreground mb-4">Galerie d'Images</label>

                {/* Add Image Input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Ajouter une URL d'image..."
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddImage()
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'gallery')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <button type="button" className="px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-lg border border-border h-full flex items-center justify-center min-w-[3rem] mr-2" title="Upload">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Thumbnails */}
                {formData.images && formData.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Galerie ${index + 1}`}
                          className="w-full aspect-[3/4] object-cover rounded-lg border-2 border-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-destructive hover:bg-destructive/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                            Principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Aucune image ajoutée</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  {/* Additional fields can be added here */}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-soft-hover hover:scale-105 active:scale-95"
                >
                  {isLoading ? "Traitement..." : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setFormData({})
                  }}
                  className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-all duration-200 font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div >
        </div >
      )}
    </div>
  )
}
