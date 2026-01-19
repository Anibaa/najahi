import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getBookById, getRelatedBooks } from "@/lib/api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BookDetails } from "@/components/books/book-details"
import { RelatedBooks } from "@/components/books/related-books"
import { BookDescriptionImage } from "@/components/books/book-description-image"
import { ViewTracker } from "@/components/common/view-tracker"

interface BookPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params
  const book = await getBookById(id)

  if (!book) {
    return {
      title: "Livre non trouvé",
    }
  }

  return {
    title: `${book.title} - Tunitest`,
    description: book.description,
    keywords: [book.title, book.author, book.category, book.level, "livre éducatif", "tunisie"],
    openGraph: {
      type: "website",
      locale: "fr_TN",
      url: `https://Tunitest.com/books/${book.id}`,
      title: book.title,
      description: book.description,
      images: [
        {
          url: book.image,
          width: 300,
          height: 400,
          alt: book.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description: book.description,
      images: [book.image],
    },
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params
  const book = await getBookById(id)

  if (!book) {
    notFound()
  }

  const relatedBooks = await getRelatedBooks(id)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted/30">
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <BookDetails book={book} />
            <BookDescriptionImage image={book.descriptionImage} alt={book.title} />
            <RelatedBooks books={relatedBooks} />
          </div>
        </section>
      </main>
      <Footer />
      <ViewTracker bookId={id} />
    </>
  )
}
