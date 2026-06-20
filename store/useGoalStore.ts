import { create } from 'zustand'
import type { Goal, FilterState } from '@/types'

interface GoalStore {
  goals: Goal[]
  isLoading: boolean
  selectedGoalId: string | null
  lastUpdated: Date | null
  filter: FilterState

  fetchGoals: () => Promise<void>
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  selectGoal: (id: string | null) => void
  setFilter: (filter: Partial<FilterState>) => void
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  isLoading: false,
  selectedGoalId: null,
  lastUpdated: null,
  filter: { tab: 'all', sortBy: 'roi' },

  fetchGoals: async () => {
    set({ isLoading: true })
    const res = await fetch('/api/goals')
    const data = await res.json()
    set({ goals: data, isLoading: false, lastUpdated: new Date() })
  },

  updateGoal: async (id, patch) => {
    // Optimistic update
    set(state => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...patch, updatedAt: new Date() } : g)
    }))
    await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  },

  addGoal: async (goal) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    })
    const created = await res.json()
    set(state => ({ goals: [...state.goals, created] }))
  },

  selectGoal: (id) => set({ selectedGoalId: id }),

  setFilter: (filter) =>
    set(state => ({ filter: { ...state.filter, ...filter } })),
}))
