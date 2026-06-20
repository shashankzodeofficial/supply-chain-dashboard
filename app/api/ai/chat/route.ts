import { streamText } from 'ai'

export const dynamic = 'force-dynamic'
import { createAnthropic } from '@ai-sdk/anthropic'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { topNextBestActions, stalledGoals, roiScore } from '@/lib/scoring'
import type { Goal } from '@/types'

export async function POST(req: Request) {
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages } = await req.json()

  const rawGoals = await prisma.goal.findMany({
    where: { userId: user.id, deletedAt: null },
    include: { tasks: true },
  })

  const recentActivity = await prisma.activityLog.findMany({
    where: { goal: { userId: user.id } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const goals = rawGoals as unknown as Goal[]
  const topActions = topNextBestActions(goals, 3)
  const stalled = stalledGoals(goals, 7)

  const systemPrompt = `You are the AI Chief of Staff for Shashank, a supply chain expert building a logistics technology business.

CURRENT GOALS (${goals.length} total):
${goals.map(g => `- ${g.name} [${g.goalStream}] status=${g.status} completion=${g.completion}% ROI=${roiScore(g.impact, g.effort)} nextAction="${g.nextAction}"`).join('\n')}

TOP 3 NEXT BEST ACTIONS (by ROI score):
${topActions.map((g, i) => `${i + 1}. ${g.name} (ROI ${roiScore(g.impact, g.effort)}) — ${g.nextAction}`).join('\n')}

${stalled.length > 0 ? `STALLED GOALS (no update in 7+ days):\n${stalled.map(g => `- ${g.name}`).join('\n')}` : 'No stalled goals.'}

RECENT ACTIVITY (last 10 entries):
${recentActivity.map(a => `- ${a.type}: ${a.newValue} (${new Date(a.createdAt).toLocaleDateString()})`).join('\n')}

TODAY: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

RULES:
- Always recommend the highest ROI action first (impact ÷ effort)
- Flag any goal not updated in 7+ days as stalled
- If user mentions completing something, confirm it and suggest what's next
- Detect goal drift: warn if work is outside Goal 1 (logistics ecosystem) or Goal 2 (OMS)
- Be direct and tactical. No motivational filler. Short, actionable answers.
- Year 1 focus: LinkedIn content, website, exception library, mechanism framework.
- Year 2+ focus: SaaS products (control tower, delivery app, OMS, AI copilot).`

  const result = await streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: systemPrompt,
    messages,
    maxOutputTokens: 1024,
  })

  return result.toTextStreamResponse()
}
