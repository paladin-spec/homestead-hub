import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chickenLogs } from "@/lib/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const results = await db.select().from(chickenLogs).orderBy(desc(chickenLogs.loggedAt))
    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch chicken logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const created = await db
      .insert(chickenLogs)
      .values({
        type: body.type,
        notes: body.notes ?? null,
        loggedAt: body.loggedAt ? new Date(body.loggedAt) : new Date(),
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create chicken log" }, { status: 500 })
  }
}
