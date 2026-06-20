import Anthropic from '@anthropic-ai/sdk'

export const allTools: Anthropic.Tool[] = [
  {
    name: 'get_goals',
    description: 'Fetch all goals from the database. Optionally filter by status or goal stream.',
    input_schema: {
      type: 'object' as const,
      properties: {
        status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'] },
        goalStream: { type: 'string', enum: ['GOAL_1', 'GOAL_2'] },
      },
    },
  },
  {
    name: 'get_activity_log',
    description: 'Fetch recent activity log entries for goal delta detection and drift analysis.',
    input_schema: {
      type: 'object' as const,
      properties: {
        days: { type: 'number', description: 'How many days back to fetch. Default 7.' },
        goalId: { type: 'string', description: 'Filter to a specific goal.' },
      },
    },
  },
  {
    name: 'update_goal_priority',
    description: 'Override the priority of a goal based on planning analysis.',
    input_schema: {
      type: 'object' as const,
      required: ['goalId', 'priority', 'reason'],
      properties: {
        goalId: { type: 'string' },
        priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
        reason: { type: 'string', description: 'Why this priority was assigned.' },
      },
    },
  },
  {
    name: 'create_weekly_plan',
    description: 'Write the weekly execution plan to the database. Used by Planning Agent every Monday.',
    input_schema: {
      type: 'object' as const,
      required: ['userId', 'focusGoalIds', 'deferGoalIds', 'risks', 'topActions'],
      properties: {
        userId: { type: 'string' },
        focusGoalIds: { type: 'array', items: { type: 'string' } },
        deferGoalIds: { type: 'array', items: { type: 'string' } },
        risks: { type: 'array', items: { type: 'string' } },
        topActions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              goalId: { type: 'string' },
              actionText: { type: 'string' },
              score: { type: 'number' },
            },
          },
        },
      },
    },
  },
  {
    name: 'create_alert',
    description: 'Write a risk or drift alert to the database. Shown as a banner in the dashboard.',
    input_schema: {
      type: 'object' as const,
      required: ['userId', 'type', 'message'],
      properties: {
        userId: { type: 'string' },
        goalId: { type: 'string' },
        type: { type: 'string', enum: ['STALL', 'DEADLINE', 'DRIFT', 'BLOCKER'] },
        message: { type: 'string' },
      },
    },
  },
  {
    name: 'add_task',
    description: 'Add a concrete task to a goal. Used by Execution Coach to break down goals.',
    input_schema: {
      type: 'object' as const,
      required: ['goalId', 'title'],
      properties: {
        goalId: { type: 'string' },
        title: { type: 'string' },
        dueDate: { type: 'string', description: 'ISO date string.' },
      },
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as done and record the completion timestamp.',
    input_schema: {
      type: 'object' as const,
      required: ['taskId'],
      properties: {
        taskId: { type: 'string' },
      },
    },
  },
  {
    name: 'log_activity',
    description: 'Write an activity log entry recording what an agent did.',
    input_schema: {
      type: 'object' as const,
      required: ['goalId', 'type'],
      properties: {
        goalId: { type: 'string' },
        type: { type: 'string', enum: ['STATUS_CHANGE', 'PROGRESS_UPDATE', 'TASK_COMPLETED', 'NOTE_ADDED', 'GOAL_CREATED'] },
        prevValue: { type: 'string' },
        newValue: { type: 'string' },
      },
    },
  },
]
