import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// ── GET /api/restaurants/:id ─────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {

  const {id} = await params
  const restaurant = await prisma.restaurant.findUnique({
    where: { id},
    include: {
      _count: {
        select: {
          users:       true,
          inspections: true,
        },
      },
    },
  })

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  }

  return NextResponse.json(restaurant)
}

// ── PATCH /api/restaurants/:id ───────────────────────────────

// Partial update — only send fields you want to change
export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json()
  const {id} = await params
  const { name, address, phone, email, storeCode, managerName } = body

  // If storeCode is being changed, make sure it's not already taken
  if (storeCode) {
    const existing = await prisma.restaurant.findFirst({
      where: { storeCode, NOT: { id } },
    })
    if (existing) {
      return NextResponse.json(
        { error: `Store code "${storeCode}" is already in use` },
        { status: 409 }
      )
    }
  }

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: {
      ...(name        && { name }),
      ...(address     && { address }),
      ...(phone       && { phone }),
      ...(email       && { email }),
      ...(storeCode   && { storeCode }),
      ...(managerName && { managerName }),
    },
  })

  return NextResponse.json(restaurant)
}

// ── DELETE /api/restaurants/:id ──────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const {id } = await params
  await prisma.restaurant.delete({ where: { id } })
  return NextResponse.json({ message: 'Restaurant deleted successfully' })
}