export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { topNextBestActions, stalledGoals, roiScore } from '@/lib/scoring'
import type { Goal } from '@/types'

const statusLabel: Record<string, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS:  'In Progress',
  BLOCKED:      'Blocked',
  COMPLETED:    'Completed',
}

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
  const stalled    = stalledGoals(goals, 7)
  const completed  = goals.filter(g => g.status === 'COMPLETED').length
  const avgROI     = goals.length
    ? Math.round((goals.reduce((s, g) => s + roiScore(g.impact, g.effort), 0) / goals.length) * 10) / 10
    : 0

  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="db-title" style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Supply Chain Command Center
        </h1>
        <p className="db-subtitle" style={{ fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: 400 }}>
          Personal AI Chief of Staff · {now}
        </p>
      </div>

      {/* DB error */}
      {dbError && (
        <div className="db-card db-warning" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <strong>Database not connected.</strong> Add Supabase credentials to <code>.env</code> then run <code>npm run db:push</code> and <code>npm run db:seed</code>.
        </div>
      )}

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Goals',   value: goals.length,             icon: '◎' },
          { label: 'Completed',     value: `${completed}/${goals.length}`, icon: '✓' },
          { label: 'Stalled',       value: stalled.length,           icon: '⏸' },
          { label: 'Avg ROI Score', value: avgROI,                   icon: '⚡' },
        ].map(m => (
          <div key={m.label} className="db-card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
            <div className="db-subtitle" style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{m.icon}</div>
            <div className="db-value" style={{ fontSize: '1.9rem', fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
            <div className="db-label" style={{ fontSize: '0.7rem', fontWeight: 500, marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Next Best Actions */}
      <div className="db-card" style={{ marginBottom: '1.75rem' }}>
        <h2 className="db-section-label" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem', margin: '0 0 1rem' }}>
          ⚡ Next Best Actions
        </h2>
        {topActions.length === 0 && (
          <p className="db-muted" style={{ fontSize: '0.85rem' }}>Seed the database to see AI recommendations.</p>
        )}
        {topActions.map((g, i) => (
          <div key={g.id} className="db-divider" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', paddingTop: i === 0 ? 0 : '0.9rem', paddingBottom: '0.9rem', borderBottom: i < topActions.length - 1 ? '1px solid' : 'none' }}>
            <span className="db-badge-nba" style={{ marginTop: '0.1rem' }}>{i + 1}</span>
            <div style={{ flex: 1 }}>
              <p className="db-body" style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{g.name}</p>
              <p className="db-muted" style={{ fontSize: '0.78rem', margin: '0.2rem 0 0' }}>{g.nextAction}</p>
              <span className="db-badge-roi">ROI {roiScore(g.impact, g.effort)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Goals grid */}
      <h2 className="db-section-label" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>
        ◎ All Goals
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
        {goals.map(g => (
          <div key={g.id} className="db-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
              <p className="db-body" style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0, lineHeight: 1.3, flex: 1 }}>{g.name}</p>
              <span className="db-badge-roi" style={{ marginTop: 0, marginLeft: '0.5rem', flexShrink: 0 }}>ROI {roiScore(g.impact, g.effort)}</span>
            </div>

            {/* Progress bar */}
            <div className="db-progress-bg" style={{ height: '3px', borderRadius: '999px', marginBottom: '0.5rem', overflow: 'hidden' }}>
              <div className="db-progress-fill" style={{ height: '100%', width: `${g.completion}%`, borderRadius: '999px', transition: 'width 0.6s ease' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span className="db-muted" style={{ fontSize: '0.7rem' }}>{g.completion}% · {g.timeline}</span>
              <span className="db-label" style={{ fontSize: '0.65rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{statusLabel[g.status] ?? g.status}</span>
            </div>

            <p className="db-muted" style={{ fontSize: '0.75rem', margin: 0, lineHeight: 1.4, paddingTop: '0.5rem', borderTopWidth: '1px', borderTopStyle: 'solid', opacity: 0.9 }}>{g.nextAction}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
