import { getSliders, getBooks } from "@/lib/api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSlider } from "@/components/home/hero-slider"
import { CategorySection } from "@/components/home/category-section"
import { FeaturedBooks } from "@/components/home/featured-books"
import { PromotionBanner } from "@/components/home/promotion-banner"
import { Testimonials } from "@/components/home/testimonials"
import { PersonalizedGreeting } from "@/components/home/personalized-greeting"
import { RecentlyViewed } from "@/components/home/recently-viewed"
import { WhatsAppButton } from "@/components/home/whatsapp-button"
import { TrustedBy } from "@/components/home/trusted-by"

export const metadata = {
  title: "Tunitest - Plateforme de Livres Éducatifs Tunisienne",
  description:
    "Découvrez les meilleurs livres éducatifs pour les étudiants tunisiens à tous les niveaux scolaires. Accédez à des milliers de titres, de la primaire à l'université.",
}

// Ensure this page is not statically cached
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const sliders = await getSliders()
  const books = await getBooks()

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Slider */}
        <section className="px-4 md:px-8 py-6 md:py-8 animate-fadeInUp">
          <div className="max-w-6xl mx-auto">
            <HeroSlider items={sliders} />
          </div>
        </section>

        {/* Personalized Greeting */}
        <section className="px-4 md:px-8 py-4 md:py-6">
          <div className="max-w-6xl mx-auto">
            <PersonalizedGreeting />
          </div>
        </section>

        {/* Categories */}
        <CategorySection />

        {/* Trusted By */}
        <TrustedBy />

        {/* Featured Books */}
        <FeaturedBooks books={books.slice(0, 8)} />

        {/* Recently Viewed */}
        <RecentlyViewed />

        {/* Promotion Banner */}
        <PromotionBanner />

        {/* Testimonials */}
        <Testimonials />

        {/* WhatsApp Floating Button */}
        <WhatsAppButton />
      </main>
      <Footer />
    </>
  )
}
