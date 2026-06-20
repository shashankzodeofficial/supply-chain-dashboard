import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const CreateGoalSchema = z.object({
  name: z.string().min(1),
  goalStream: z.enum(['GOAL_1', 'GOAL_2']),
  category: z.enum(['STRATEGY', 'EXECUTION', 'OPERATIONS', 'LEARNING']),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED']).default('NOT_STARTED'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  impact: z.number().int().min(1).max(10),
  effort: z.number().int().min(1).max(10),
  completion: z.number().int().min(0).max(100).default(0),
  timeline: z.string(),
  targetDate: z.string().datetime().optional(),
  nextAction: z.string(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const stream = searchParams.get('stream')
  const status = searchParams.get('status')

  const goals = await prisma.goal.findMany({
    where: {
      userId: user.id,
      deletedAt: null,
      ...(stream ? { goalStream: stream as 'GOAL_1' | 'GOAL_2' } : {}),
      ...(status ? { status: status as 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' } : {}),
    },
    include: { tasks: true },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateGoalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const goal = await prisma.goal.create({
    data: { ...parsed.data, userId: user.id },
  })

  await prisma.activityLog.create({
    data: { goalId: goal.id, type: 'GOAL_CREATED', newValue: JSON.stringify({ name: goal.name }) },
  })

  return NextResponse.json(goal, { status: 201 })
}
