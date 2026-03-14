import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { plantLogs } from "@/lib/schema"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const created = await db
      .insert(plantLogs)
      .values({
        plantId: Number(id),
        type: body.type,
        notes: body.notes ?? null,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create log" }, { status: 500 })
  }
}
