"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Flame, Trash2, Plus } from "lucide-react"
import { format } from "date-fns"

interface FirewoodEntry {
  id: number
  species: string
  diameterInches: string
  lengthInches: string
  pieceCount: number
  cordsEstimate: string | null
  btuEstimate: string | null
  notes: string | null
  collectedAt: string
}

// Same species list as the API
const WOOD_SPECIES = [
  "Apple", "Ash (Green)", "Ash (White)", "Aspen", "Basswood", "Beech",
  "Black Birch", "Black Cherry", "Black Locust", "Catalpa", "Cedar (Red)",
  "Cedar (White)", "Cherry", "Cottonwood", "Douglas Fir", "Elm (American)",
  "Hard Maple", "Hickory", "Oak (Red)", "Oak (White)", "Osage Orange",
  "Paper Birch", "Pine (Eastern White)", "Pine (Red)", "Red Alder", "Red Maple",
  "Soft Maple", "Spruce", "Sycamore", "Tamarack", "Walnut", "Willow",
  "Yellow Birch",
]

function formatBTU(btu: string | null): string {
  if (!btu) return "—"
  const n = parseFloat(btu)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M BTU`
  return `${Math.round(n).toLocaleString()} BTU`
}

export default function FirewoodPage() {
  const [entries, setEntries] = useState<FirewoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    species: "Oak (White)",
    diameterInches: "",
    lengthInches: "16",
    pieceCount: "1",
    notes: "",
  })

  // Live calculator preview
  const [preview, setPreview] = useState({ cords: 0, btu: 0 })

  useEffect(() => {
    fetchEntries()
  }, [])

  useEffect(() => {
    const d = parseFloat(form.diameterInches)
    const l = parseFloat(form.lengthInches)
    const p = parseInt(form.pieceCount) || 1
    if (d > 0 && l > 0) {
      const r = (d / 2) / 12
      const len = l / 12
      const vol = Math.PI * r * r * len * p
      const cords = vol / 80
      setPreview({ cords, btu: 0 })
    } else {
      setPreview({ cords: 0, btu: 0 })
    }
  }, [form.diameterInches, form.lengthInches, form.pieceCount])

  async function fetchEntries() {
    setLoading(true)
    try {
      const res = await fetch("/api/firewood")
      setEntries(await res.json())
    } catch {
      toast.error("Failed to load firewood entries")
    } finally {
      setLoading(false)
    }
  }

  async function addEntry() {
    if (!form.diameterInches || !form.lengthInches) {
      toast.error("Diameter and length are required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/firewood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          species: form.species,
          diameterInches: parseFloat(form.diameterInches),
          lengthInches: parseFloat(form.lengthInches),
          pieceCount: parseInt(form.pieceCount) || 1,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setEntries(prev => [created, ...prev])
      setForm(f => ({ ...f, diameterInches: "", notes: "", pieceCount: "1" }))
      toast.success("Firewood entry added")
    } catch {
      toast.error("Failed to add firewood entry")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteEntry(id: number) {
    try {
      const res = await fetch(`/api/firewood/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setEntries(prev => prev.filter(e => e.id !== id))
      toast.success("Entry removed")
    } catch {
      toast.error("Failed to delete entry")
    }
  }

  const totalCords = entries.reduce((sum, e) => sum + (parseFloat(e.cordsEstimate ?? "0") || 0), 0)
  const totalBTU = entries.reduce((sum, e) => sum + (parseFloat(e.btuEstimate ?? "0") || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-600" />
        <h1 className="text-xl font-bold">Firewood</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-orange-600">{totalCords.toFixed(3)}</div>
            <div className="text-xs text-muted-foreground">total cords</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{(totalBTU / 1_000_000).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground">estimated BTU</div>
          </CardContent>
        </Card>
      </div>

      {/* Add entry form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" /> Log Firewood
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Wood Species</Label>
            <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {WOOD_SPECIES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="fw-diameter" className="text-xs">Diameter (in) *</Label>
              <Input
                id="fw-diameter"
                type="number"
                step="0.5"
                min="1"
                placeholder="8"
                value={form.diameterInches}
                onChange={e => setForm(f => ({ ...f, diameterInches: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fw-length" className="text-xs">Length (in) *</Label>
              <Input
                id="fw-length"
                type="number"
                step="1"
                min="1"
                placeholder="16"
                value={form.lengthInches}
                onChange={e => setForm(f => ({ ...f, lengthInches: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fw-pieces" className="text-xs">Pieces</Label>
              <Input
                id="fw-pieces"
                type="number"
                min="1"
                placeholder="1"
                value={form.pieceCount}
                onChange={e => setForm(f => ({ ...f, pieceCount: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Live preview */}
          {preview.cords > 0 && (
            <div className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
              Estimated: <span className="font-medium text-foreground">{preview.cords.toFixed(4)} cords</span>
            </div>
          )}

          <div>
            <Label htmlFor="fw-notes" className="text-xs">Notes</Label>
            <Textarea
              id="fw-notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="mt-1"
              rows={2}
              placeholder="Location, condition, etc."
            />
          </div>

          <Button onClick={addEntry} disabled={submitting} className="w-full">
            <Flame className="h-4 w-4 mr-1" /> Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* Entries list */}
      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Flame className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No firewood logged yet.</p>
        </div>
      )}
      <div className="space-y-2">
        {entries.map(entry => (
          <Card key={entry.id}>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-sm">{entry.species}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {entry.diameterInches}&quot; dia × {entry.lengthInches}&quot; long
                    {entry.pieceCount > 1 && ` × ${entry.pieceCount} pieces`}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-xs font-medium text-orange-600">
                      {parseFloat(entry.cordsEstimate ?? "0").toFixed(4)} cords
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatBTU(entry.btuEstimate)}
                    </span>
                  </div>
                  {entry.notes && <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(entry.collectedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
