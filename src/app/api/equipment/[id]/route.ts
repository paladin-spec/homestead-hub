import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { equipment, maintenanceLogs } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const eq_ = await db.select().from(equipment).where(eq(equipment.id, Number(id))).limit(1)
    if (!eq_.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const logs = await db
      .select()
      .from(maintenanceLogs)
      .where(eq(maintenanceLogs.equipmentId, Number(id)))
      .orderBy(desc(maintenanceLogs.performedAt))
    return NextResponse.json({ ...eq_[0], maintenanceLogs: logs })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const updated = await db
      .update(equipment)
      .set({
        name: body.name,
        type: body.type ?? null,
        make: body.make ?? null,
        model: body.model ?? null,
        year: body.year ?? null,
        serialNumber: body.serialNumber ?? null,
        notes: body.notes ?? null,
        isActive: body.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(equipment.id, Number(id)))
      .returning()
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update equipment" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.delete(equipment).where(eq(equipment.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete equipment" }, { status: 500 })
  }
}
