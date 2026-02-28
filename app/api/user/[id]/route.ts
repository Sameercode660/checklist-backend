// app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// ── GET /api/users/:id ───────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  const {id} = await params
  const user = await prisma.user.findUnique({
    where: { id},
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      restaurants: {
        select: {
          restaurant: {
            select: { id: true, name: true, storeCode: true, address: true }
          }
        }
      },
      _count: {
        select: { inspections: true }
      }
    }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

// ── PATCH /api/users/:id ─────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json()
  const { name, phone } = body
  const {id} = await params
  const user = await prisma.user.update({
    where: { id},
    data: {
      ...(name  && { name }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      updatedAt: true,
    }
  })

  return NextResponse.json(user)
}

// ── DELETE /api/users/:id ────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const {id} = await params
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ message: 'User deleted successfully' })
}