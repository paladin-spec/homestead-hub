import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chickens } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const updated = await db
      .update(chickens)
      .set({
        name: body.name,
        breed: body.breed ?? null,
        hatchDate: body.hatchDate ?? null,
        notes: body.notes ?? null,
        isActive: body.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(chickens.id, Number(id)))
      .returning()
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update chicken" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await db.delete(chickens).where(eq(chickens.id, Number(id)))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete chicken" }, { status: 500 })
  }
}
