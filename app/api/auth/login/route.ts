
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'email and password are required' },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      restaurants: {
        include: {
          restaurant: {
            select: { id: true, name: true, storeCode: true }
          }
        }
      }
    }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }


  if (user.passwordHash !== password) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    )
  }


  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    restaurant: user.restaurants[0]?.restaurant ?? null,
  })
}