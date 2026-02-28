

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── GET /api/inspections?userId= ─────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const inspections = await prisma.inspection.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      restaurant: { select: { id: true, name: true, storeCode: true } },
      user: { select: { id: true, name: true } },
      _count: { select: { answers: true } },
    },
  })

  // Calculate stats
  const completed  = inspections.filter(i => i.status === 'COMPLETED').length
  const inProgress = inspections.filter(i => i.status === 'IN_PROGRESS').length
  const voided     = inspections.filter(i => i.status === 'VOIDED').length

  return NextResponse.json({ stats: { completed, inProgress, voided }, inspections })
}

// ── POST /api/inspections ─────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, restaurantId } = body

  if (!userId || !restaurantId) {
    return NextResponse.json(
      { error: 'userId and restaurantId are required' },
      { status: 400 }
    )
  }

  const inspection = await prisma.inspection.create({
    data: { userId, restaurantId },
    include: {
      restaurant: { select: { id: true, name: true, storeCode: true } },
      user: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(inspection, { status: 201 })
}