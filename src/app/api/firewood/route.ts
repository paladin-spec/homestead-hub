import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { firewoodEntries } from "@/lib/schema"
import { desc } from "drizzle-orm"

// BTU per cord estimates by species (million BTU)
const BTU_PER_CORD: Record<string, number> = {
  "Black Locust": 26.8,
  "Osage Orange": 32.9,
  "Hickory": 27.7,
  "Apple": 27.0,
  "Oak (White)": 25.7,
  "Oak (Red)": 24.0,
  "Beech": 24.0,
  "Hard Maple": 24.0,
  "Black Birch": 23.8,
  "Yellow Birch": 21.8,
  "Ash (White)": 23.6,
  "Ash (Green)": 20.0,
  "Walnut": 22.2,
  "Cherry": 20.4,
  "Tamarack": 20.8,
  "Douglas Fir": 20.7,
  "Red Maple": 18.6,
  "Elm (American)": 19.5,
  "Sycamore": 19.5,
  "Red Alder": 17.5,
  "Soft Maple": 18.6,
  "Paper Birch": 20.2,
  "Black Cherry": 20.4,
  "Catalpa": 16.4,
  "Cottonwood": 13.5,
  "Pine (Eastern White)": 13.3,
  "Pine (Red)": 17.1,
  "Spruce": 15.5,
  "Cedar (White)": 12.2,
  "Cedar (Red)": 13.0,
  "Aspen": 14.7,
  "Basswood": 13.8,
  "Willow": 17.0,
}

// Calculate volume of a cylinder in cubic feet
function cylinderVolumeCubicFeet(diameterInches: number, lengthInches: number): number {
  const radiusFt = (diameterInches / 2) / 12
  const lengthFt = lengthInches / 12
  return Math.PI * radiusFt * radiusFt * lengthFt
}

// One cord = 128 cubic feet (stacked), but solid wood is ~80 cubic feet (~62.5% packing)
const SOLID_WOOD_PER_CORD = 80 // cubic feet of solid wood per cord

export function calculateCords(diameterInches: number, lengthInches: number, pieceCount: number): number {
  const volumePerPiece = cylinderVolumeCubicFeet(diameterInches, lengthInches)
  const totalVolume = volumePerPiece * pieceCount
  return totalVolume / SOLID_WOOD_PER_CORD
}

export function calculateBTU(species: string, cords: number): number | null {
  const btuPerCord = BTU_PER_CORD[species]
  if (!btuPerCord) return null
  return btuPerCord * cords * 1_000_000 // convert million BTU to BTU
}

export const WOOD_SPECIES = Object.keys(BTU_PER_CORD).sort()

export async function GET() {
  try {
    const results = await db.select().from(firewoodEntries).orderBy(desc(firewoodEntries.collectedAt))
    return NextResponse.json(results)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch firewood entries" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const diameter = Number(body.diameterInches)
    const length = Number(body.lengthInches)
    const pieces = Number(body.pieceCount ?? 1)
    const cords = calculateCords(diameter, length, pieces)
    const btu = calculateBTU(body.species, cords)

    const created = await db
      .insert(firewoodEntries)
      .values({
        species: body.species,
        diameterInches: String(diameter),
        lengthInches: String(length),
        pieceCount: pieces,
        cordsEstimate: String(cords),
        btuEstimate: btu !== null ? String(btu) : null,
        notes: body.notes ?? null,
        collectedAt: body.collectedAt ? new Date(body.collectedAt) : new Date(),
      })
      .returning()
    return NextResponse.json(created[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create firewood entry" }, { status: 500 })
  }
}
