

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }


// Returns full inspection detail with all answers, sub-items, scores
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const inspection = await prisma.inspection.findUnique({
    where: { id },
    include: {
      restaurant: { select: { id: true, name: true, storeCode: true, address: true } },
      user:       { select: { id: true, name: true, email: true } },
      answers: {
        include: {
          template: {
            include: {
              subItems: { orderBy: { sortOrder: 'asc' } },
            },
          },
          selectedSubItems: {
            include: {
              subItem: { select: { id: true, label: true } },
            },
          },
        },
        orderBy: { template: { sortOrder: 'asc' } },
      },
    },
  })

  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
  }

  // Shape the response cleanly for the mobile app
  const sections = [
    { title: 'Critical Food Safety',     codes: ['FS1','FS2','FS3','FS4','FS5','FS6','FS7','FS8'] },
    { title: 'Hygiene & Sanitation',     codes: ['FS9','FS10','FS11','FS12','FS13'] },
    { title: 'Contamination Prevention', codes: ['FS14','FS15','FS16','FS17','FS18','FS19','FS20','FS21','FS22'] },
    { title: 'Storage',                  codes: ['FS23','FS24','FS25','FS26'] },
    { title: 'Cooking',                  codes: ['FS27'] },
    { title: 'General',                  codes: ['FS28','FS29','FS30','FS31','FS32','FS33'] },
  ]

  const answerMap = Object.fromEntries(
    inspection.answers.map(a => [a.template.code, a])
  )

  const groupedSections = sections.map(section => ({
    title: section.title,
    items: section.codes.map(code => {
      const answer = answerMap[code]
      if (!answer) return null
      return {
        code,
        title:             answer.template.title,
        description:       answer.template.description,
        points:            answer.template.points,
        isCritical:        answer.template.isCritical,
        answer:            answer.answer,           // YES | NO | UNANSWERED
        notes:             answer.notes,
        earnedPoints:      answer.answer === 'YES' ? answer.template.points : 0,
        selectedSubItems:  answer.selectedSubItems.map(s => s.subItem.label),
        allSubItems:       answer.template.subItems.map(s => s.label),
      }
    }).filter(Boolean),
  }))

  return NextResponse.json({
    id:             inspection.id,
    status:         inspection.status,
    totalScore:     inspection.totalScore,
    maxScore:       inspection.maxScore,
    hasCriticalFail: inspection.hasCriticalFail,
    startedAt:      inspection.startedAt,
    completedAt:    inspection.completedAt,
    restaurant:     inspection.restaurant,
    user:           inspection.user,
    sections:       groupedSections,
    summary: {
      totalAnswered: inspection.answers.length,
      passed:  inspection.answers.filter(a => a.answer === 'YES').length,
      failed:  inspection.answers.filter(a => a.answer === 'NO').length,
    },
  })
}