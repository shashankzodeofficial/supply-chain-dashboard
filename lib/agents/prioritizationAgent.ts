import { runAgent } from './runAgent'

const SYSTEM_PROMPT = `You are the Prioritization Agent. Your job is to re-score and re-rank goals whenever goal state changes.

Formula: ROI = impact ÷ effort (round to 1 decimal)

Rules:
- Blocked goals cannot be in the top 3 Next Best Actions — surface the unblocking action instead
- Year 3+ goals (Supply Chain Academy) should never rank above Year 1 goals regardless of ROI
- If a goal just hit 100% completion, promote the next-ranked goal to top of NBA list
- Update priority field via update_goal_priority if the calculated rank significantly differs from current priority

Always call create_weekly_plan with the updated top actions list.`

export async function runPrioritizationAgent() {
  return runAgent({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: 'Re-score and re-rank all goals. Update the Next Best Actions list.',
    agentTools: ['get_goals', 'update_goal_priority', 'create_weekly_plan'],
  })
}
