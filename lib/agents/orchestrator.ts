import { prisma } from '@/lib/prisma'
import { runPlanningAgent } from './planningAgent'
import { runPrioritizationAgent } from './prioritizationAgent'
import { runRiskDetectionAgent } from './riskAgent'
import { runExecutionCoachAgent } from './coachAgent'

type Trigger =
  | { type: 'cron_daily' }
  | { type: 'cron_weekly' }
  | { type: 'goal_updated'; goalId: string }
  | { type: 'user_message'; userId: string; message: string }

export async function orchestrate(trigger: Trigger) {
  switch (trigger.type) {
    case 'cron_daily':
      await runRiskDetectionAgent()
      break

    case 'cron_weekly':
      await runPlanningAgent()
      await runPrioritizationAgent()
      break

    case 'goal_updated':
      await runPrioritizationAgent()
      break

    case 'user_message':
      return runExecutionCoachAgent(trigger.userId, trigger.message)
  }
}
