import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { plantLogs } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; logId: string }> }
) {
  const { logId } = await params
  try {
    const body = await request.json()
    const updated = await db
      .update(plantLogs)
      .set({ notes: body.notes ?? null })
      .where(eq(plantLogs.id, Number(logId)))
      .returning()
    if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update log" }, { status: 500 })
  }
}
