"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sprout, Plus, Droplets, Leaf, MapPin, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"

interface PlantLog {
  id: number
  type: string
  notes: string | null
  loggedAt: string
}

interface Plant {
  id: number
  name: string
  variety: string | null
  location: string | null
  plantedDate: string | null
  notes: string | null
  createdAt: string
}

const LOG_TYPE_STYLES: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  watering: { label: "Watered", color: "bg-blue-100 text-blue-800", icon: <Droplets className="h-3 w-3" /> },
  fertilizing: { label: "Fertilized", color: "bg-green-100 text-green-800", icon: <Leaf className="h-3 w-3" /> },
  note: { label: "Note", color: "bg-gray-100 text-gray-700", icon: <Sprout className="h-3 w-3" /> },
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [logs, setLogs] = useState<Record<number, PlantLog[]>>({})
  const [logForm, setLogForm] = useState<Record<number, { type: string; notes: string }>>({})

  const [form, setForm] = useState({
    name: "",
    variety: "",
    location: "",
    plantedDate: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPlants()
  }, [])

  async function fetchPlants() {
    setLoading(true)
    try {
      const res = await fetch("/api/plants")
      const data = await res.json()
      setPlants(data)
    } catch {
      toast.error("Failed to load plants")
    } finally {
      setLoading(false)
    }
  }

  async function fetchLogs(plantId: number) {
    try {
      const res = await fetch(`/api/plants/${plantId}`)
      const data = await res.json()
      setLogs(prev => ({ ...prev, [plantId]: data.logs ?? [] }))
    } catch {
      toast.error("Failed to load plant logs")
    }
  }

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      fetchLogs(id)
      if (!logForm[id]) {
        setLogForm(prev => ({ ...prev, [id]: { type: "watering", notes: "" } }))
      }
    }
  }

  async function addPlant() {
    if (!form.name.trim()) {
      toast.error("Plant name is required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          variety: form.variety || null,
          location: form.location || null,
          plantedDate: form.plantedDate || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setPlants(prev => [created, ...prev])
      setForm({ name: "", variety: "", location: "", plantedDate: "", notes: "" })
      setAddOpen(false)
      toast.success(`${created.name} added`)
    } catch {
      toast.error("Failed to add plant")
    } finally {
      setSubmitting(false)
    }
  }

  async function deletePlant(id: number, name: string) {
    try {
      const res = await fetch(`/api/plants/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setPlants(prev => prev.filter(p => p.id !== id))
      toast.success(`${name} removed`)
    } catch {
      toast.error("Failed to delete plant")
    }
  }

  async function addLog(plantId: number) {
    const lf = logForm[plantId]
    if (!lf) return
    try {
      const res = await fetch(`/api/plants/${plantId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: lf.type, notes: lf.notes || null }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setLogs(prev => ({ ...prev, [plantId]: [created, ...(prev[plantId] ?? [])] }))
      setLogForm(prev => ({ ...prev, [plantId]: { ...prev[plantId], notes: "" } }))
      toast.success("Activity logged")
    } catch {
      toast.error("Failed to log activity")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-green-600" />
          <h1 className="text-xl font-bold">Plants</h1>
          <Badge variant="secondary">{plants.length}</Badge>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Plant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Plant</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="p-name">Name *</Label>
                <Input id="p-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="Tomato" />
              </div>
              <div>
                <Label htmlFor="p-variety">Variety</Label>
                <Input id="p-variety" value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))} className="mt-1" placeholder="Cherokee Purple" />
              </div>
              <div>
                <Label htmlFor="p-location">Location</Label>
                <Input id="p-location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="mt-1" placeholder="Raised bed 2, Row 3" />
              </div>
              <div>
                <Label htmlFor="p-date">Planted Date</Label>
                <Input id="p-date" type="date" value={form.plantedDate} onChange={e => setForm(f => ({ ...f, plantedDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="p-notes">Notes</Label>
                <Textarea id="p-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1" rows={2} />
              </div>
              <Button className="w-full" onClick={addPlant} disabled={submitting}>
                Add Plant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plants.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Sprout className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No plants yet. Add your first plant!</p>
        </div>
      )}

      <div className="space-y-3">
        {plants.map(plant => (
          <Card key={plant.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{plant.name}</CardTitle>
                  {plant.variety && <p className="text-sm text-muted-foreground">{plant.variety}</p>}
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {plant.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {plant.location}
                      </span>
                    )}
                    {plant.plantedDate && (
                      <span className="text-xs text-muted-foreground">
                        Planted {format(new Date(plant.plantedDate), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  {plant.notes && <p className="text-xs text-muted-foreground mt-1">{plant.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => deletePlant(plant.id, plant.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleExpand(plant.id)}
                  >
                    {expandedId === plant.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedId === plant.id && (
              <CardContent className="pt-0 space-y-3">
                {/* Log activity */}
                <div className="flex gap-2">
                  <Select
                    value={logForm[plant.id]?.type ?? "watering"}
                    onValueChange={v => setLogForm(prev => ({ ...prev, [plant.id]: { ...prev[plant.id], type: v } }))}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watering">Watered</SelectItem>
                      <SelectItem value="fertilizing">Fertilized</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Optional note..."
                    value={logForm[plant.id]?.notes ?? ""}
                    onChange={e => setLogForm(prev => ({ ...prev, [plant.id]: { ...prev[plant.id], notes: e.target.value } }))}
                    onKeyDown={e => { if (e.key === "Enter") addLog(plant.id) }}
                  />
                  <Button size="sm" className="h-8 px-3 text-xs" onClick={() => addLog(plant.id)}>
                    Log
                  </Button>
                </div>

                {/* Log history */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(logs[plant.id] ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">No activity logged yet.</p>
                  )}
                  {(logs[plant.id] ?? []).map(log => {
                    const style = LOG_TYPE_STYLES[log.type] ?? LOG_TYPE_STYLES.note
                    return (
                      <div key={log.id} className="flex items-start gap-2 text-xs">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${style.color}`}>
                          {style.icon} {style.label}
                        </span>
                        <span className="text-muted-foreground">
                          {format(new Date(log.loggedAt), "MMM d, h:mm a")}
                        </span>
                        {log.notes && <span className="text-foreground">{log.notes}</span>}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
