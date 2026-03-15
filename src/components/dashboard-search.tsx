"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Sprout, Bird, Flame, Wrench, Loader2, MapPin, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlantResult {
  id: number
  name: string
  variety: string | null
  location: string | null
  plantedDate: string | null
}

interface ChickenResult {
  id: number
  name: string
  breed: string | null
  isActive: boolean
}

interface FirewoodResult {
  id: number
  species: string
  cordsEstimate: string | null
  collectedAt: string
  notes: string | null
}

interface EquipmentResult {
  id: number
  name: string
  make: string | null
  model: string | null
  year: number | null
  type: string | null
}

interface MaintenanceResult {
  id: number
  equipmentId: number
  equipmentName: string
  type: string
  description: string
  performedAt: string
}

interface SearchResults {
  plants: PlantResult[]
  chickens: ChickenResult[]
  firewood: FirewoodResult[]
  equipment: EquipmentResult[]
  maintenance: MaintenanceResult[]
}

const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  oil_change: "Oil Change",
  filter: "Filter Replacement",
  repair: "Repair",
  inspection: "Inspection",
  fuel: "Fuel/Fluids",
  sharpening: "Blade/Chain Sharpening",
  tire: "Tire Service",
  other: "Other",
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const totalResults = results
    ? results.plants.length + results.chickens.length + results.firewood.length +
      results.equipment.length + results.maintenance.length
    : 0

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      setOpen(false)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setOpen(true)
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  function clear() {
    setQuery("")
    setResults(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  function navigate(href: string) {
    setOpen(false)
    setQuery("")
    setResults(null)
    router.push(href)
  }

  const hasResults = results && totalResults > 0
  const showEmpty = results && totalResults === 0 && query.length >= 2

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results && totalResults > 0 && setOpen(true)}
          placeholder="Search plants, chickens, firewood, equipment..."
          className="pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {!loading && query.length > 0 && (
          <button
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results panel */}
      {open && (hasResults || showEmpty) && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-lg border bg-popover shadow-lg overflow-hidden">
          {showEmpty && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
            </div>
          )}

          {hasResults && (
            <div className="max-h-[420px] overflow-y-auto divide-y">
              {/* Plants */}
              {results.plants.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40">
                    <Sprout className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plants</span>
                    <span className="ml-auto text-xs text-muted-foreground">{results.plants.length}</span>
                  </div>
                  {results.plants.map(p => (
                    <button
                      key={p.id}
                      onClick={() => navigate("/plants")}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors"
                    >
                      <Sprout className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {p.name}{p.variety ? <span className="text-muted-foreground font-normal"> · {p.variety}</span> : null}
                        </p>
                        {(p.location || p.plantedDate) && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                            {p.location && <><MapPin className="h-3 w-3 shrink-0" />{p.location}</>}
                            {p.location && p.plantedDate && <span className="mx-1">·</span>}
                            {p.plantedDate && <>Planted {format(new Date(p.plantedDate), "MMM d, yyyy")}</>}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Chickens */}
              {results.chickens.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40">
                    <Bird className="h-3 w-3 text-amber-600" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chickens</span>
                    <span className="ml-auto text-xs text-muted-foreground">{results.chickens.length}</span>
                  </div>
                  {results.chickens.map(c => (
                    <button
                      key={c.id}
                      onClick={() => navigate("/chickens")}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors"
                    >
                      <Bird className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {c.name}
                          <span className={cn("ml-1.5 text-xs font-normal", c.isActive ? "text-green-600" : "text-muted-foreground")}>
                            {c.isActive ? "active" : "inactive"}
                          </span>
                        </p>
                        {c.breed && <p className="text-xs text-muted-foreground mt-0.5">{c.breed}</p>}
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Firewood */}
              {results.firewood.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40">
                    <Flame className="h-3 w-3 text-orange-600" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Firewood</span>
                    <span className="ml-auto text-xs text-muted-foreground">{results.firewood.length}</span>
                  </div>
                  {results.firewood.map(f => (
                    <button
                      key={f.id}
                      onClick={() => navigate("/firewood")}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors"
                    >
                      <Flame className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{f.species}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {f.cordsEstimate ? `${parseFloat(f.cordsEstimate).toFixed(3)} cords` : "—"}
                          {" · "}
                          {format(new Date(f.collectedAt), "MMM d, yyyy")}
                          {f.notes && <> · {f.notes}</>}
                        </p>
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Equipment */}
              {results.equipment.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40">
                    <Wrench className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Equipment</span>
                    <span className="ml-auto text-xs text-muted-foreground">{results.equipment.length}</span>
                  </div>
                  {results.equipment.map(e => (
                    <button
                      key={e.id}
                      onClick={() => navigate("/equipment")}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors"
                    >
                      <Wrench className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{e.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {[e.year?.toString(), e.make, e.model, e.type].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Maintenance Logs */}
              {results.maintenance.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40">
                    <Wrench className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Maintenance Logs</span>
                    <span className="ml-auto text-xs text-muted-foreground">{results.maintenance.length}</span>
                  </div>
                  {results.maintenance.map(m => (
                    <button
                      key={m.id}
                      onClick={() => navigate("/equipment")}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-accent text-left transition-colors"
                    >
                      <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{m.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {MAINTENANCE_TYPE_LABELS[m.type] ?? m.type}
                          {" · "}
                          {m.equipmentName}
                          {" · "}
                          {format(new Date(m.performedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}

          {/* Footer hint */}
          {hasResults && (
            <div className="px-4 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground">
              {totalResults} result{totalResults !== 1 ? "s" : ""} · Press <kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> to close
            </div>
          )}
        </div>
      )}
    </div>
  )
}
