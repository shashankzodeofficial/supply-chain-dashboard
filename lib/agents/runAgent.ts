import Anthropic from '@anthropic-ai/sdk'
import { allTools } from './tools'
import { executeTool } from './toolExecutor'

export async function runAgent({
  systemPrompt,
  userMessage,
  agentTools,
  maxIterations = 10,
}: {
  systemPrompt: string
  userMessage: string
  agentTools: string[]
  maxIterations?: number
}) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const tools = allTools.filter(t => agentTools.includes(t.name))
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userMessage }
  ]

  let iterations = 0

  while (iterations < maxIterations) {
    iterations++

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    })

    if (response.stop_reason === 'end_turn') {
      return response.content
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      )

      const toolResults = await Promise.all(
        toolUseBlocks.map(t => executeTool(t.name, t.input as Record<string, unknown>))
      )

      messages.push(
        { role: 'assistant', content: response.content },
        {
          role: 'user',
          content: toolResults.map((result, i) => ({
            type: 'tool_result' as const,
            tool_use_id: toolUseBlocks[i].id,
            content: JSON.stringify(result),
          })),
        }
      )
    }
  }

  throw new Error('Agent exceeded max iterations')
}
