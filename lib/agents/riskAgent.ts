import { runAgent } from './runAgent'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT = `You are the Risk Detection Agent for a supply chain expert's goal tracking system.

Your job: every day, scan for risks and create alerts.

Check for:
1. STALL — any goal with no activity in 7+ days (except NOT_STARTED goals in future years)
2. DEADLINE — any goal with targetDate within 14 days that is below 50% completion
3. DRIFT — recent activity log entries that relate to work outside Goal 1 (logistics ecosystem) or Goal 2 (OMS)
4. BLOCKER — AI Copilot (GOAL_1) is blocked by Exception Library — alert if Exception Library hasn't been touched in 7 days

For each risk found, call create_alert with a clear, actionable message.
If no risks found, do nothing. Do not create false positives.`

export async function runRiskDetectionAgent() {
  const users = await prisma.goal.findMany({
    distinct: ['userId'],
    select: { userId: true },
    where: { deletedAt: null },
  })

  for (const { userId } of users) {
    await runAgent({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: `Run risk detection for userId=${userId}. Today: ${new Date().toISOString()}`,
      agentTools: ['get_goals', 'get_activity_log', 'create_alert', 'log_activity'],
    })
  }
}
