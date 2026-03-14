import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { eggCollections } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const results = await db.select().from(eggCollections).orderBy(desc(eggCollections.collectedAt))
    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch egg collections" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await db
      .insert(eggCollections)
      .values({
        count: body.count,
        notes: body.notes ?? null,
        collectedAt: body.collectedAt ? new Date(body.collectedAt) : new Date(),
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to log egg collection" }, { status: 500 })
  }
}
