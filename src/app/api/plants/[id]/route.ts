import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { plants, plantLogs } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const plant = await db.select().from(plants).where(eq(plants.id, Number(id))).limit(1)
    if (!plant.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const logs = await db
      .select()
      .from(plantLogs)
      .where(eq(plantLogs.plantId, Number(id)))
      .orderBy(desc(plantLogs.loggedAt))
    return NextResponse.json({ ...plant[0], logs })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch plant" }, { status: 500 })
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
      .update(plants)
      .set({
        name: body.name,
        variety: body.variety ?? null,
        location: body.location ?? null,
        plantedDate: body.plantedDate ?? null,
        notes: body.notes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(plants.id, Number(id)))
      .returning()
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update plant" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.delete(plants).where(eq(plants.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 })
  }
}
