"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X, Search, Loader2, Sparkles, ChevronDown, Filter } from "lucide-react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Category, Level, Language } from "@/lib/types"
import { cn } from "@/lib/utils"

export function FilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Mobile collapsible state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Get current filters - memoized to prevent unnecessary re-renders
  const currentFilters = useMemo(() => ({
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    language: searchParams.get("language") || "",
    search: searchParams.get("search") || ""
  }), [searchParams])

  // Update search query when URL changes
  useEffect(() => {
    setSearchQuery(currentFilters.search)
  }, [currentFilters.search])

  // Optimized search handler with useCallback
  const handleSearch = useCallback((query: string) => {
    setIsSearching(true)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams)

      if (query.trim()) {
        params.set("search", query.trim())
      } else {
        params.delete("search")
      }

      params.delete("page")
      router.push(`/books?${params.toString()}`)
      setIsSearching(false)
    }, 300)
  }, [router, searchParams])

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    handleSearch(value)
  }, [handleSearch])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    handleSearch("")
  }, [handleSearch])

  // Optimized filter change handler
  const handleFilterChange = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)

    // For radio buttons, always set the new value (no toggle)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.delete("page")
    router.push(`/books?${params.toString()}`)
  }, [router, searchParams])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    router.push("/books")
  }, [router])

  // Static filter data with mobile-optimized labels
  const filterData = useMemo(() => ({
    categories: [
      { value: "writing" as Category, label: "Writing", icon: "✍️", shortLabel: "Writing" },
      { value: "cours" as Category, label: "Cours", icon: "📚", shortLabel: "Cours" },
      { value: "devoirs" as Category, label: "Devoirs", icon: "📝", shortLabel: "Devoirs" },
      { value: "Contes" as Category, label: "Contes", icon: "📜", shortLabel: "Contes" },
    ],
    levels: [
      { value: "college" as Level, label: "Collège", icon: "🎒", shortLabel: "Collège" },
      { value: "lycee" as Level, label: "Lycée", icon: "📓", shortLabel: "Lycée" },
      { value: "primaire" as Level, label: "Primaire", icon: "🧠", shortLabel: "Prépa" },
    ],
    languages: [
      { value: "ar" as Language, label: "العربية", icon: "🇹🇳", shortLabel: "AR" },
      { value: "fr" as Language, label: "Français", icon: "🇫🇷", shortLabel: "FR" },
      { value: "en" as Language, label: "English", icon: "🇬🇧", shortLabel: "EN" },
    ]
  }), [])

  const hasActiveFilters = currentFilters.category || currentFilters.level || currentFilters.language || currentFilters.search
  const activeFiltersCount = Object.values(currentFilters).filter(Boolean).length

  // Get active filter labels for display
  const getActiveFilterLabels = useMemo(() => {
    const labels = []
    if (currentFilters.search) labels.push(`"${currentFilters.search}"`)
    if (currentFilters.category) {
      const cat = filterData.categories.find(c => c.value === currentFilters.category)
      if (cat) labels.push(cat.label)
    }
    if (currentFilters.level) {
      const level = filterData.levels.find(l => l.value === currentFilters.level)
      if (level) labels.push(level.label)
    }
    if (currentFilters.language) {
      const lang = filterData.languages.find(l => l.value === currentFilters.language)
      if (lang) labels.push(lang.label)
    }
    return labels
  }, [currentFilters, filterData])

  // Mobile Quick Filters (collapsible dropdown)
  const MobileQuickFilters = () => (
    <div className="lg:hidden">
      {/* Dropdown Toggle Button */}
      <Collapsible open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-11 px-4 border-2 border-dashed hover:border-solid hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtres rapides</span>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-primary font-semibold">
                    {activeFiltersCount}
                  </span>
                </div>
              )}
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 transition-transform duration-200",
              isMobileFiltersOpen && "rotate-180"
            )} />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <div className="space-y-4 p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm">
            {/* Categories */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">Catégorie</span>
              <div className="flex flex-wrap gap-2">
                {filterData.categories.map((item) => {
                  const isSelected = currentFilters.category === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => handleFilterChange("category", isSelected ? "" : item.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                          : "bg-background hover:bg-muted border-border hover:border-primary/30 hover:scale-105"
                      )}
                    >
                      <span>{item.icon}</span>
                      <span>{item.shortLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Levels */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">Niveau</span>
              <div className="flex flex-wrap gap-2">
                {filterData.levels.map((item) => {
                  const isSelected = currentFilters.level === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => handleFilterChange("level", isSelected ? "" : item.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                          : "bg-background hover:bg-muted border-border hover:border-primary/30 hover:scale-105"
                      )}
                    >
                      <span>{item.icon}</span>
                      <span>{item.shortLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-medium">Langue</span>
              <div className="flex flex-wrap gap-2">
                {filterData.languages.map((item) => {
                  const isSelected = currentFilters.language === item.value
                  return (
                    <button
                      key={item.value}
                      onClick={() => handleFilterChange("language", isSelected ? "" : item.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                          : "bg-background hover:bg-muted border-border hover:border-primary/30 hover:scale-105"
                      )}
                    >
                      <span>{item.icon}</span>
                      <span>{item.shortLabel}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick tip for mobile */}
            <div className="pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="text-sm">💡</span>
                Sélectionnez vos filtres préférés
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )

  // Desktop RadioGroup component
  const DesktopRadioGroup = ({ title, items, currentValue, filterKey }: {
    title: string
    items: Array<{ value: string; label: string; icon: string; shortLabel: string }>
    currentValue: string
    filterKey: string
  }) => (
    <div className="hidden lg:block space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <div className="w-1 h-4 bg-primary rounded-full" />
        {title}
      </h3>
      <div className="space-y-2 pl-3">
        {items.map((item) => {
          const isSelected = currentValue === item.value
          return (
            <button
              key={item.value}
              onClick={() => handleFilterChange(filterKey, isSelected ? "" : item.value)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group border-2",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg border-primary/30 scale-[1.02]"
                  : "bg-muted/20 hover:bg-muted/40 border-transparent hover:scale-[1.01] hover:shadow-md hover:border-border/50"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {isSelected && (
                <div className="w-2.5 h-2.5 bg-primary-foreground rounded-full shadow-sm" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-4 lg:space-y-6">

      {/* Enhanced Search Section */}
      <div className="space-y-3 lg:space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          Recherche
          {currentFilters.search && (
            <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-primary rounded-full animate-pulse shadow-sm" />
          )}
        </h3>
        <div className="relative group">
          <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Rechercher des livres..."
            className="pl-10 pr-10 lg:pl-12 lg:pr-12 h-10 lg:h-12 text-sm bg-background/90 border-2 border-border/60 focus:border-primary focus:bg-background transition-all duration-200 rounded-xl shadow-sm focus:shadow-md"
          />
          <div className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 flex items-center">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0 hover:bg-muted rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mobile Quick Filters */}
      <MobileQuickFilters />

      {/* Desktop Filter Sections */}
      <div className="hidden lg:block space-y-6">
        <DesktopRadioGroup
          title="Catégorie"
          items={filterData.categories}
          currentValue={currentFilters.category}
          filterKey="category"
        />

        <DesktopRadioGroup
          title="Niveau"
          items={filterData.levels}
          currentValue={currentFilters.level}
          filterKey="level"
        />

        <DesktopRadioGroup
          title="Langue"
          items={filterData.languages}
          currentValue={currentFilters.language}
          filterKey="language"
        />
      </div>

      {/* Enhanced tip */}
      <div className="relative bg-linear-to-r from-muted/60 to-muted/40 rounded-xl p-3 lg:p-4 border border-border/50 shadow-sm">
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse" />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-2 font-medium">
          <span className="text-base lg:text-lg">💡</span>
          <span className="lg:hidden">Utilisez les filtres rapides ci-dessus</span>
          <span className="hidden lg:inline">Combinez recherche et filtres pour des résultats précis</span>
        </p>
      </div>
    </div>
  )
}