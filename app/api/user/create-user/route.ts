// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── GET /api/users ───────────────────────────────────────────
export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      restaurants: {
        select: {
          restaurant: {
            select: { id: true, name: true, storeCode: true }
          }
        }
      }
    }
  })
  return NextResponse.json(users)
}

// ── POST /api/users ──────────────────────────────────────────
// Body: { name, email, password, phone?, storeCode }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, password, phone, storeCode } = body

  console.log(body)
  // Validate required fields
  if (!name || !email || !password || !storeCode) {
    return NextResponse.json(
      { error: 'name, email, password and storeCode are required' },
      { status: 400 }
    )
  }

  // Check email is not already taken
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json(
      { error: 'A user with this email already exists' },
      { status: 409 }
    )
  }

  // Find restaurant by storeCode
  const restaurant = await prisma.restaurant.findUnique({ where: { storeCode } })
  if (!restaurant) {
    return NextResponse.json(
      { error: `No restaurant found with store code "${storeCode}"` },
      { status: 404 }
    )
  }

  // Create user and link to restaurant in one transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name,
        email,
        passwordHash: password, // plain text for now
        phone: phone ?? null,
      },
    })

    await tx.restaurantUser.create({
      data: {
        userId: newUser.id,
        restaurantId: restaurant.id,
      },
    })

    return newUser
  })

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      storeCode: restaurant.storeCode,
    },
    createdAt: user.createdAt,
  }, { status: 201 })
}