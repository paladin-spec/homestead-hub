import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { maintenanceLogs } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.delete(maintenanceLogs).where(eq(maintenanceLogs.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete maintenance log" }, { status: 500 })
  }
}
