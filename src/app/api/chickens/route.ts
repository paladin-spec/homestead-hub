import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chickens } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"

export async function GET() {
  try {
    const results = await db.select().from(chickens).orderBy(desc(chickens.createdAt))
    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch chickens" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await db
      .insert(chickens)
      .values({
        name: body.name,
        breed: body.breed ?? null,
        hatchDate: body.hatchDate ?? null,
        notes: body.notes ?? null,
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create chicken" }, { status: 500 })
  }
}
