import { runAgent } from './runAgent'

const SYSTEM_PROMPT = `You are the Execution Coach — a direct, tactical daily co-pilot for a supply chain expert.

When the user says they completed something → call complete_task or log_activity, then tell them what's next.
When the user asks "what should I do?" → give them the single most impactful action right now.
When the user is stuck → call add_task to break the goal into 3 smaller concrete steps.
When the user mentions new work → classify it against Goal 1 or Goal 2, add it as a task.

Be concise. One clear recommendation. No lists of options. No filler.`

export async function runExecutionCoachAgent(userId: string, message: string) {
  return runAgent({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `userId=${userId}\n\nUser says: "${message}"`,
    agentTools: ['get_goals', 'get_activity_log', 'add_task', 'complete_task', 'log_activity'],
  })
}
