

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { answers } = body

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: 'answers array is required' }, { status: 400 })
  }

  // ── 1. Check inspection exists ──────────────────────────────
  const inspection = await prisma.inspection.findUnique({ where: { id } })

  if (!inspection) {
    return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
  }
  if (inspection.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Inspection is already completed or voided' }, { status: 409 })
  }

  // ── 2. Load templates once (outside transaction) ────────────
  const templates = await prisma.checklistTemplate.findMany({
    include: { subItems: true },
  })
  const templateMap = Object.fromEntries(templates.map(t => [t.code, t]))

  // ── 3. Calculate scores (outside transaction) ───────────────
  let totalScore = 0
  let maxScore = 0
  let hasCriticalFail = false

  for (const ans of answers) {
    const template = templateMap[ans.templateCode]
    if (!template) continue
    maxScore += template.points
    if (ans.answer === 'YES') totalScore += template.points
    if (ans.answer === 'NO' && template.isCritical) hasCriticalFail = true
  }

  // ── 4. Delete existing answers for this inspection ──────────

  const existingAnswers = await prisma.checklistAnswer.findMany({
    where: { inspectionId: id },
    select: { id: true },
  })

  if (existingAnswers.length > 0) {
    const answerIds = existingAnswers.map(a => a.id)
    // Delete sub items first
    await prisma.selectedSubItem.deleteMany({
      where: { answerId: { in: answerIds } },
    })
    await prisma.checklistAnswer.deleteMany({
      where: { inspectionId: id },
    })
  }

  // ── 5. Bulk create all answers ──────────────────────────────
  const validAnswers = answers.filter(ans => templateMap[ans.templateCode])

  await prisma.checklistAnswer.createMany({
    data: validAnswers.map(ans => ({
      inspectionId: id,
      templateId:   templateMap[ans.templateCode].id,
      answer:       ans.answer,
      notes:        ans.notes ?? null,
    })),
  })

  // ── 6. Fetch created answer IDs for sub-item linking ────────
  const createdAnswers = await prisma.checklistAnswer.findMany({
    where: { inspectionId: id },
    select: { id: true, templateId: true },
  })

  const answerByTemplateId = Object.fromEntries(
    createdAnswers.map(a => [a.templateId, a.id])
  )

  // ── 7. Bulk create selected sub items ───────────────────────
  const subItemsToCreate: { answerId: string; subItemId: string }[] = []

  for (const ans of validAnswers) {
    if (!ans.selectedSubItems?.length) continue
    const template = templateMap[ans.templateCode]
    const answerId = answerByTemplateId[template.id]
    if (!answerId) continue

    for (const subItem of template.subItems) {
      if (ans.selectedSubItems.includes(subItem.label)) {
        subItemsToCreate.push({ answerId, subItemId: subItem.id })
      }
    }
  }

  if (subItemsToCreate.length > 0) {
    await prisma.selectedSubItem.createMany({ data: subItemsToCreate })
  }

  // ── 8. Mark inspection complete ─────────────────────────────
  await prisma.inspection.update({
    where: { id },
    data: {
      status:         'COMPLETED',
      totalScore,
      maxScore,
      hasCriticalFail,
      completedAt:    new Date(),
    },
  })

  return NextResponse.json({
    message:        'Inspection submitted successfully',
    inspectionId:   id,
    totalScore,
    maxScore,
    hasCriticalFail,
  })
}