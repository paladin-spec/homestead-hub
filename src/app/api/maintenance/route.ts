import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { maintenanceLogs } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const results = await db.select().from(maintenanceLogs).orderBy(desc(maintenanceLogs.performedAt))
    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch maintenance logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await db
      .insert(maintenanceLogs)
      .values({
        equipmentId: Number(body.equipmentId),
        type: body.type,
        description: body.description,
        cost: body.cost != null ? String(body.cost) : null,
        performedBy: body.performedBy ?? null,
        nextDueDate: body.nextDueDate ?? null,
        notes: body.notes ?? null,
        performedAt: body.performedAt ? new Date(body.performedAt) : new Date(),
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create maintenance log" }, { status: 500 })
  }
}
