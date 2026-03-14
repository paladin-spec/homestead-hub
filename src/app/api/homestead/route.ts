import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { homestead } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const results = await db.select().from(homestead).limit(1)
    if (results.length === 0) {
      // Auto-create default homestead
      const created = await db
        .insert(homestead)
        .values({ name: "My Homestead" })
        .returning()
      return NextResponse.json(created[0])
    }
    return NextResponse.json(results[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch homestead" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const results = await db.select().from(homestead).limit(1)
    if (results.length === 0) {
      const created = await db
        .insert(homestead)
        .values({ name: body.name ?? "My Homestead", location: body.location, description: body.description })
        .returning()
      return NextResponse.json(created[0])
    }
    const updated = await db
      .update(homestead)
      .set({ name: body.name, location: body.location, description: body.description, updatedAt: new Date() })
      .where(eq(homestead.id, results[0].id))
      .returning()
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update homestead" }, { status: 500 })
  }
}
