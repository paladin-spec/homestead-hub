import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { equipment } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const results = await db.select().from(equipment).orderBy(desc(equipment.createdAt))
    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await db
      .insert(equipment)
      .values({
        name: body.name,
        type: body.type ?? null,
        make: body.make ?? null,
        model: body.model ?? null,
        year: body.year ?? null,
        serialNumber: body.serialNumber ?? null,
        notes: body.notes ?? null,
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
  }
}
