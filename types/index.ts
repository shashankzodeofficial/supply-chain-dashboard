export type GoalStream = 'GOAL_1' | 'GOAL_2'
export type Category = 'STRATEGY' | 'EXECUTION' | 'OPERATIONS' | 'LEARNING'
export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type AlertType = 'STALL' | 'DEADLINE' | 'DRIFT' | 'BLOCKER'

export interface Goal {
  id: string
  userId: string
  name: string
  goalStream: GoalStream
  category: Category
  status: GoalStatus
  priority: Priority
  impact: number
  effort: number
  completion: number
  timeline: string
  targetDate: Date | null
  nextAction: string
  notes: string | null
  createdAt: Date
  updatedAt: Date
  tasks?: Task[]
}

export interface Task {
  id: string
  goalId: string
  title: string
  done: boolean
  dueDate: Date | null
  completedAt: Date | null
  createdAt: Date
}

export interface ActivityLog {
  id: string
  goalId: string
  type: 'STATUS_CHANGE' | 'PROGRESS_UPDATE' | 'TASK_COMPLETED' | 'NOTE_ADDED' | 'GOAL_CREATED'
  prevValue: string | null
  newValue: string | null
  createdAt: Date
}

export interface Alert {
  id: string
  userId: string
  goalId: string | null
  type: AlertType
  message: string
  dismissed: boolean
  createdAt: Date
}

export interface WeeklyPlan {
  id: string
  userId: string
  weekStart: Date
  focusGoalIds: string[]
  deferGoalIds: string[]
  risks: string[]
  topActions: { goalId: string; actionText: string; score: number }[]
  createdAt: Date
}

export interface FilterState {
  tab: 'all' | 'goal1' | 'goal2' | 'year1' | 'highROI'
  sortBy: 'roi' | 'priority' | 'timeline'
}

export function roiScore(goal: Pick<Goal, 'impact' | 'effort'>): number {
  return Math.round((goal.impact / goal.effort) * 10) / 10
}

export function statusColor(status: GoalStatus): string {
  const map: Record<GoalStatus, string> = {
    NOT_STARTED: 'gray',
    IN_PROGRESS: 'blue',
    BLOCKED: 'red',
    COMPLETED: 'green',
  }
  return map[status]
}

export function categoryColor(category: Category): string {
  const map: Record<Category, string> = {
    STRATEGY: 'purple',
    EXECUTION: 'green',
    OPERATIONS: 'amber',
    LEARNING: 'blue',
  }
  return map[category]
}
