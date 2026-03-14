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
import { Wrench, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { format, isPast } from "date-fns"

interface MaintenanceLog {
  id: number
  equipmentId: number
  type: string
  description: string
  cost: string | null
  performedBy: string | null
  nextDueDate: string | null
  performedAt: string
  notes: string | null
}

interface EquipmentItem {
  id: number
  name: string
  type: string | null
  make: string | null
  model: string | null
  year: number | null
  serialNumber: string | null
  notes: string | null
  isActive: boolean
}

const MAINTENANCE_TYPES = [
  { value: "oil_change", label: "Oil Change" },
  { value: "filter", label: "Filter Replacement" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "fuel", label: "Fuel/Fluids" },
  { value: "sharpening", label: "Blade/Chain Sharpening" },
  { value: "tire", label: "Tire Service" },
  { value: "other", label: "Other" },
]

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [logs, setLogs] = useState<Record<number, MaintenanceLog[]>>({})

  // Equipment form
  const [addEquipOpen, setAddEquipOpen] = useState(false)
  const [equipForm, setEquipForm] = useState({
    name: "", type: "", make: "", model: "", year: "", serialNumber: "", notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Maintenance log form
  const [logForms, setLogForms] = useState<Record<number, {
    type: string; description: string; cost: string;
    performedBy: string; nextDueDate: string; notes: string
  }>>({})

  useEffect(() => {
    fetchEquipment()
  }, [])

  async function fetchEquipment() {
    setLoading(true)
    try {
      const res = await fetch("/api/equipment")
      setEquipment(await res.json())
    } catch {
      toast.error("Failed to load equipment")
    } finally {
      setLoading(false)
    }
  }

  async function fetchLogs(id: number) {
    try {
      const res = await fetch(`/api/equipment/${id}`)
      const data = await res.json()
      setLogs(prev => ({ ...prev, [id]: data.maintenanceLogs ?? [] }))
    } catch {
      toast.error("Failed to load maintenance logs")
    }
  }

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      fetchLogs(id)
      if (!logForms[id]) {
        setLogForms(prev => ({
          ...prev,
          [id]: { type: "oil_change", description: "", cost: "", performedBy: "", nextDueDate: "", notes: "" }
        }))
      }
    }
  }

  async function addEquipment() {
    if (!equipForm.name.trim()) {
      toast.error("Equipment name is required")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: equipForm.name,
          type: equipForm.type || null,
          make: equipForm.make || null,
          model: equipForm.model || null,
          year: equipForm.year ? parseInt(equipForm.year) : null,
          serialNumber: equipForm.serialNumber || null,
          notes: equipForm.notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setEquipment(prev => [created, ...prev])
      setEquipForm({ name: "", type: "", make: "", model: "", year: "", serialNumber: "", notes: "" })
      setAddEquipOpen(false)
      toast.success(`${created.name} added`)
    } catch {
      toast.error("Failed to add equipment")
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteEquipment(id: number, name: string) {
    try {
      const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setEquipment(prev => prev.filter(e => e.id !== id))
      toast.success(`${name} removed`)
    } catch {
      toast.error("Failed to delete equipment")
    }
  }

  async function addMaintenanceLog(equipmentId: number) {
    const lf = logForms[equipmentId]
    if (!lf?.description.trim()) {
      toast.error("Description is required")
      return
    }
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId,
          type: lf.type,
          description: lf.description,
          cost: lf.cost ? parseFloat(lf.cost) : null,
          performedBy: lf.performedBy || null,
          nextDueDate: lf.nextDueDate || null,
          notes: lf.notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setLogs(prev => ({ ...prev, [equipmentId]: [created, ...(prev[equipmentId] ?? [])] }))
      setLogForms(prev => ({
        ...prev,
        [equipmentId]: { ...prev[equipmentId], description: "", cost: "", performedBy: "", nextDueDate: "", notes: "" }
      }))
      toast.success("Maintenance logged")
    } catch {
      toast.error("Failed to log maintenance")
    }
  }

  async function deleteLog(logId: number, equipmentId: number) {
    try {
      const res = await fetch(`/api/maintenance/${logId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setLogs(prev => ({ ...prev, [equipmentId]: (prev[equipmentId] ?? []).filter(l => l.id !== logId) }))
      toast.success("Log removed")
    } catch {
      toast.error("Failed to delete log")
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
          <Wrench className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold">Equipment</h1>
          <Badge variant="secondary">{equipment.length}</Badge>
        </div>
        <Dialog open={addEquipOpen} onOpenChange={setAddEquipOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Equipment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="eq-name">Name *</Label>
                <Input id="eq-name" value={equipForm.name} onChange={e => setEquipForm(f => ({ ...f, name: e.target.value }))} className="mt-1" placeholder="John Deere Tractor" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="eq-make" className="text-xs">Make</Label>
                  <Input id="eq-make" value={equipForm.make} onChange={e => setEquipForm(f => ({ ...f, make: e.target.value }))} className="mt-1" placeholder="John Deere" />
                </div>
                <div>
                  <Label htmlFor="eq-model" className="text-xs">Model</Label>
                  <Input id="eq-model" value={equipForm.model} onChange={e => setEquipForm(f => ({ ...f, model: e.target.value }))} className="mt-1" placeholder="X300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="eq-year" className="text-xs">Year</Label>
                  <Input id="eq-year" type="number" value={equipForm.year} onChange={e => setEquipForm(f => ({ ...f, year: e.target.value }))} className="mt-1" placeholder="2020" />
                </div>
                <div>
                  <Label htmlFor="eq-type" className="text-xs">Type</Label>
                  <Input id="eq-type" value={equipForm.type} onChange={e => setEquipForm(f => ({ ...f, type: e.target.value }))} className="mt-1" placeholder="Tractor" />
                </div>
              </div>
              <div>
                <Label htmlFor="eq-serial" className="text-xs">Serial Number</Label>
                <Input id="eq-serial" value={equipForm.serialNumber} onChange={e => setEquipForm(f => ({ ...f, serialNumber: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="eq-notes" className="text-xs">Notes</Label>
                <Textarea id="eq-notes" value={equipForm.notes} onChange={e => setEquipForm(f => ({ ...f, notes: e.target.value }))} className="mt-1" rows={2} />
              </div>
              <Button className="w-full" onClick={addEquipment} disabled={submitting}>Add Equipment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {equipment.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No equipment yet. Add your first machine!</p>
        </div>
      )}

      <div className="space-y-3">
        {equipment.map(eq => {
          const eqLogs = logs[eq.id] ?? []
          const overdueCount = eqLogs.filter(
            l => l.nextDueDate && isPast(new Date(l.nextDueDate))
          ).length

          return (
            <Card key={eq.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{eq.name}</CardTitle>
                      {overdueCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-destructive font-medium">
                          <AlertCircle className="h-3 w-3" /> {overdueCount} overdue
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {[eq.year?.toString(), eq.make, eq.model].filter(Boolean).map((v, i) => (
                        <span key={i} className="text-xs text-muted-foreground">{v}</span>
                      ))}
                      {eq.type && <Badge variant="outline" className="text-xs h-5">{eq.type}</Badge>}
                    </div>
                    {eq.serialNumber && (
                      <p className="text-xs text-muted-foreground mt-0.5">S/N: {eq.serialNumber}</p>
                    )}
                    {eq.notes && <p className="text-xs text-muted-foreground mt-1">{eq.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteEquipment(eq.id, eq.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleExpand(eq.id)}
                    >
                      {expandedId === eq.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedId === eq.id && (
                <CardContent className="pt-0 space-y-3">
                  {/* Log maintenance form */}
                  <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                    <p className="text-xs font-medium">Log Maintenance</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={logForms[eq.id]?.type ?? "oil_change"}
                          onValueChange={v => setLogForms(prev => ({ ...prev, [eq.id]: { ...prev[eq.id], type: v } }))}
                        >
                          <SelectTrigger className="mt-1 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MAINTENANCE_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Cost ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={logForms[eq.id]?.cost ?? ""}
                          onChange={e => setLogForms(prev => ({ ...prev, [eq.id]: { ...prev[eq.id], cost: e.target.value } }))}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description *</Label>
                      <Input
                        placeholder="e.g. Changed oil and oil filter"
                        value={logForms[eq.id]?.description ?? ""}
                        onChange={e => setLogForms(prev => ({ ...prev, [eq.id]: { ...prev[eq.id], description: e.target.value } }))}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Performed By</Label>
                        <Input
                          placeholder="Your name"
                          value={logForms[eq.id]?.performedBy ?? ""}
                          onChange={e => setLogForms(prev => ({ ...prev, [eq.id]: { ...prev[eq.id], performedBy: e.target.value } }))}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Next Due Date</Label>
                        <Input
                          type="date"
                          value={logForms[eq.id]?.nextDueDate ?? ""}
                          onChange={e => setLogForms(prev => ({ ...prev, [eq.id]: { ...prev[eq.id], nextDueDate: e.target.value } }))}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>
                    <Button size="sm" className="w-full h-8 text-xs" onClick={() => addMaintenanceLog(eq.id)}>
                      <Wrench className="h-3.5 w-3.5 mr-1" /> Log Maintenance
                    </Button>
                  </div>

                  {/* Maintenance history */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {eqLogs.length === 0 && (
                      <p className="text-xs text-muted-foreground">No maintenance logged yet.</p>
                    )}
                    {eqLogs.map(log => {
                      const typeLabel = MAINTENANCE_TYPES.find(t => t.value === log.type)?.label ?? log.type
                      const isOverdue = log.nextDueDate && isPast(new Date(log.nextDueDate))
                      return (
                        <div key={log.id} className="border rounded-md p-2.5 text-xs space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs h-5">{typeLabel}</Badge>
                                {log.cost && <span className="text-muted-foreground">${parseFloat(log.cost).toFixed(2)}</span>}
                              </div>
                              <p className="font-medium mt-1">{log.description}</p>
                              {log.performedBy && <p className="text-muted-foreground">By: {log.performedBy}</p>}
                              <p className="text-muted-foreground">{format(new Date(log.performedAt), "MMM d, yyyy")}</p>
                              {log.nextDueDate && (
                                <p className={`flex items-center gap-1 mt-0.5 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                                  Next due: {format(new Date(log.nextDueDate), "MMM d, yyyy")}
                                  {isOverdue && " (OVERDUE)"}
                                </p>
                              )}
                              {log.notes && <p className="text-muted-foreground mt-0.5">{log.notes}</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
                              onClick={() => deleteLog(log.id, eq.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
