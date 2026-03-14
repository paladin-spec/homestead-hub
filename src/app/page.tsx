"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sprout, Bird, Flame, Wrench, Home, Pencil, Check, X } from "lucide-react"
import Link from "next/link"

interface HomesteadData {
  id: number
  name: string
  location: string | null
  description: string | null
}

interface Stats {
  plants: number
  chickens: number
  firewood: number
  equipment: number
  eggs: number
  totalCords: number
}

export default function DashboardPage() {
  const [homestead, setHomestead] = useState<HomesteadData | null>(null)
  const [stats, setStats] = useState<Stats>({ plants: 0, chickens: 0, firewood: 0, equipment: 0, eggs: 0, totalCords: 0 })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: "", location: "", description: "" })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [hsRes, plantsRes, chickensRes, firewoodRes, equipmentRes, eggsRes] = await Promise.all([
        fetch("/api/homestead"),
        fetch("/api/plants"),
        fetch("/api/chickens"),
        fetch("/api/firewood"),
        fetch("/api/equipment"),
        fetch("/api/eggs"),
      ])
      const hs = await hsRes.json()
      const plants = await plantsRes.json()
      const chickens = await chickensRes.json()
      const firewood = await firewoodRes.json()
      const equipment = await equipmentRes.json()
      const eggs = await eggsRes.json()

      setHomestead(hs)
      setForm({ name: hs.name, location: hs.location ?? "", description: hs.description ?? "" })

      const totalCords = Array.isArray(firewood)
        ? firewood.reduce((sum: number, e: { cordsEstimate: string | null }) =>
            sum + (parseFloat(e.cordsEstimate ?? "0") || 0), 0)
        : 0

      const todayEggs = Array.isArray(eggs)
        ? eggs.filter((e: { collectedAt: string; count: number }) => {
            const d = new Date(e.collectedAt)
            const now = new Date()
            return d.toDateString() === now.toDateString()
          }).reduce((sum: number, e: { count: number }) => sum + e.count, 0)
        : 0

      setStats({
        plants: Array.isArray(plants) ? plants.length : 0,
        chickens: Array.isArray(chickens) ? chickens.filter((c: { isActive: boolean }) => c.isActive).length : 0,
        firewood: Array.isArray(firewood) ? firewood.length : 0,
        equipment: Array.isArray(equipment) ? equipment.length : 0,
        eggs: todayEggs,
        totalCords,
      })
    } catch {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  async function saveHomestead() {
    setSaving(true)
    try {
      const res = await fetch("/api/homestead", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setHomestead(updated)
      setEditing(false)
      toast.success("Homestead settings saved")
    } catch {
      toast.error("Failed to save homestead settings")
    } finally {
      setSaving(false)
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Homestead name */}
      <div>
        {editing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="hs-name">Homestead Name</Label>
              <Input
                id="hs-name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hs-location">Location</Label>
              <Input
                id="hs-location"
                placeholder="e.g. Blue Ridge Mountains, VA"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="hs-desc">Description</Label>
              <Textarea
                id="hs-desc"
                placeholder="A few words about your homestead..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveHomestead} disabled={saving}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold">{homestead?.name}</h1>
              <Button variant="ghost" size="icon" onClick={() => setEditing(true)} className="h-7 w-7">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            {homestead?.location && (
              <p className="text-sm text-muted-foreground mt-0.5">{homestead.location}</p>
            )}
            {homestead?.description && (
              <p className="text-sm text-muted-foreground mt-1">{homestead.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/plants">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sprout className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Plants</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.plants}</div>
              <CardDescription>tracked varieties</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/chickens">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Bird className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Chickens</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.chickens}</div>
              <CardDescription>active birds · {stats.eggs} eggs today</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/firewood">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Firewood</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalCords.toFixed(2)}</div>
              <CardDescription>cords total ({stats.firewood} entries)</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/equipment">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Equipment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.equipment}</div>
              <CardDescription>machines tracked</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
