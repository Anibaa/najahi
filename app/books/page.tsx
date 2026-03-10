import { Suspense } from "react"
import type { Metadata } from "next"
import { getBooks } from "@/lib/api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FilterSidebar } from "@/components/books/filter-sidebar"
import { BooksGrid } from "@/components/books/books-grid"
import { Pagination } from "@/components/books/pagination"
import { SearchResultsSummary } from "@/components/books/search-results-summary"

const ITEMS_PER_PAGE = 12

// Ensure this page is not statically cached
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const books = await getBooks()
  const firstBookImage = books[0]?.image || "/placeholder.jpg"

  return {
    title: "Livres - Tunitest",
    description: "Parcourez notre collection complète de livres éducatifs tunisiens",
    openGraph: {
      type: "website",
      locale: "fr_TN",
      url: "https://Tunitest.com/books",
      title: "Livres - Tunitest",
      description: "Parcourez notre collection complète de livres éducatifs tunisiens",
      images: [
        {
          url: firstBookImage,
          width: 300,
          height: 400,
          alt: "Livres Éducatifs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Livres - Tunitest",
      description: "Parcourez notre collection complète de livres éducatifs tunisiens",
      images: [firstBookImage],
    },
  }
}

interface BooksPageProps {
  searchParams: Promise<{
    category?: string
    level?: string
    language?: string
    search?: string
    page?: string
  }>
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const params = await searchParams
  const category = params.category
  const level = params.level
  const language = params.language
  const search = params.search
  const page = Number.parseInt(params.page || "1")

  const allBooks = await getBooks({
    category: category as any,
    level: level as any,
    language: language as any,
    search: search,
  })

  const totalItems = allBooks.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedBooks = allBooks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted/40">
        {/* Page Header */}
        <section className="bg-linear-to-r from-primary to-primary/80 text-white py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h1 className="text-4xl md:text-5xl font-bold animate-slideInLeft">Parcourir les Livres</h1>
            <p className="text-white/85 mt-2 md:mt-3 text-sm md:text-base">
              Découvrez notre vaste collection de livres éducatifs
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            {/* Results Summary */}
            <div className="mb-6 md:mb-8">
              <SearchResultsSummary 
                totalItems={totalItems}
                currentPage={page}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar - More prominent on mobile */}
              <div className="lg:sticky lg:top-20 lg:h-fit">
                <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement des filtres...</div>}>
                  <FilterSidebar />
                </Suspense>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement des livres...</div>}>
                  <BooksGrid books={paginatedBooks} searchQuery={search} />
                  <Pagination currentPage={page} totalPages={totalPages} totalItems={totalItems} />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Floating Search for Mobile */}
      
      <Footer />
    </>
  )
}
