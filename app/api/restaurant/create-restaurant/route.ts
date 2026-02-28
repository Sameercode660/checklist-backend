import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, address, phone, email, storeCode, managerName } = body

  // Validate all required fields
  if (!name || !address || !phone || !email || !storeCode || !managerName) {
    return NextResponse.json(
      { error: 'All fields are required: name, address, phone, email, storeCode, managerName' },
      { status: 400 }
    )
  }

  // storeCode must be unique — catch duplicate before Prisma throws
  const existing = await prisma.restaurant.findUnique({
    where: { storeCode },
  })
  if (existing) {
    return NextResponse.json(
      { error: `Store code "${storeCode}" is already in use` },
      { status: 409 }
    )
  }
  

  const restaurant = await prisma.restaurant.create({
    data: { name, address, phone, email, storeCode, managerName },
  })

  return NextResponse.json(restaurant, { status: 201 })
}

// get api 

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(restaurants)
}
