import { prisma } from '@/lib/prisma'
import { GoalStream, GoalStatus, Priority, ActivityType, AlertType } from '@prisma/client'

export async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_goals': {
      return prisma.goal.findMany({
        where: {
          deletedAt: null,
          ...(input.status ? { status: input.status as GoalStatus } : {}),
          ...(input.goalStream ? { goalStream: input.goalStream as GoalStream } : {}),
        },
        include: { tasks: true },
      })
    }

    case 'get_activity_log': {
      const days = (input.days as number) ?? 7
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      return prisma.activityLog.findMany({
        where: {
          createdAt: { gte: cutoff },
          ...(input.goalId ? { goalId: input.goalId as string } : {}),
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    case 'update_goal_priority': {
      return prisma.goal.update({
        where: { id: input.goalId as string },
        data: { priority: input.priority as Priority },
      })
    }

    case 'create_weekly_plan': {
      return prisma.weeklyPlan.create({
        data: {
          userId: input.userId as string,
          weekStart: new Date(),
          focusGoalIds: input.focusGoalIds as string[],
          deferGoalIds: input.deferGoalIds as string[],
          risks: input.risks as string[],
          topActions: input.topActions as object,
        },
      })
    }

    case 'create_alert': {
      return prisma.alert.create({
        data: {
          userId: input.userId as string,
          goalId: (input.goalId as string) ?? null,
          type: input.type as AlertType,
          message: input.message as string,
        },
      })
    }

    case 'add_task': {
      return prisma.task.create({
        data: {
          goalId: input.goalId as string,
          title: input.title as string,
          dueDate: input.dueDate ? new Date(input.dueDate as string) : null,
        },
      })
    }

    case 'complete_task': {
      return prisma.task.update({
        where: { id: input.taskId as string },
        data: { done: true, completedAt: new Date() },
      })
    }

    case 'log_activity': {
      return prisma.activityLog.create({
        data: {
          goalId: input.goalId as string,
          type: input.type as ActivityType,
          prevValue: (input.prevValue as string) ?? null,
          newValue: (input.newValue as string) ?? null,
        },
      })
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
