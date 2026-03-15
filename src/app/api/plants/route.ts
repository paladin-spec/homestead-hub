import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { plants } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const results = await db.select().from(plants).orderBy(desc(plants.createdAt))
    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch plants" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await db
      .insert(plants)
      .values({
        name: body.name,
        variety: body.variety ?? null,
        location: body.location ?? null,
        plantedDate: body.plantedDate ?? null,
        stage: body.stage ?? "seeded",
        plantCount: body.plantCount != null ? Number(body.plantCount) : 1,
        notes: body.notes ?? null,
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create plant" }, { status: 500 })
  }
}
