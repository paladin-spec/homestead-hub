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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bird, Plus, Droplets, Utensils, Egg, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface Chicken {
  id: number
  name: string
  breed: string | null
  hatchDate: string | null
  notes: string | null
  isActive: boolean
}

interface EggCollection {
  id: number
  count: number
  notes: string | null
  collectedAt: string
}

interface ChickenLog {
  id: number
  type: string
  notes: string | null
  loggedAt: string
}

export default function ChickensPage() {
  const [chickens, setChickens] = useState<Chicken[]>([])
  const [eggs, setEggs] = useState<EggCollection[]>([])
  const [chickenLogs, setChickenLogs] = useState<ChickenLog[]>([])
  const [loading, setLoading] = useState(true)

  // Forms
  const [addChickenOpen, setAddChickenOpen] = useState(false)
  const [chickenForm, setChickenForm] = useState({ name: "", breed: "", hatchDate: "", notes: "" })
  const [submitting, setSubmitting] = useState(false)

  const [eggForm, setEggForm] = useState({ count: "", notes: "" })
  const [logForm, setLogForm] = useState({ type: "feeding", notes: "" })

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [cRes, eRes, lRes] = await Promise.all([
        fetch("/api/chickens"),
        fetch("/api/eggs"),
        fetch("/api/chicken-logs"),
      ])
      setChickens(await cRes.json())
      setEggs(await eRes.json())
      setChickenLogs(await lRes.json())
    } catch {
      toast.error("Failed to load chicken data")
    } finally {
      setLoading(false)
    }
  }

  async function addChicken() {
    if (!chickenForm.name.trim()) {
      toast.error("Chicken name is required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/chickens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: chickenForm.name,
          breed: chickenForm.breed || null,
          hatchDate: chickenForm.hatchDate || null,
          notes: chickenForm.notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setChickens(prev => [created, ...prev])
      setChickenForm({ name: "", breed: "", hatchDate: "", notes: "" })
      setAddChickenOpen(false)
      toast.success(`${created.name} added`)
    } catch {
      toast.error("Failed to add chicken")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteChicken(id: number, name: string) {
    try {
      const res = await fetch(`/api/chickens/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setChickens(prev => prev.filter(c => c.id !== id))
      toast.success(`${name} removed`)
    } catch {
      toast.error("Failed to delete chicken")
    }
  }

  async function logEggs() {
    const count = parseInt(eggForm.count)
    if (!count || count < 1) {
      toast.error("Enter a valid egg count")
      return
    }
    try {
      const res = await fetch("/api/eggs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, notes: eggForm.notes || null }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setEggs(prev => [created, ...prev])
      setEggForm({ count: "", notes: "" })
      toast.success(`${count} egg${count !== 1 ? "s" : ""} logged`)
    } catch {
      toast.error("Failed to log eggs")
    }
  }

  async function logActivity() {
    try {
      const res = await fetch("/api/chicken-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: logForm.type, notes: logForm.notes || null }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setChickenLogs(prev => [created, ...prev])
      setLogForm(prev => ({ ...prev, notes: "" }))
      toast.success("Activity logged")
    } catch {
      toast.error("Failed to log activity")
    }
  }

  const todayEggs = eggs
    .filter(e => new Date(e.collectedAt).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.count, 0)

  const totalEggs = eggs.reduce((sum, e) => sum + e.count, 0)

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
          <Bird className="h-5 w-5 text-amber-600" />
          <h1 className="text-xl font-bold">Chickens</h1>
        </div>
        <Dialog open={addChickenOpen} onOpenChange={setAddChickenOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Bird
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Chicken</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="c-name">Name *</Label>
                <Input id="c-name" value={chickenForm.name} onChange={e => setChickenForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="Henrietta" />
              </div>
              <div>
                <Label htmlFor="c-breed">Breed</Label>
                <Input id="c-breed" value={chickenForm.breed} onChange={e => setChickenForm(f => ({ ...f, breed: e.target.value }))} className="mt-1" placeholder="Rhode Island Red" />
              </div>
              <div>
                <Label htmlFor="c-hatch">Hatch Date</Label>
                <Input id="c-hatch" type="date" value={chickenForm.hatchDate} onChange={e => setChickenForm(f => ({ ...f, hatchDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="c-notes">Notes</Label>
                <Textarea id="c-notes" value={chickenForm.notes} onChange={e => setChickenForm(f => ({ ...f, notes: e.target.value }))} className="mt-1" rows={2} />
              </div>
              <Button className="w-full" onClick={addChicken} disabled={submitting}>Add Chicken</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold">{chickens.filter(c => c.isActive).length}</div>
            <div className="text-xs text-muted-foreground">active birds</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{todayEggs}</div>
            <div className="text-xs text-muted-foreground">eggs today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold">{totalEggs}</div>
            <div className="text-xs text-muted-foreground">total eggs</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="flock">
        <TabsList className="w-full">
          <TabsTrigger value="flock" className="flex-1">Flock</TabsTrigger>
          <TabsTrigger value="eggs" className="flex-1">Egg Collection</TabsTrigger>
          <TabsTrigger value="care" className="flex-1">Care Log</TabsTrigger>
        </TabsList>

        {/* Flock tab */}
        <TabsContent value="flock" className="space-y-3 mt-3">
          {chickens.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Bird className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No chickens yet. Add your first bird!</p>
            </div>
          )}
          {chickens.map(chicken => (
            <Card key={chicken.id}>
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{chicken.name}</CardTitle>
                      <Badge variant={chicken.isActive ? "default" : "secondary"} className="text-xs">
                        {chicken.isActive ? "active" : "inactive"}
                      </Badge>
                    </div>
                    {chicken.breed && <p className="text-sm text-muted-foreground">{chicken.breed}</p>}
                    {chicken.hatchDate && (
                      <p className="text-xs text-muted-foreground">
                        Hatched {format(new Date(chicken.hatchDate), "MMM d, yyyy")}
                      </p>
                    )}
                    {chicken.notes && <p className="text-xs text-muted-foreground mt-1">{chicken.notes}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => deleteChicken(chicken.id, chicken.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        {/* Eggs tab */}
        <TabsContent value="eggs" className="space-y-3 mt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Log Egg Collection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <div className="w-24">
                  <Label htmlFor="egg-count" className="text-xs">Count *</Label>
                  <Input
                    id="egg-count"
                    type="number"
                    min="1"
                    value={eggForm.count}
                    onChange={e => setEggForm(f => ({ ...f, count: e.target.value }))}
                    className="mt-1 h-8"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="egg-notes" className="text-xs">Notes</Label>
                  <Input
                    id="egg-notes"
                    value={eggForm.notes}
                    onChange={e => setEggForm(f => ({ ...f, notes: e.target.value }))}
                    className="mt-1 h-8"
                    placeholder="Any notes..."
                  />
                </div>
              </div>
              <Button size="sm" onClick={logEggs} className="w-full">
                <Egg className="h-4 w-4 mr-1" /> Log Collection
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {eggs.slice(0, 30).map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-md border">
                <div className="flex items-center gap-2">
                  <Egg className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">{e.count} egg{e.count !== 1 ? "s" : ""}</span>
                  {e.notes && <span className="text-muted-foreground text-xs">{e.notes}</span>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(e.collectedAt), "MMM d, h:mm a")}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Care log tab */}
        <TabsContent value="care" className="space-y-3 mt-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Log Care Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Select value={logForm.type} onValueChange={v => setLogForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feeding">Feeding</SelectItem>
                    <SelectItem value="watering">Watering</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="h-8 text-xs"
                  placeholder="Optional note..."
                  value={logForm.notes}
                  onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") logActivity() }}
                />
                <Button size="sm" className="h-8 px-3 text-xs" onClick={logActivity}>
                  Log
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {chickenLogs.slice(0, 30).map(log => {
              const icons: Record<string, React.ReactNode> = {
                feeding: <Utensils className="h-3.5 w-3.5 text-orange-500" />,
                watering: <Droplets className="h-3.5 w-3.5 text-blue-500" />,
                note: <Bird className="h-3.5 w-3.5 text-muted-foreground" />,
              }
              return (
                <div key={log.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-md border">
                  <div className="flex items-center gap-2">
                    {icons[log.type] ?? icons.note}
                    <span className="capitalize font-medium">{log.type}</span>
                    {log.notes && <span className="text-muted-foreground text-xs">{log.notes}</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.loggedAt), "MMM d, h:mm a")}
                  </span>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
