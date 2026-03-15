import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { plants, chickens, firewoodEntries, equipment, maintenanceLogs } from "@/lib/schema"
import { or, ilike, eq } from "drizzle-orm"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""

  if (q.length < 2) {
    return NextResponse.json({ plants: [], chickens: [], firewood: [], equipment: [], maintenance: [] })
  }

  const like = `%${q}%`

  try {
    const [plantsRes, chickensRes, firewoodRes, equipmentRes, maintenanceRes] = await Promise.all([
      db
        .select()
        .from(plants)
        .where(
          or(
            ilike(plants.name, like),
            ilike(plants.variety, like),
            ilike(plants.location, like),
            ilike(plants.notes, like),
          )
        )
        .limit(8),

      db
        .select()
        .from(chickens)
        .where(
          or(
            ilike(chickens.name, like),
            ilike(chickens.breed, like),
            ilike(chickens.notes, like),
          )
        )
        .limit(8),

      db
        .select()
        .from(firewoodEntries)
        .where(
          or(
            ilike(firewoodEntries.species, like),
            ilike(firewoodEntries.notes, like),
          )
        )
        .limit(8),

      db
        .select()
        .from(equipment)
        .where(
          or(
            ilike(equipment.name, like),
            ilike(equipment.make, like),
            ilike(equipment.model, like),
            ilike(equipment.type, like),
            ilike(equipment.serialNumber, like),
            ilike(equipment.notes, like),
          )
        )
        .limit(8),

      // Maintenance logs joined with equipment name
      db
        .select({
          id: maintenanceLogs.id,
          equipmentId: maintenanceLogs.equipmentId,
          type: maintenanceLogs.type,
          description: maintenanceLogs.description,
          performedBy: maintenanceLogs.performedBy,
          notes: maintenanceLogs.notes,
          performedAt: maintenanceLogs.performedAt,
          equipmentName: equipment.name,
        })
        .from(maintenanceLogs)
        .innerJoin(equipment, eq(maintenanceLogs.equipmentId, equipment.id))
        .where(
          or(
            ilike(maintenanceLogs.description, like),
            ilike(maintenanceLogs.type, like),
            ilike(maintenanceLogs.performedBy, like),
            ilike(maintenanceLogs.notes, like),
          )
        )
        .limit(8),
    ])

    return NextResponse.json({
      plants: plantsRes,
      chickens: chickensRes,
      firewood: firewoodRes,
      equipment: equipmentRes,
      maintenance: maintenanceRes,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
