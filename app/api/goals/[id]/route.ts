import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const UpdateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  completion: z.number().int().min(0).max(100).optional(),
  nextAction: z.string().optional(),
  notes: z.string().optional(),
  impact: z.number().int().min(1).max(10).optional(),
  effort: z.number().int().min(1).max(10).optional(),
})

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const goal = await prisma.goal.findFirst({
    where: { id: params.id, userId: user.id, deletedAt: null },
    include: {
      tasks: { orderBy: { createdAt: 'asc' } },
      activityLogs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(goal)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.goal.findFirst({ where: { id: params.id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = UpdateGoalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const updated = await prisma.goal.update({
    where: { id: params.id },
    data: parsed.data,
  })

  // Write delta to activity log
  if (parsed.data.status && parsed.data.status !== existing.status) {
    await prisma.activityLog.create({
      data: {
        goalId: params.id,
        type: 'STATUS_CHANGE',
        prevValue: existing.status,
        newValue: parsed.data.status,
      },
    })
  }
  if (parsed.data.completion !== undefined && parsed.data.completion !== existing.completion) {
    await prisma.activityLog.create({
      data: {
        goalId: params.id,
        type: 'PROGRESS_UPDATE',
        prevValue: String(existing.completion),
        newValue: String(parsed.data.completion),
      },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.goal.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
