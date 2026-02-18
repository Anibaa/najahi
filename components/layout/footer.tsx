import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Tunitest</h3>
            <p className="text-sm opacity-80">Plateforme éducative intégrée pour les étudiants tunisiens</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Liens Rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/books" className="hover:opacity-80 transition-opacity">
                  Livres
                </Link>
              </li>
              <li>
                <Link href="/partner" className="hover:opacity-80 transition-opacity">
                  Devenir Partenaire
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:opacity-80 transition-opacity">
                  Gestion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Politiques</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  Conditions d'Utilisation
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Suivez-Nous</h4>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/share/1HuMXLLhdf/?mibextid=wwXIfr" className="hover:opacity-80 transition-opacity" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <p className="text-center text-sm opacity-80">
            © 2026 Tunitest. Tous droits réservés. — Developed by Yassine Aniba
          </p>
        </div>

      </div>
    </footer>
  )
}
