export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { topNextBestActions, stalledGoals, roiScore } from '@/lib/scoring'
import type { Goal } from '@/types'

export default async function DashboardPage() {
  let goals: Goal[] = []
  let dbError = false

  try {
    const raw = await prisma.goal.findMany({
      where: { deletedAt: null },
      include: { tasks: true },
      orderBy: { updatedAt: 'desc' },
    })
    goals = raw as unknown as Goal[]
  } catch {
    dbError = true
  }

  const topActions = topNextBestActions(goals, 3)
  const stalled = stalledGoals(goals, 7)
  const completed = goals.filter(g => g.status === 'COMPLETED').length
  const avgROI = goals.length
    ? Math.round((goals.reduce((s, g) => s + roiScore(g.impact, g.effort), 0) / goals.length) * 10) / 10
    : 0

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Supply chain command center</h1>
        <p className="text-sm text-gray-500 mt-1">Personal AI Chief of Staff · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {dbError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <strong>Database not connected.</strong> Add your Supabase credentials to <code>.env</code> then run <code>npm run db:push</code> and <code>npm run db:seed</code>.
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total goals', value: goals.length },
          { label: 'Completed', value: `${completed}/${goals.length}` },
          { label: 'Stalled', value: stalled.length },
          { label: 'Avg ROI score', value: avgROI },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{m.label}</p>
            <p className="text-2xl font-medium text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Next Best Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Next best actions</h2>
        {topActions.map((g, i) => (
          <div key={g.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{g.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{g.nextAction}</p>
              <span className="inline-block mt-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">ROI {roiScore(g.impact, g.effort)}</span>
            </div>
          </div>
        ))}
        {topActions.length === 0 && (
          <p className="text-sm text-gray-400">Seed the database to see recommendations.</p>
        )}
      </div>

      {/* Goals Grid */}
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">All goals</h2>
      <div className="grid grid-cols-2 gap-4">
        {goals.map(g => (
          <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-gray-900 leading-tight">{g.name}</p>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded ml-2 flex-shrink-0">ROI {roiScore(g.impact, g.effort)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${g.completion}%` }} />
            </div>
            <p className="text-xs text-gray-400">{g.completion}% · {g.timeline}</p>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded px-2 py-1">{g.nextAction}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
