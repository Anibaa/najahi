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
    descriptionImages: [],
  })
  const [galleryImageInput, setGalleryImageInput] = useState("")
  const [descriptionImageInput, setDescriptionImageInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [isUploadingDescription, setIsUploadingDescription] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData(book)
    setGalleryImageInput("")
    setDescriptionImageInput("")
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

        // Refresh the current page
        router.refresh()

        // Also trigger a refresh of the home page cache
        fetch('/', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }).catch(() => { }) // Silent fail if this doesn't work

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
      [name]: name === "price" || name === "promoPrice" ? (value === "" ? undefined : Number.parseFloat(value)) : value,
    }))
  }

  const handleAddGalleryImage = () => {
    if (galleryImageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), galleryImageInput.trim()],
        image: prev.image || galleryImageInput.trim(), // Set primary image if empty
      }))
      setGalleryImageInput("")
      toast({
        title: "Image ajoutée",
        description: "L'image a été ajoutée à la galerie",
      })
    }
  }

  const handleAddDescriptionImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      descriptionImages: [...(prev.descriptionImages || []), imageUrl],
    }))
    toast({
      title: "Image descriptive ajoutée",
      description: "L'image a été ajoutée aux images descriptives",
    })
  }

  const handleAddDescriptionImageFromInput = () => {
    if (descriptionImageInput.trim()) {
      handleAddDescriptionImage(descriptionImageInput.trim())
      setDescriptionImageInput("")
    }
  }

  const handleRemoveImage = (index: number) => {
    const imageToRemove = formData.images?.[index]
    setFormData((prev) => {
      const newImages = prev.images?.filter((_, i) => i !== index) || []
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : "", // Sync primary image
      }
    })

    // Delete from Vercel Blob if it's a blob URL
    if (imageToRemove && imageToRemove.includes('blob.vercel-storage.com')) {
      deleteFromBlob(imageToRemove)
    }
  }

  const handleRemoveDescriptionImage = (index: number) => {
    const imageToRemove = formData.descriptionImages?.[index]
    setFormData((prev) => ({
      ...prev,
      descriptionImages: prev.descriptionImages?.filter((_, i) => i !== index) || [],
    }))

    // Delete from Vercel Blob if it's a blob URL
    if (imageToRemove && imageToRemove.includes('blob.vercel-storage.com')) {
      deleteFromBlob(imageToRemove)
    }
  }

  const deleteFromBlob = async (url: string) => {
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Failed to delete from blob:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'descriptionImages' | 'gallery') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (field === 'gallery') {
      setIsUploadingGallery(true)
    } else {
      setIsUploadingDescription(true)
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("uploadType", field) // Add upload type for unique naming

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()

      if (field === 'descriptionImages') {
        handleAddDescriptionImage(data.url)
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), data.url],
          image: prev.image || data.url // Set primary if empty
        }))
        toast({
          title: "Succès",
          description: "Image ajoutée à la galerie",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec du téléchargement",
        variant: "destructive",
      })
    } finally {
      if (field === 'gallery') {
        setIsUploadingGallery(false)
      } else {
        setIsUploadingDescription(false)
      }
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
        description: "Veuillez ajouter au moins une image à la galerie",
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

      // Refresh the current page and clear cache
      router.refresh()

      // Also trigger a refresh of the home page cache
      fetch('/', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }).catch(() => { }) // Silent fail if this doesn't work

      setIsModalOpen(false)
      setFormData({ images: [], descriptionImages: [] })
      setGalleryImageInput("")
      setDescriptionImageInput("")
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
            setFormData({ images: [], descriptionImages: [] })
            setGalleryImageInput("")
            setDescriptionImageInput("")
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
                <td className="px-6 py-4 font-bold text-primary">
                  {book.promoPrice ? (
                    <div className="flex flex-col">
                      <span className="text-red-500 font-bold">{book.promoPrice} DT</span>
                      <span className="text-muted-foreground line-through text-xs">{book.price} DT</span>
                    </div>
                  ) : (
                    <span>{book.price} DT</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`text - sm font - semibold ${statusColors[book.status]}`}>{book.status}</span>
                </td>

                <td className="px-6 py-4 text-muted-foreground hidden md:table-cell text-sm">{book.rating || 'N/A'}</td>
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
                  setFormData({ images: [], descriptionImages: [] })
                  setGalleryImageInput("")
                  setDescriptionImageInput("")
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
                  <label className="block text-sm font-semibold text-foreground mb-2">Prix Promo (Optionnel)</label>
                  <input
                    type="number"
                    name="promoPrice"
                    placeholder="Prix Promo"
                    value={formData.promoPrice || ""}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Catégorie</label>
                  <select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="" disabled>Choisir une catégorie</option>
                    <option value="writing">Writing</option>
                    <option value="cours">Cours</option>
                    <option value="devoirs">Devoirs</option>
                    <option value="Contes">Contes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Niveau</label>
                  <select
                    name="level"
                    value={formData.level || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="" disabled>Choisir un niveau</option>
                    <option value="college">Collège</option>
                    <option value="lycee">Lycée</option>
                    <option value="primaire">Primaire</option>
                  </select>
                </div>


              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Langue</label>
                  <select
                    name="language"
                    value={formData.language || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="" disabled>Choisir une langue</option>
                    <option value="ar">Arabe</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Statut</label>
                  <select
                    name="status"
                    value={formData.status || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="" disabled>Choisir un statut</option>
                    <option value="En stock">En stock</option>
                    <option value="Hors stock">Hors stock</option>
                    <option value="Préparation">Préparation</option>
                    <option value="Livraison">Livraison</option>
                    <option value="Livré">Livré</option>
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
                    value={galleryImageInput}
                    onChange={(e) => setGalleryImageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddGalleryImage()
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
                      disabled={isUploadingGallery}
                    />
                    <button
                      type="button"
                      className={`px-4 py-3 ${isUploadingGallery ? 'bg-gray-400' : 'bg-secondary hover:bg-secondary/80'} rounded-lg border border-border h-full flex items-center justify-center min-w-[3rem] mr-2`}
                      title="Upload"
                      disabled={isUploadingGallery}
                    >
                      {isUploadingGallery ? (
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
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

              <div className=" gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Images Descriptives</label>
                  <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                    {/* Add Description Image Input */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Ajouter une URL d'image descriptive..."
                        value={descriptionImageInput}
                        onChange={(e) => setDescriptionImageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddDescriptionImageFromInput()
                          }
                        }}
                        className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'descriptionImages')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploadingDescription}
                        />
                        <button
                          type="button"
                          className={`px-4 py-3 ${isUploadingDescription ? 'bg-gray-400' : 'bg-secondary hover:bg-secondary/80'} rounded-lg border border-border h-full flex items-center justify-center min-w-[3rem]`}
                          title="Upload"
                          disabled={isUploadingDescription}
                        >
                          {isUploadingDescription ? (
                            <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddDescriptionImageFromInput}
                        className="px-4 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Description Image Thumbnails */}
                    {formData.descriptionImages && formData.descriptionImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {formData.descriptionImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img || "/placeholder.svg"}
                              alt={`Description ${index + 1}`}
                              className="w-full aspect-[3/4] object-cover rounded-lg border-2 border-primary/30"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveDescriptionImage(index)}
                              className="absolute top-1 right-1 bg-destructive hover:bg-destructive/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  images: [...(prev.images || []), img],
                                  image: prev.image || img
                                }))
                                toast({
                                  title: "Image copiée",
                                  description: "L'image a été ajoutée à la galerie",
                                })
                              }}
                              className="absolute bottom-1 right-1 bg-primary hover:bg-primary/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                              title="Copier vers la galerie"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Aucune image descriptive ajoutée</p>
                    )}
                  </div>
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
                    setFormData({ images: [], descriptionImages: [] })
                    setGalleryImageInput("")
                    setDescriptionImageInput("")
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
