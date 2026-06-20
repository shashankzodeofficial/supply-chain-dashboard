import { runAgent } from './runAgent'

const SYSTEM_PROMPT = `You are the Planning Agent for a supply chain expert's personal command center.

Your job: every Monday, analyze all goals and produce a structured weekly execution plan.

Rules:
- Focus goals = highest ROI (impact ÷ effort ≥ 1.5) that are not blocked
- Defer goals = Year 2+ initiatives when we are still in Year 1
- Risks = goals that are blocked, stalled, or have a dependency not yet met
- Top 3 actions = the single most important next step for the 3 highest-priority goals
- Be tactical, not motivational. No filler.

Always call create_weekly_plan at the end with your analysis.`

export async function runPlanningAgent() {
  return runAgent({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: 'Generate this week\'s execution plan based on current goal state.',
    agentTools: ['get_goals', 'get_activity_log', 'create_weekly_plan', 'update_goal_priority'],
  })
}
