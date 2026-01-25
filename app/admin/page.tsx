import { Suspense } from "react"
import { getBooks, getOrders, getSliders, getPartners } from "@/lib/api"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AdminNav } from "@/components/admin/admin-nav"
import { AdminStatistics } from "@/components/admin/admin-statistics"
import { BooksManagement } from "@/components/admin/books-management"
import { OrdersManagement } from "@/components/admin/orders-management"
import { SlidersManagement } from "@/components/admin/sliders-management"
import { PartnersManagement } from "@/components/admin/partners-management"
import { AdminGuard } from "@/lib/admin-guard"

interface AdminPageProps {
  searchParams: Promise<{
    tab?: string
  }>
}

export const metadata = {
  title: "Tableau de Bord - Tunitest",
  description: "Gérez les livres, les commandes et les promotions",
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams
  const tab = (params.tab || "books") as "books" | "orders" | "sliders" | "partners" | "statistics"

  const [books, orders, sliders, partners] = await Promise.all([getBooks(), getOrders(), getSliders(), getPartners()])

  return (
    <AdminGuard>
      <Header />
      <AdminNav activeTab={tab} />

      <main className="min-h-screen bg-muted/40">
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            {tab === "statistics" && (
              <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement des statistiques...</div>}>
                <AdminStatistics books={books} orders={orders} />
              </Suspense>
            )}

            {tab === "books" && (
              <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement des livres...</div>}>
                <BooksManagement books={books} />
              </Suspense>
            )}

            {tab === "orders" && (
              <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement des commandes...</div>}>
                <OrdersManagement orders={orders} />
              </Suspense>
            )}

            {tab === "sliders" && (
              <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement des promotions...</div>}>
                <SlidersManagement sliders={sliders} />
              </Suspense>
            )}

            {tab === "partners" && (
              <Suspense fallback={<div className="text-muted-foreground text-sm">Chargement des partenaires...</div>}>
                <PartnersManagement partners={partners} />
              </Suspense>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </AdminGuard>
  )
}
