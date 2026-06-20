import type { Goal } from '@/types'

export function roiScore(impact: number, effort: number): number {
  return Math.round((impact / effort) * 10) / 10
}

export function scoreAndRank(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => roiScore(b.impact, b.effort) - roiScore(a.impact, a.effort))
}

export function topNextBestActions(goals: Goal[], limit = 3) {
  return scoreAndRank(
    goals.filter(g => g.status !== 'COMPLETED')
  ).slice(0, limit)
}

export function stalledGoals(goals: Goal[], days = 7): Goal[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return goals.filter(g =>
    g.status !== 'COMPLETED' && new Date(g.updatedAt) < cutoff
  )
}

export function getROITier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 2.0) return 'high'
  if (score >= 1.3) return 'medium'
  return 'low'
}
